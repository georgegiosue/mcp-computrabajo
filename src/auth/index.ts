import { AuthorizationError } from "@cloudflare/workers-oauth-provider";
import { name, version } from "../../package.json";
import { DEFAULT_COUNTRY } from "../config/api";
import { json, withCors } from "../shared/cors";
import { renderConsentPage } from "./consent";
import { checkCookieInput } from "./cookie-input";
import { ERROR_PAGE, type Lang, pickLang } from "./i18n";

const MCP_PATH = "/mcp";
const AUTHORIZE_PATH = "/authorize";

function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

async function handleAuthorize(request: Request, env: Env): Promise<Response> {
  const oauthRequest = await env.OAUTH_PROVIDER.parseAuthRequest(request);
  const client = await env.OAUTH_PROVIDER.lookupClient(oauthRequest.clientId);
  const clientName = client?.clientName || client?.clientId || "MCP client";
  const action = new URL(request.url).search;
  const lang = pickLang(request.headers.get("accept-language"));

  if (request.method === "GET") {
    return html(renderConsentPage({ clientName, action, lang }));
  }

  const form = await request.formData();
  const grant = form.get("grant");
  const pasted = form.get("cookies");
  let cookies: string | undefined;

  if (grant === "full") {
    const checked = checkCookieInput(typeof pasted === "string" ? pasted : "");

    if (!checked.ok) {
      return html(
        renderConsentPage({ clientName, action, lang, error: checked.error }),
        400,
      );
    }

    cookies = checked.cookies;
  }

  const { redirectTo } = await env.OAUTH_PROVIDER.completeAuthorization({
    request: oauthRequest,
    userId: crypto.randomUUID(),
    metadata: { clientName },
    scope: oauthRequest.scope,
    props: { cookies, defaultCountry: DEFAULT_COUNTRY },
  });

  return Response.redirect(redirectTo, 302);
}

function authorizationErrorResponse(error: unknown, lang: Lang): Response {
  if (error instanceof AuthorizationError && error.redirectUri) {
    const target = new URL(error.redirectUri);
    target.searchParams.set("error", error.code);
    target.searchParams.set("error_description", error.description);
    if (error.state) target.searchParams.set("state", error.state);
    if (error.issuer) target.searchParams.set("iss", error.issuer);

    return Response.redirect(target.toString(), 302);
  }

  const t = ERROR_PAGE[lang];
  const description = (
    error instanceof AuthorizationError
      ? error.description
      : error instanceof Error
        ? error.message
        : t.title
  ).replace(/[<>&"]/g, "");

  return html(
    `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t.title}</title></head>
<body style="font:15px/1.55 ui-sans-serif,system-ui,sans-serif;padding:32px;max-width:520px;margin:0 auto">
<h1 style="font-size:20px">${t.title}</h1>
<p>${description}</p>
<p style="color:#6b7280;font-size:13px">${t.hint}</p>
</body></html>`,
    400,
  );
}

export const AuthHandler = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }));
    }

    if (pathname === AUTHORIZE_PATH) {
      if (request.method !== "GET" && request.method !== "POST") {
        return json({ error: "Method not allowed" }, 405);
      }

      try {
        return await handleAuthorize(request, env);
      } catch (error) {
        return authorizationErrorResponse(
          error,
          pickLang(request.headers.get("accept-language")),
        );
      }
    }

    if (pathname === "/" && request.method === "GET") {
      return json({ name, version, endpoint: MCP_PATH });
    }

    return json({ error: `Not found: ${pathname}` }, 404);
  },
};

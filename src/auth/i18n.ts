import type { CookieError } from "./cookie-input";

export type Lang = "es" | "en";

export function pickLang(acceptLanguage: string | null): Lang {
  if (!acceptLanguage) return "es";

  const preferred = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="))
        ?.slice(2);
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q) : 1 };
    })
    .filter((entry) => entry.tag && !Number.isNaN(entry.q))
    .sort((a, b) => b.q - a.q)
    .find((entry) => entry.tag.startsWith("es") || entry.tag.startsWith("en"));

  return preferred?.tag.startsWith("en") ? "en" : "es";
}

export const ERROR_PAGE: Record<Lang, { title: string; hint: string }> = {
  es: {
    title: "No se pudo autorizar",
    hint: "Elimina el conector y vuelve a agregarlo. Si sigue fallando, el cliente envió una solicitud de autorización que este servidor no pudo validar.",
  },
  en: {
    title: "Authorization failed",
    hint: "Remove the connector and add it again. If it keeps failing, the client sent an authorization request this server could not validate.",
  },
};

type Copy = {
  htmlLang: string;
  title: string;
  heading: string;
  lead: (client: string) => string;
  label: string;
  optional: string;
  placeholder: string;
  why: string;
  helpSummary: string;
  help1: string;
  help2: string;
  authorize: string;
  skip: string;
  footer: string;
  errors: Record<CookieError, string>;
};

export const COPY: Record<Lang, Copy> = {
  es: {
    htmlLang: "es",
    title: "Conectar Computrabajo",
    heading: "Conectar Computrabajo",
    lead: (client) =>
      `<b>${client}</b> quiere buscar ofertas de empleo por ti.`,
    label: "Cookie de sesión",
    optional: "opcional",
    placeholder: "ut=…; uca=…; ASP.NET_SessionId=…",
    why: "Solo se necesita para leer tu CV y postular. Buscar funciona sin ella.",
    helpSummary: "¿Cómo la obtengo?",
    help1:
      "Inicia sesión en Computrabajo, abre DevTools &rarr; <kbd>Network</kbd>, recarga la página, haz clic en la primera petición y copia el valor completo de <kbd>Cookie</kbd> en Request Headers.",
    help2:
      "Es una línea larga con varios pares <kbd>nombre=valor</kbd>. Un solo valor copiado del panel Application no sirve.",
    authorize: "Autorizar",
    skip: "Solo buscar",
    footer:
      "Se guarda cifrada para esta conexión, se usa solo para lo que pidas y se borra al desconectar. Quien tenga tu cookie puede actuar como tú: pega únicamente la tuya.",
    errors: {
      empty:
        "Pega tu cookie de Computrabajo, o elige «Solo buscar» para conectarte sin ella.",
      "not-a-cookie-string":
        "Eso parece el valor de una sola cookie, no la cadena completa. Copia todo el header Cookie: contiene varios pares nombre=valor separados por «; », por ejemplo «ut=…; uca=…; ASP.NET_SessionId=…».",
      "missing-session":
        "Falta la cookie ASP.NET_SessionId. Copia el header Cookie completo en vez de cookies sueltas del panel Application.",
      "missing-identity":
        "ASP.NET_SessionId por sí sola no te identifica ante Computrabajo: faltan las cookies «ut» y «uca». Copia el header Cookie completo de una petición a candidato.computrabajo.com con la sesión abierta.",
    },
  },
  en: {
    htmlLang: "en",
    title: "Connect Computrabajo",
    heading: "Connect Computrabajo",
    lead: (client) => `<b>${client}</b> wants to search job listings for you.`,
    label: "Session cookie",
    optional: "optional",
    placeholder: "ut=…; uca=…; ASP.NET_SessionId=…",
    why: "Needed only to read your CV and apply. Search works without it.",
    helpSummary: "How do I find it?",
    help1:
      "Sign in to Computrabajo, open DevTools &rarr; <kbd>Network</kbd>, reload the page, click the first request, and copy the full <kbd>Cookie</kbd> value under Request Headers.",
    help2:
      "It is one long line with several <kbd>name=value</kbd> pairs. A single value copied from the Application panel will not work.",
    authorize: "Authorize",
    skip: "Search only",
    footer:
      "Stored encrypted for this connection, used only for actions you ask for, and erased when you disconnect. Anyone with your cookie can act as you — only paste your own.",
    errors: {
      empty:
        "Paste your Computrabajo cookie, or choose “Search only” to connect without one.",
      "not-a-cookie-string":
        "That looks like a single cookie value, not a cookie string. Copy the whole Cookie header — it contains several name=value pairs separated by “; ”, for example “ut=…; uca=…; ASP.NET_SessionId=…”.",
      "missing-session":
        "The ASP.NET_SessionId cookie is missing. Copy the entire Cookie header rather than individual cookies from the Application panel.",
      "missing-identity":
        "ASP.NET_SessionId alone does not identify you to Computrabajo — the “ut” and “uca” cookies are missing. Copy the entire Cookie header from a request to candidato.computrabajo.com while signed in.",
    },
  },
};

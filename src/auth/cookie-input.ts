const REQUIRED_COOKIE = "asp.net_sessionid";

const IDENTITY_COOKIES = ["uca", "ut"];

export type CookieError =
  | "empty"
  | "not-a-cookie-string"
  | "missing-session"
  | "missing-identity";

export type CookieCheck =
  | { ok: true; cookies: string }
  | { ok: false; error: CookieError };

function pairs(raw: string): Map<string, string> {
  const found = new Map<string, string>();

  for (const part of raw.split(";")) {
    const eq = part.indexOf("=");
    if (eq <= 0) continue;
    const name = part.slice(0, eq).trim().toLowerCase();
    if (name) found.set(name, part.slice(eq + 1).trim());
  }

  return found;
}

export function checkCookieInput(raw: string): CookieCheck {
  const cookies = raw.trim().replace(/^Cookie:\s*/i, "");

  if (!cookies) return { ok: false, error: "empty" };

  const found = pairs(cookies);

  if (found.size === 0) return { ok: false, error: "not-a-cookie-string" };

  if (!found.has(REQUIRED_COOKIE)) {
    return { ok: false, error: "missing-session" };
  }

  if (!IDENTITY_COOKIES.some((name) => found.has(name))) {
    return { ok: false, error: "missing-identity" };
  }

  return { ok: true, cookies };
}

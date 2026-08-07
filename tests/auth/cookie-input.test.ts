import { describe, expect, test } from "bun:test";
import { checkCookieInput } from "../../src/auth/cookie-input";
import { COPY, pickLang } from "../../src/auth/i18n";

const VALID =
  "_pcid=abc; ut=4931918BAC; uca=i=541F41A2&n=Ada; ASP.NET_SessionId=iwpkuhtd0he3; __RequestVerificationToken=odp0SL";

describe("checkCookieInput", () => {
  test("accepts a full Cookie header", () => {
    expect(checkCookieInput(VALID)).toEqual({ ok: true, cookies: VALID });
  });

  test("strips a pasted 'Cookie:' prefix", () => {
    expect(checkCookieInput(`Cookie: ${VALID}`)).toEqual({
      ok: true,
      cookies: VALID,
    });
  });

  test("rejects a bare session value copied from the Application panel", () => {
    expect(checkCookieInput("iwpkuhtd0he3veczspwjzzst")).toEqual({
      ok: false,
      error: "not-a-cookie-string",
    });
  });

  test("rejects when the session cookie is absent", () => {
    expect(checkCookieInput("ut=abc; uca=i=541F")).toEqual({
      ok: false,
      error: "missing-session",
    });
  });

  test("rejects the session cookie on its own", () => {
    expect(checkCookieInput("ASP.NET_SessionId=iwpkuhtd0he3")).toEqual({
      ok: false,
      error: "missing-identity",
    });
  });

  test("accepts either identity cookie", () => {
    expect(checkCookieInput("ut=abc; ASP.NET_SessionId=x").ok).toBe(true);
    expect(checkCookieInput("uca=i=1; ASP.NET_SessionId=x").ok).toBe(true);
  });

  test("is case-insensitive about cookie names", () => {
    expect(checkCookieInput("UT=abc; asp.net_sessionid=x").ok).toBe(true);
  });

  test("rejects empty input", () => {
    expect(checkCookieInput("   ")).toEqual({ ok: false, error: "empty" });
  });
});

describe("pickLang", () => {
  test("defaults to Spanish when no header is sent", () => {
    expect(pickLang(null)).toBe("es");
  });

  test("follows an explicit Spanish preference", () => {
    expect(pickLang("es-PE,es;q=0.9,en;q=0.8")).toBe("es");
  });

  test("follows an explicit English preference", () => {
    expect(pickLang("en-US,en;q=0.9")).toBe("en");
  });

  test("honours quality values over ordering", () => {
    expect(pickLang("en;q=0.4,es;q=0.9")).toBe("es");
    expect(pickLang("es;q=0.3,en;q=0.7")).toBe("en");
  });

  test("falls back to Spanish for unrelated languages", () => {
    expect(pickLang("fr-FR,de;q=0.8")).toBe("es");
  });
});

describe("COPY", () => {
  test("both languages cover every cookie error code", () => {
    const codes = [
      "empty",
      "not-a-cookie-string",
      "missing-session",
      "missing-identity",
    ] as const;

    for (const lang of ["es", "en"] as const) {
      for (const code of codes) {
        expect(COPY[lang].errors[code]?.length ?? 0).toBeGreaterThan(20);
      }
    }
  });
});

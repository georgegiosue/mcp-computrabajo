import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export type CountryCode = "pe" | "co" | "mx" | "ar" | "cl" | "ec";

const DEFAULT_COOKIE_FILE = join(homedir(), ".computrabajo", "cookies.txt");

function getCookies(): string | undefined {
  const envCookies = process.env.CT_COOKIES;
  if (envCookies) return envCookies;

  const cookieFile = process.env.CT_COOKIES_FILE || DEFAULT_COOKIE_FILE;
  if (existsSync(cookieFile)) {
    return readFileSync(cookieFile, "utf-8").trim();
  }

  return undefined;
}

function requireCookies(): string {
  const cookies = getCookies();
  if (!cookies) {
    throw new Error(
      "No cookies found. Run 'bun run auth' to login, or set CT_COOKIES env var.",
    );
  }
  return cookies;
}

function getDefaultCountry(): CountryCode {
  return (process.env.CT_COUNTRY as CountryCode) || "pe";
}

export const api = {
  getCookies,
  requireCookies,
  getDefaultCountry,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
    "Accept-Language": "es-PE,es;q=0.9,en-US;q=0.8,en;q=0.7",
  },
};

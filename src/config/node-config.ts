import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  type ComputrabajoConfig,
  type CountryCode,
  DEFAULT_COUNTRY,
  isCountryCode,
} from "./api";

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

function getDefaultCountry(): CountryCode {
  const country = process.env.CT_COUNTRY;

  return country && isCountryCode(country) ? country : DEFAULT_COUNTRY;
}

export function loadConfig(): ComputrabajoConfig {
  return {
    cookies: getCookies(),
    defaultCountry: getDefaultCountry(),
  };
}

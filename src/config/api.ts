export const COUNTRY_CODES = ["pe", "co", "mx", "ar", "cl", "ec"] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];

export const DEFAULT_COUNTRY: CountryCode = "pe";

export type ComputrabajoConfig = {
  cookies?: string;
  defaultCountry: CountryCode;
};

export function isCountryCode(value: string): value is CountryCode {
  return (COUNTRY_CODES as readonly string[]).includes(value);
}

export const api = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
    "Accept-Language": "es-PE,es;q=0.9,en-US;q=0.8,en;q=0.7",
  },
};

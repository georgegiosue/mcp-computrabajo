export type CountryCode = "pe" | "co" | "mx" | "ar" | "cl" | "ec";

function getCookies(): string {
  const cookies = process.env.CT_COOKIES;
  if (!cookies) {
    throw new Error(
      "CT_COOKIES environment variable is required. Export your Computrabajo session cookies.",
    );
  }
  return cookies;
}

function getDefaultCountry(): CountryCode {
  return (process.env.CT_COUNTRY as CountryCode) || "pe";
}

export const api = {
  getCookies,
  getDefaultCountry,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
    "Accept-Language": "es-PE,es;q=0.9,en-US;q=0.8,en;q=0.7",
  },
};

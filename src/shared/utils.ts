import type { CountryCode } from "../config/api";

export function buildSearchUrl(
  country: CountryCode,
  keyword: string,
  location?: string,
  page?: number,
): string {
  const slug = keyword.toLowerCase().replace(/\s+/g, "-");
  let url = `https://${country}.computrabajo.com/trabajo-de-${slug}`;
  if (location) {
    const locSlug = location.toLowerCase().replace(/\s+/g, "-");
    url = `${url}-en-${locSlug}`;
  }
  if (page && page > 1) {
    url = `${url}?p=${page}`;
  }
  return url;
}

export function buildDetailUrl(offerId: string): string {
  return `https://oferta.computrabajo.com/offer/${offerId}/d/j?ipo=3&iapo=1`;
}

export function buildProfileUrl(country: CountryCode): string {
  return `https://candidato.${country}.computrabajo.com/candidate/cv/edit/`;
}

export function buildAttachedCvsUrl(country: CountryCode): string {
  return `https://candidato.${country}.computrabajo.com/candidate/cv/uploadcv`;
}

export function buildApplyUrl(country: CountryCode, offerId: string): string {
  return `https://candidato.${country}.computrabajo.com/candidate/apply/?oi=${offerId}&p=280&idb=1&d=32&lc=ListOffers&d=33`;
}

import { readFileSync } from "node:fs";
import { join } from "node:path";

export function findPackageJson(dir: string): string {
  const candidate = join(dir, "package.json");
  try {
    readFileSync(candidate);
    return candidate;
  } catch {
    const parent = join(dir, "..");
    if (parent === dir) throw new Error("package.json not found");
    return findPackageJson(parent);
  }
}

export function buildSearchUrl(
  country: string,
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

export function buildApplyUrl(country: string, offerId: string): string {
  return `https://candidato.${country}.computrabajo.com/candidate/apply/?oi=${offerId}&p=280&idb=1&d=32&lc=ListOffers&d=33`;
}

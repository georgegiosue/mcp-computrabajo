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
  const allowed = new Set(["pe", "co", "mx", "ar", "cl", "ec"]);
  const c = allowed.has(country) ? country : "pe";
  const slug = encodeURIComponent(keyword.toLowerCase().replace(/\s+/g, "-"));
  let url = `https://${c}.computrabajo.com/trabajo-de-${slug}`;
  if (location) {
    const locSlug = encodeURIComponent(location.toLowerCase().replace(/\s+/g, "-"));
    url = `${url}-en-${locSlug}`;
  }
  if (page && page > 1) {
    url = `${url}?p=${encodeURIComponent(String(page))}`;
  }
  return url;
}

export function buildDetailUrl(offerId: string): string {
  const id = encodeURIComponent(offerId);
  return `https://oferta.computrabajo.com/offer/${id}/d/j?ipo=3&iapo=1`;
}

export function buildApplyUrl(country: string, offerId: string): string {
  const allowed = new Set(["pe", "co", "mx", "ar", "cl", "ec"]);
  const c = allowed.has(country) ? country : "pe";
  const id = encodeURIComponent(offerId);
  return `https://candidato.${c}.computrabajo.com/candidate/apply/?oi=${id}&p=280&idb=1&d=32&lc=ListOffers&d=33`;
}

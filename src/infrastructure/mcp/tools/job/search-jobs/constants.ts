export const TOOL_NAME = "search-jobs";

export const DESCRIPTION =
  "Search for job listings on Computrabajo by keyword and optional location. Returns a list of job offers with title, company, location, salary, and publication date. Use location slugs like 'lima', 'la-libertad-en-trujillo', 'arequipa'. Default country is Peru (pe).";

export const SCHEMA_DESCRIPTIONS = {
  keyword:
    "Job search keyword (e.g. 'software', 'ingeniero-de-sistemas', 'marketing'). Use hyphens for multi-word terms.",
  location:
    "Location slug for filtering results (e.g. 'lima', 'la-libertad-en-trujillo', 'arequipa'). If omitted, searches nationwide.",
  country:
    "Two-letter country code: pe (Peru), co (Colombia), mx (Mexico), ar (Argentina), cl (Chile), ec (Ecuador). Defaults to CT_COUNTRY env or 'pe'.",
  page: "Page number for pagination (starts at 1). Each page returns up to 20 results.",
} as const;

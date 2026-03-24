export const TOOL_NAME = "get-job-detail";

export const DESCRIPTION =
  "Retrieve the full details of a specific job offer on Computrabajo by its offer ID. Returns the complete job description, requirements, company information, salary, benefits, contract type, and more. The offer ID is a 32-character hexadecimal string obtained from search-jobs results.";

export const SCHEMA_DESCRIPTIONS = {
  offerId:
    "The 32-character hexadecimal offer ID (e.g. '7688C0282117AF8561373E686DCF3405'). Obtained from search-jobs results.",
  country:
    "Two-letter country code: pe (Peru), co (Colombia), mx (Mexico), ar (Argentina), cl (Chile), ec (Ecuador). Defaults to CT_COUNTRY env or 'pe'.",
} as const;

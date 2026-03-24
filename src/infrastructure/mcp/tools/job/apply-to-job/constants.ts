export const TOOL_NAME = "apply-to-job";

export const DESCRIPTION =
  "Apply to a job offer on Computrabajo using your authenticated session. This action submits your CV/resume to the employer. Requires valid session cookies in CT_COOKIES environment variable. The offer ID is a 32-character hexadecimal string obtained from search-jobs results.";

export const SCHEMA_DESCRIPTIONS = {
  offerId:
    "The 32-character hexadecimal offer ID to apply to (e.g. '7688C0282117AF8561373E686DCF3405'). Obtained from search-jobs results.",
  country:
    "Two-letter country code: pe (Peru), co (Colombia), mx (Mexico), ar (Argentina), cl (Chile), ec (Ecuador). Defaults to CT_COUNTRY env or 'pe'.",
} as const;

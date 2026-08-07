import { z } from "zod";
import { COUNTRY_CODES } from "../../../config/api";

export const countrySchema = z
  .enum(COUNTRY_CODES)
  .optional()
  .describe(
    "Two-letter country code: pe (Peru), co (Colombia), mx (Mexico), ar (Argentina), cl (Chile), ec (Ecuador). Defaults to the server's configured country ('pe' unless overridden).",
  );

export const offerIdSchema = z
  .string()
  .describe(
    "The 32-character hexadecimal offer ID (e.g. '7688C0282117AF8561373E686DCF3405'). Obtained from search-jobs results.",
  );

import { z } from "zod";
import { SCHEMA_DESCRIPTIONS } from "./constants";

export const inputSchema = {
  keyword: z.string().describe(SCHEMA_DESCRIPTIONS.keyword),
  location: z.string().optional().describe(SCHEMA_DESCRIPTIONS.location),
  country: z.string().optional().describe(SCHEMA_DESCRIPTIONS.country),
  page: z.number().optional().describe(SCHEMA_DESCRIPTIONS.page),
};

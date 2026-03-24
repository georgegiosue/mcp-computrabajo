import { z } from "zod";
import { SCHEMA_DESCRIPTIONS } from "./constants";

export const inputSchema = {
  offerId: z.string().describe(SCHEMA_DESCRIPTIONS.offerId),
  country: z.string().optional().describe(SCHEMA_DESCRIPTIONS.country),
};

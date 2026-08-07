import { z } from "zod";
import { jobDetailSchema } from "../../../../domain/models/computrabajo.model";
import { READ_ONLY } from "../annotations";
import { errorResponse } from "../error";
import type { ToolRegistrar } from "../registrar";
import { countrySchema, offerIdSchema } from "../schemas";

const DESCRIPTION =
  "Retrieve the full details of a specific job offer on Computrabajo by its offer ID. Returns the complete job description, requirements, company information, salary, benefits, contract type, and more. The offer ID is a 32-character hexadecimal string obtained from search-jobs results.";

const inputSchema = z.object({
  offerId: offerIdSchema,
  country: countrySchema,
});

const outputSchema = z.object({
  job: jobDetailSchema,
});

export const register: ToolRegistrar = (server, repository) => {
  server.registerTool(
    "get-job-detail",
    {
      title: "Get Job Detail",
      description: DESCRIPTION,
      inputSchema,
      outputSchema,
      annotations: READ_ONLY,
    },
    async ({ offerId, country }) => {
      try {
        const output = {
          job: await repository.getJobDetail({ offerId, country }),
        };

        return {
          content: [{ type: "text", text: JSON.stringify(output) }],
          structuredContent: output,
        };
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
};

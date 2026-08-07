import { z } from "zod";
import { applicationResultSchema } from "../../../../domain/models/computrabajo.model";
import { WRITE } from "../annotations";
import { errorResponse } from "../error";
import type { ToolRegistrar } from "../registrar";
import { countrySchema, offerIdSchema } from "../schemas";

const DESCRIPTION =
  "Apply to a job offer on Computrabajo using the authenticated session. This action submits the user's CV/resume to the employer and cannot be undone — confirm with the user before calling it. Requires a Computrabajo session cookie: on the remote server this is the cookie pasted when connecting, and locally it is the CT_COOKIES environment variable. The offer ID is a 32-character hexadecimal string obtained from search-jobs results.";

const inputSchema = z.object({
  offerId: offerIdSchema,
  country: countrySchema,
});

export const register: ToolRegistrar = (server, repository) => {
  server.registerTool(
    "apply-to-job",
    {
      title: "Apply to Job",
      description: DESCRIPTION,
      inputSchema,
      outputSchema: applicationResultSchema,
      annotations: WRITE,
    },
    async ({ offerId, country }) => {
      try {
        const output = await repository.applyToJob({ offerId, country });

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

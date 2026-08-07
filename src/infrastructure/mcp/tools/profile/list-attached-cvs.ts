import { z } from "zod";
import { attachedCvSchema } from "../../../../domain/models/computrabajo.model";
import { READ_ONLY } from "../annotations";
import { errorResponse } from "../error";
import type { ToolRegistrar } from "../registrar";
import { countrySchema } from "../schemas";

const DESCRIPTION =
  "List the Word/PDF CV files the authenticated user has uploaded to Computrabajo, and which one is attached to new applications by default. Requires a Computrabajo session cookie.";

const inputSchema = z.object({ country: countrySchema });

const outputSchema = z.object({ cvs: z.array(attachedCvSchema) });

export const register: ToolRegistrar = (server, repository) => {
  server.registerTool(
    "list-attached-cvs",
    {
      title: "List Attached CVs",
      description: DESCRIPTION,
      inputSchema,
      outputSchema,
      annotations: READ_ONLY,
    },
    async ({ country }) => {
      try {
        const output = { cvs: await repository.listAttachedCvs({ country }) };

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

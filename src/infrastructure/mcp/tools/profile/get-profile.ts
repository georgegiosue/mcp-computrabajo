import { z } from "zod";
import { profileSchema } from "../../../../domain/models/computrabajo.model";
import { READ_ONLY } from "../annotations";
import { errorResponse } from "../error";
import type { ToolRegistrar } from "../registrar";
import { countrySchema } from "../schemas";

const DESCRIPTION =
  "Retrieve the authenticated user's own Computrabajo CV: name, headline, contact details, professional summary, work experience, education, languages, and skills. Useful for tailoring a job search or checking what employers see. Requires a Computrabajo session cookie.";

const inputSchema = z.object({ country: countrySchema });

const outputSchema = z.object({ profile: profileSchema });

export const register: ToolRegistrar = (server, repository) => {
  server.registerTool(
    "get-profile",
    {
      title: "Get My Profile",
      description: DESCRIPTION,
      inputSchema,
      outputSchema,
      annotations: READ_ONLY,
    },
    async ({ country }) => {
      try {
        const output = { profile: await repository.getProfile({ country }) };

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

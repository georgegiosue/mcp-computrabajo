import { z } from "zod";
import { jobListingSchema } from "../../../../domain/models/computrabajo.model";
import { READ_ONLY } from "../annotations";
import { errorResponse } from "../error";
import type { ToolRegistrar } from "../registrar";
import { countrySchema } from "../schemas";

const DESCRIPTION =
  "Search for job listings on Computrabajo by keyword and optional location. Returns a list of job offers with title, company, location, salary, and publication date. Computrabajo matches the keyword against the job title fairly literally, so the wording of the keyword decides the quality of the results — see the keyword parameter. Default country is Peru (pe).";

const inputSchema = z.object({
  keyword: z
    .string()
    .describe(
      "Job search keyword as a lowercase, hyphenated slug (e.g. 'desarrollador-de-software', 'analista-programador', 'marketing'). For software and IT roles prefer 'desarrollador-...', 'programador', 'analista-programador', or a bare technology or role noun such as 'software', 'java', 'devops'. Avoid 'ingeniero-de-...' for software work: in Latin America that phrasing matches civil, mechanical, electrical and mining postings, so 'ingeniero-de-software' returns mostly irrelevant results. If a search comes back off-topic, retry with a 'desarrollador-' or bare-noun form before telling the user there is nothing.",
    ),
  location: z
    .string()
    .optional()
    .describe(
      "Location slug for filtering results (e.g. 'lima', 'la-libertad-en-trujillo', 'arequipa'). If omitted, searches nationwide.",
    ),
  country: countrySchema,
  page: z
    .number()
    .optional()
    .describe(
      "Page number for pagination (starts at 1). Each page returns up to 20 results.",
    ),
});

const outputSchema = z.object({
  jobs: z.array(jobListingSchema),
});

export const register: ToolRegistrar = (server, repository) => {
  server.registerTool(
    "search-jobs",
    {
      title: "Search Jobs",
      description: DESCRIPTION,
      inputSchema,
      outputSchema,
      annotations: READ_ONLY,
    },
    async ({ keyword, location, country, page }) => {
      try {
        const output = {
          jobs: await repository.searchJobs({
            keyword,
            location,
            country,
            page,
          }),
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

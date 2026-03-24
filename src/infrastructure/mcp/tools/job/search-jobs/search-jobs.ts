import { errorResponse } from "../../error";
import type { Tool } from "../../tool";
import { DESCRIPTION, TOOL_NAME } from "./constants";
import { inputSchema } from "./schema";
import type { Params } from "./types";

export const tool: Tool<Params> = {
  name: TOOL_NAME,
  config: { description: DESCRIPTION, inputSchema },
  async handler({ keyword, location, country, page }, repository) {
    try {
      const jobs = await repository.searchJobs({
        keyword,
        location,
        country,
        page,
      });
      return { content: [{ type: "text", text: JSON.stringify(jobs) }] };
    } catch (error) {
      return errorResponse(error);
    }
  },
};

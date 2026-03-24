import { errorResponse } from "../../error";
import type { Tool } from "../../tool";
import { DESCRIPTION, TOOL_NAME } from "./constants";
import { inputSchema } from "./schema";
import type { Params } from "./types";

export const tool: Tool<Params> = {
  name: TOOL_NAME,
  config: { description: DESCRIPTION, inputSchema },
  async handler({ offerId, country }, repository) {
    try {
      const detail = await repository.getJobDetail({ offerId, country });
      return { content: [{ type: "text", text: JSON.stringify(detail) }] };
    } catch (error) {
      return errorResponse(error);
    }
  },
};

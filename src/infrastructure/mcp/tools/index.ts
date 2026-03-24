import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ComputrabajoRepository } from "../../../domain/ports/computrabajo.repository";
import { tool as applyToJob } from "./job/apply-to-job/apply-to-job";
import { tool as getJobDetail } from "./job/get-job-detail/get-job-detail";
import { tool as searchJobs } from "./job/search-jobs/search-jobs";
import { register, type Tool } from "./tool";

const tools = [searchJobs, getJobDetail, applyToJob];

export async function registerTools(
  server: McpServer,
  repository: ComputrabajoRepository,
) {
  for (const tool of tools as Tool<unknown>[]) {
    register(server, repository, tool);
  }
}

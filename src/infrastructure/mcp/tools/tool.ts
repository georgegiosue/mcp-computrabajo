import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { ComputrabajoRepository } from "../../../domain/ports/computrabajo.repository";

type Handler<TParams> = (
  params: TParams,
  repository: ComputrabajoRepository,
) => Promise<CallToolResult>;

export interface Tool<TParams = Record<string, never>, TConfig = object> {
  name: string;
  config: TConfig;
  handler: Handler<TParams>;
}

export function register(
  server: McpServer,
  repository: ComputrabajoRepository,
  tool: Tool<unknown>,
) {
  server.registerTool(tool.name, tool.config, (params) =>
    tool.handler(params, repository),
  );
}

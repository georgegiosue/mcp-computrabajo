import type { McpServer } from "@modelcontextprotocol/server";
import type { ComputrabajoRepository } from "../../../domain/ports/computrabajo.repository";

export type ToolRegistrar = (
  server: McpServer,
  repository: ComputrabajoRepository,
) => void;

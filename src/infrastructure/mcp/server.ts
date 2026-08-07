import { McpServer } from "@modelcontextprotocol/server";
import type { ComputrabajoRepository } from "../../domain/ports/computrabajo.repository";
import { SERVER_INSTRUCTIONS } from "./instructions";
import { registerTools } from "./tools";

export type PackageJson = { name: string; version: string };

export function createServer(
  pkg: PackageJson,
  repo: ComputrabajoRepository,
): McpServer {
  const server = new McpServer(
    { name: pkg.name, version: pkg.version },
    { instructions: SERVER_INSTRUCTIONS },
  );

  registerTools(server, repo);

  return server;
}

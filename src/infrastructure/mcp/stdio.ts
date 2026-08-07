import {
  type StdioServerHandle,
  serveStdio,
} from "@modelcontextprotocol/server/stdio";
import type { ComputrabajoRepository } from "../../domain/ports/computrabajo.repository";
import { createServer, type PackageJson } from "./server";

export function startServer(
  pkg: PackageJson,
  repo: ComputrabajoRepository,
): StdioServerHandle {
  const handle = serveStdio(() => createServer(pkg, repo), {
    onerror: (error) => console.error(`[${pkg.name}] transport error:`, error),
  });

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => void handle.close());
  }

  console.error(`${pkg.name} v${pkg.version} listening on stdio`);

  return handle;
}

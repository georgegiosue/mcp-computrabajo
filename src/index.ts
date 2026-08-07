#!/usr/bin/env node
import { name, version } from "../package.json";
import { loadConfig } from "./config/node-config";
import { ComputrabajoHttpRepository } from "./infrastructure/http/computrabajo-http.repository";
import { startServer } from "./infrastructure/mcp/stdio";

try {
  startServer({ name, version }, new ComputrabajoHttpRepository(loadConfig()));
} catch (error) {
  console.error("Fatal error:", error);
  process.exit(1);
}

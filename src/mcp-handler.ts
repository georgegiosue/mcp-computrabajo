import { WorkerEntrypoint } from "cloudflare:workers";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { name, version } from "../package.json";
import {
  type ComputrabajoConfig,
  type CountryCode,
  DEFAULT_COUNTRY,
  isCountryCode,
} from "./config/api";
import { ComputrabajoHttpRepository } from "./infrastructure/http/computrabajo-http.repository";
import { createServer } from "./infrastructure/mcp/server";
import { withCors } from "./shared/cors";

export type AuthProps = {
  cookies?: string;
  defaultCountry?: string;
};

function configFrom(props: AuthProps | undefined): ComputrabajoConfig {
  const country = props?.defaultCountry;

  return {
    cookies: props?.cookies,
    defaultCountry:
      country && isCountryCode(country)
        ? (country as CountryCode)
        : DEFAULT_COUNTRY,
  };
}

export class ComputrabajoMcpHandler extends WorkerEntrypoint<Env, AuthProps> {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }));
    }

    const handler = createMcpHandler(
      () =>
        createServer(
          { name, version },
          new ComputrabajoHttpRepository(configFrom(this.ctx.props)),
        ),
      {
        legacy: "stateless",
        onerror: (error) => console.error(`[${name}] transport error:`, error),
      },
    );

    try {
      return withCors(await handler.fetch(request));
    } finally {
      await handler.close();
    }
  }
}

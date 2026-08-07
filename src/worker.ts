import { OAuthProvider } from "@cloudflare/workers-oauth-provider";
import { AuthHandler } from "./auth";
import { ComputrabajoMcpHandler } from "./mcp-handler";

export default new OAuthProvider({
  apiRoute: "/mcp",
  apiHandler: ComputrabajoMcpHandler,
  defaultHandler: AuthHandler,
  authorizeEndpoint: "/authorize",
  tokenEndpoint: "/oauth/token",
  clientRegistrationEndpoint: "/oauth/register",
  clientIdMetadataDocumentEnabled: true,
  scopesSupported: ["mcp"],
});

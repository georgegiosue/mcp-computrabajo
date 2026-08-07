# MCP Computrabajo

MCP server for Computrabajo, Latin America's largest job board: search offers, read the full posting, check your own CV and apply.

[![NPM Version](https://img.shields.io/npm/v/mcp-computrabajo?style=flat&logo=npm&logoColor=red)](https://www.npmjs.com/package/mcp-computrabajo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**English** · [Español](README.es.md)

## Connect

**Claude Desktop and claude.ai** — Settings → Connectors → Add custom connector:

```
https://mcp-computrabajo.georgegiosue.dev/mcp
```

**Claude Code**

```bash
claude mcp add --transport http computrabajo https://mcp-computrabajo.georgegiosue.dev/mcp
```

Connecting opens a page asking for your Computrabajo session cookie. It is only
needed to read your CV and apply — choose **Skip — search only** to connect
without one. The cookie is stored encrypted against that single connection and
discarded when you disconnect.

To get it: sign in to Computrabajo, open DevTools → Network, right-click any
request → Copy as cURL, and copy the value after `-b`. Anyone holding that
cookie can act as you, so only paste one you generated yourself.

## What it looks like

> **You:** Find backend jobs in Lima that actually match my CV.

> **Claude:** Your CV is Full Stack — Rust, TypeScript, Angular, SQL Server, four years in. Of the 20 openings in Lima, 6 line up. The closest is Arquitecto de Software at EDPYME Inversiones La Cruz, posted 2 hours ago, hybrid in San Isidro. Want the full posting?

> **You:** Yes, and what's it pay?

> **Claude:** No salary listed. It wants 5 years and a systems degree — you have the degree, you're a year short on experience. 2 vacancies, permanent contract.

> **You:** Apply to it.

> **Claude:** That submits MI_CV.pdf, your default CV, and can't be undone. Confirm?

## Tools

| Tool | Does | Takes |
|------|------|-------|
| `search-jobs` | Search offers by keyword and location | `keyword`, `location?`, `country?`, `page?` |
| `get-job-detail` | Full posting: description, salary, benefits, company | `offerId`, `country?` |
| `get-profile` | Your CV: summary, experience, studies, languages, skills | `country?` |
| `list-attached-cvs` | Your uploaded Word/PDF CVs and which is the default | `country?` |
| `apply-to-job` | Submit your CV to an offer | `offerId`, `country?` |

`get-profile`, `list-attached-cvs` and `apply-to-job` need the session cookie;
searching does not. `country` is one of `pe`, `co`, `mx`, `ar`, `cl`, `ec` and
defaults to `pe`.

Keywords and locations are lowercase hyphenated slugs — `desarrollador-de-software`,
`la-libertad-en-trujillo`. Computrabajo matches the keyword against the job title,
so wording matters: for tech roles use `desarrollador-...`, `programador`,
`analista-programador` or a bare noun like `software`. Avoid `ingeniero-de-software`
— in Latin America that phrasing pulls civil, mechanical and mining postings.

## Run it yourself

The npm package ships the same server over stdio:

```bash
claude mcp add computrabajo --env CT_COOKIES="<your cookie>" -- npx mcp-computrabajo@latest
```

| Variable | Default | Description |
|----------|---------|-------------|
| `CT_COOKIES` | — | Cookie string from your browser session |
| `CT_COOKIES_FILE` | `~/.computrabajo/cookies.txt` | File holding the cookie instead |
| `CT_COUNTRY` | `pe` | Default country code |

## Development

```bash
bun install
bun run typecheck      # both entries: stdio and Worker
bun test
bun run inspect        # MCP Inspector against the stdio server
bun run dev:worker     # Worker on http://localhost:8787/mcp
bun run deploy         # needs `wrangler login`
```

First deploy only — create the KV namespace backing the OAuth grants and put its
id in `wrangler.jsonc`:

```bash
bunx wrangler kv namespace create OAUTH_KV
```

## Upgrading from 0.x

v1.0.0 is a breaking release: tool results are now wrapped (`{ jobs: [...] }`,
`{ job: {...} }`) and exposed as MCP `structuredContent`; `country` is an enum
rather than a free string; the server is built on MCP SDK v2; and the internal
`Tool` wrapper, `findPackageJson` and `api.getCookies()` helpers are gone. Tool
names and environment variables are unchanged.

`apply-to-job` also reports honestly now. 0.x returned `success: true` for any
HTTP 2xx, including responses where Computrabajo had refused the application;
it now reports success only on the site's own `OfferAppliedOk` result code.

## License

MIT — see [LICENSE](LICENSE). Not affiliated with Computrabajo. Issues and
questions: [GitHub Issues](https://github.com/georgegiosue/mcp-computrabajo/issues).

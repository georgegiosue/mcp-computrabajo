# MCP Computrabajo

Servidor MCP para Computrabajo, la bolsa de empleo más grande de Latinoamérica: busca ofertas, lee la publicación completa, consulta tu propio CV y postula.

[![NPM Version](https://img.shields.io/npm/v/mcp-computrabajo?style=flat&logo=npm&logoColor=red)](https://www.npmjs.com/package/mcp-computrabajo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](README.md) · **Español**

## Conectar

**Claude Desktop y claude.ai** — Configuración → Conectores → Agregar conector personalizado:

```
https://mcp-computrabajo.georgegiosue.dev/mcp
```

**Claude Code**

```bash
claude mcp add --transport http computrabajo https://mcp-computrabajo.georgegiosue.dev/mcp
```

Al conectar se abre una página que pide tu cookie de sesión de Computrabajo.
Solo se necesita para leer tu CV y postular — elige **Skip — search only** para
conectarte sin ella. La cookie se guarda cifrada y asociada únicamente a esa
conexión, y se descarta cuando la desconectas.

Para obtenerla: inicia sesión en Computrabajo, abre DevTools → Network, haz clic
derecho en cualquier petición → Copiar como cURL, y copia el valor después de
`-b`. Quien tenga esa cookie puede actuar como tú, así que pega solo una que
hayas generado tú.

## Cómo se ve

> **Tú:** Busca trabajos de backend en Lima que realmente encajen con mi CV.

> **Claude:** Tu CV es Full Stack — Rust, TypeScript, Angular, SQL Server, cuatro años. De las 20 vacantes en Lima, 6 calzan. La más cercana es Arquitecto de Software en EDPYME Inversiones La Cruz, publicada hace 2 horas, híbrido en San Isidro. ¿Te muestro la publicación completa?

> **Tú:** Sí, ¿y cuánto paga?

> **Claude:** No indica sueldo. Pide 5 años y título en sistemas — tienes el título, te falta un año de experiencia. 2 vacantes, contrato indefinido.

> **Tú:** Postula.

> **Claude:** Eso envía MI_CV.pdf, tu CV predeterminado, y no se puede deshacer. ¿Confirmas?

## Herramientas

| Herramienta | Qué hace | Recibe |
|-------------|----------|--------|
| `search-jobs` | Busca ofertas por palabra clave y ubicación | `keyword`, `location?`, `country?`, `page?` |
| `get-job-detail` | Publicación completa: descripción, sueldo, beneficios, empresa | `offerId`, `country?` |
| `get-profile` | Tu CV: resumen, experiencia, estudios, idiomas, habilidades | `country?` |
| `list-attached-cvs` | Tus CVs en Word/PDF subidos y cuál es el predeterminado | `country?` |
| `apply-to-job` | Envía tu CV a una oferta | `offerId`, `country?` |

`get-profile`, `list-attached-cvs` y `apply-to-job` necesitan la cookie de
sesión; buscar no. `country` es uno de `pe`, `co`, `mx`, `ar`, `cl`, `ec` y por
defecto es `pe`.

Las palabras clave y ubicaciones son slugs en minúscula con guiones —
`desarrollador-de-software`, `la-libertad-en-trujillo`. Computrabajo compara la
palabra clave contra el título del puesto, así que la redacción importa: para
roles técnicos usa `desarrollador-...`, `programador`, `analista-programador` o
un sustantivo suelto como `software`. Evita `ingeniero-de-software` — en
Latinoamérica esa forma trae avisos de civil, mecánica y minería.

## Ejecutarlo tú mismo

El paquete de npm publica el mismo servidor por stdio:

```bash
claude mcp add computrabajo --env CT_COOKIES="<tu cookie>" -- npx mcp-computrabajo@latest
```

| Variable | Default | Descripción |
|----------|---------|-------------|
| `CT_COOKIES` | — | Cadena de cookies de tu sesión del navegador |
| `CT_COOKIES_FILE` | `~/.computrabajo/cookies.txt` | Archivo con la cookie, como alternativa |
| `CT_COUNTRY` | `pe` | Código de país por defecto |

## Desarrollo

```bash
bun install
bun run typecheck      # ambas entradas: stdio y Worker
bun test
bun run inspect        # MCP Inspector contra el servidor stdio
bun run dev:worker     # Worker en http://localhost:8787/mcp
bun run deploy         # requiere `wrangler login`
```

Solo la primera vez — crea el namespace de KV que respalda los permisos OAuth y
coloca su id en `wrangler.jsonc`:

```bash
bunx wrangler kv namespace create OAUTH_KV
```

## Migrar desde 0.x

La v1.0.0 trae cambios incompatibles: los resultados vienen envueltos
(`{ jobs: [...] }`, `{ job: {...} }`) y se exponen como `structuredContent` de
MCP; `country` es un enum en vez de una cadena libre; el servidor está construido
sobre el SDK v2 de MCP; y desaparecen el envoltorio `Tool`, `findPackageJson` y
los helpers `api.getCookies()`. Los nombres de las herramientas y las variables
de entorno no cambian.

`apply-to-job` además ahora reporta con honestidad. La 0.x devolvía
`success: true` ante cualquier HTTP 2xx, incluso cuando Computrabajo había
rechazado la postulación; ahora solo reporta éxito con el código `OfferAppliedOk`
del propio sitio.

## Licencia

MIT — ver [LICENSE](LICENSE). Sin afiliación con Computrabajo. Dudas y
problemas: [GitHub Issues](https://github.com/georgegiosue/mcp-computrabajo/issues).

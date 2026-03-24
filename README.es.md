# ![MCP Logo](https://avatars.githubusercontent.com/u/182288589?s=26&v=4) MCP Computrabajo

> Un servidor del Protocolo de Contexto de Modelo (MCP) para buscar y postular a empleos en Computrabajo, la bolsa de trabajo más grande de Latinoamérica

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=flat&logo=bun&logoColor=white)](https://bun.sh)
[![MCP](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-blue)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

- **English**: [README.md](README.md)
- **Español**: [README.es.md](README.es.md) (Estás aquí)

**MCP Computrabajo** es un servidor del Protocolo de Contexto de Modelo que proporciona a los asistentes de IA acceso a las ofertas de empleo de [Computrabajo](https://www.computrabajo.com/). Busca empleos, consulta detalles completos y postula — todo a través de herramientas MCP estandarizadas.

---

## ¿Qué puedes hacer con este MCP?

- **Buscar ofertas de empleo** por palabra clave y ubicación en múltiples países
- **Ver detalles completos** incluyendo descripción, requisitos, salario, beneficios e información de la empresa
- **Postular a empleos** directamente usando tu sesión autenticada de Computrabajo

---

## Inicio Rápido

### Requisitos previos

- [Bun](https://bun.sh) v1.2.10+ o Node.js v18+
- Un cliente compatible con MCP (Claude Desktop, Claude Code, etc.)
- Una cuenta en [Computrabajo](https://www.computrabajo.com/) con cookies de sesión activas

### Obtener tus cookies de sesión

1. Inicia sesión en [Computrabajo](https://www.computrabajo.com/) desde tu navegador
2. Abre DevTools (F12) → pestaña Red (Network)
3. Navega a cualquier página de Computrabajo
4. Clic derecho en una solicitud → Copiar como cURL
5. Extrae la cadena de cookies del flag `-b` o `--cookie`

### Opción 1: Claude Desktop

Abre el archivo de configuración de Claude Desktop:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "computrabajo": {
      "command": "bun",
      "args": ["/ruta/absoluta/a/mcp-computrabajo/src/index.ts"],
      "env": {
        "CT_COOKIES": "ut=...; uca=...; ncac=...; nca=...; trl=...",
        "CT_COUNTRY": "pe"
      }
    }
  }
}
```

### Opción 2: Claude Code

```bash
claude mcp add computrabajo \
  -e CT_COOKIES="ut=...; uca=...; ncac=...; nca=...; trl=..." \
  -e CT_COUNTRY="pe" \
  -- bun /ruta/absoluta/a/mcp-computrabajo/src/index.ts
```

### Opción 3: Clonar y ejecutar localmente

```bash
git clone https://github.com/georgegiosue/mcp-computrabajo.git
cd mcp-computrabajo
bun install
```

> **Tip:** Usa el Inspector MCP para depuración: `bun run inspect`

---

## Variables de Entorno

| Variable | Requerida | Default | Descripción |
|----------|-----------|---------|-------------|
| `CT_COOKIES` | Sí | — | Cadena completa de cookies de tu sesión del navegador |
| `CT_COUNTRY` | No | `pe` | Código de país: `pe`, `co`, `mx`, `ar`, `cl`, `ec` |

---

## Herramientas Disponibles

| Herramienta | Descripción | Parámetros |
|-------------|-------------|------------|
| `search-jobs` | Busca ofertas de empleo por palabra clave y ubicación | `keyword`, `location?`, `country?`, `page?` |
| `get-job-detail` | Obtiene los detalles completos de una oferta | `offerId`, `country?` |
| `apply-to-job` | Postula a una oferta de empleo (requiere autenticación) | `offerId`, `country?` |

---

## Ejemplos de Uso

Una vez conectado, puedes preguntarle a Claude de forma natural:

- *"Busca empleos de software en Lima"*
- *"Encuentra trabajos remotos de desarrollador Python en Perú"*
- *"Muéstrame los detalles de esta oferta de trabajo"*
- *"Postúlame a este empleo"*
- *"Busca empleos de marketing en Trujillo, página 2"*

---

## Países Soportados

| Código | País |
|--------|------|
| `pe` | Perú |
| `co` | Colombia |
| `mx` | México |
| `ar` | Argentina |
| `cl` | Chile |
| `ec` | Ecuador |

---

## Estructura del Proyecto

```
mcp-computrabajo/
├── src/
│   ├── config/                        # Configuración de API y manejo de cookies
│   ├── domain/
│   │   ├── models/                    # Interfaces de modelos del dominio
│   │   └── ports/                     # Interfaz del repositorio (contrato)
│   ├── infrastructure/
│   │   ├── http/                      # Repositorio HTTP (fetch + cheerio)
│   │   └── mcp/
│   │       └── tools/
│   │           ├── index.ts           # Registra todas las herramientas
│   │           ├── tool.ts            # Interfaz Tool + helper register()
│   │           ├── error.ts           # errorResponse() compartido
│   │           └── job/
│   │               ├── search-jobs/
│   │               ├── get-job-detail/
│   │               └── apply-to-job/
│   ├── shared/                        # Utilidades compartidas
│   └── index.ts                       # Punto de entrada del servidor MCP
├── package.json
└── tsconfig.json
```

---

## Desarrollo

```bash
# Instalar dependencias
bun install

# Ejecutar con el Inspector MCP
bun run inspect

# Formatear código
bun run format

# Compilar
bun run build
```

---

## Contribuciones

1. Haz fork del repositorio
2. Crea una rama de característica (`git checkout -b feature/nueva-caracteristica`)
3. Formatea tu código (`bun run format`)
4. Confirma tus cambios
5. Abre un Pull Request

---

## Licencia

Licencia MIT - ver [LICENSE](LICENSE) para más detalles.

---

## Reconocimientos

- [Computrabajo](https://www.computrabajo.com/) — La bolsa de trabajo más grande de Latinoamérica
- [Model Context Protocol](https://modelcontextprotocol.io) — Especificación MCP
- [Bun](https://bun.sh) — Runtime rápido de JavaScript

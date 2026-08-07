import type { CookieError } from "./cookie-input";
import { COPY, type Lang } from "./i18n";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const STYLES = `
:root {
  color-scheme: light dark;
  --bg: #fbfbfc;
  --card: #fff;
  --fg: #1c1f26;
  --muted: #6b7280;
  --line: #e4e6eb;
  --accent: #1f6feb;
  --accent-fg: #fff;
  --danger: #b42318;
  --danger-bg: #fef3f2;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0d1117;
    --card: #14181f;
    --fg: #e6edf3;
    --muted: #8b949e;
    --line: #262c36;
    --accent: #4493f8;
    --danger: #ff8182;
    --danger-bg: #2a1516;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 20px;
  background: var(--bg);
  color: var(--fg);
  font: 14px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
}
main {
  width: 100%;
  max-width: 400px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 22px;
}
h1 { margin: 0; font-size: 16px; font-weight: 600; letter-spacing: -0.01em; }
.lead { margin: 5px 0 18px; font-size: 13px; color: var(--muted); }
.lead b { color: var(--fg); font-weight: 600; }
.row { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
label { font-size: 13px; font-weight: 600; }
.opt { font-size: 12px; color: var(--muted); font-weight: 400; }
textarea {
  width: 100%;
  height: 78px;
  margin-top: 7px;
  padding: 9px 10px;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: var(--bg);
  color: var(--fg);
  font: 12px/1.45 ui-monospace, SFMono-Regular, Menlo, monospace;
  resize: vertical;
}
textarea::placeholder { color: var(--muted); opacity: .65; }
textarea:focus-visible { outline: 2px solid var(--accent); outline-offset: -1px; border-color: transparent; }
.alert {
  margin: 0 0 14px;
  padding: 9px 11px;
  border-radius: 7px;
  background: var(--danger-bg);
  color: var(--danger);
  font-size: 12.5px;
}
details { margin-top: 9px; }
summary {
  font-size: 12.5px;
  color: var(--accent);
  cursor: pointer;
  width: fit-content;
}
summary::marker { content: ""; }
summary::-webkit-details-marker { display: none; }
summary::after { content: " ›"; }
details[open] summary::after { content: " ⌄"; }
details p { margin: 8px 0 0; font-size: 12.5px; color: var(--muted); }
kbd {
  font: 11.5px ui-monospace, SFMono-Regular, Menlo, monospace;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 4px;
  padding: 1px 4px;
  color: var(--fg);
}
.actions { display: flex; gap: 8px; margin-top: 18px; }
button {
  padding: 9px 14px;
  border-radius: 7px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
}
button.primary { flex: 1; background: var(--accent); color: var(--accent-fg); }
button.ghost { background: transparent; color: var(--muted); border-color: var(--line); }
button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
footer {
  margin-top: 16px;
  padding-top: 13px;
  border-top: 1px solid var(--line);
  font-size: 12px;
  color: var(--muted);
}
`;

export function renderConsentPage(params: {
  clientName: string;
  action: string;
  lang: Lang;
  error?: CookieError;
}): string {
  const t = COPY[params.lang];
  const client = escapeHtml(params.clientName);
  const error = params.error ? escapeHtml(t.errors[params.error]) : "";

  return `<!doctype html>
<html lang="${t.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${t.title}</title>
<style>${STYLES}</style>
</head>
<body>
<main>
  <h1>${t.heading}</h1>
  <p class="lead">${t.lead(client)}</p>
  ${error ? `<p class="alert" role="alert">${error}</p>` : ""}
  <form method="post" action="${escapeHtml(params.action)}">
    <div class="row">
      <label for="cookies">${t.label}</label>
      <span class="opt">${t.optional}</span>
    </div>
    <textarea id="cookies" name="cookies" spellcheck="false" autocomplete="off"
      aria-describedby="why"
      placeholder="${t.placeholder}"></textarea>
    <p class="opt" id="why" style="margin:7px 0 0">${t.why}</p>
    <details>
      <summary>${t.helpSummary}</summary>
      <p>${t.help1}</p>
      <p>${t.help2}</p>
    </details>
    <div class="actions">
      <button type="submit" name="grant" value="full" class="primary">${t.authorize}</button>
      <button type="submit" name="grant" value="skip" class="ghost">${t.skip}</button>
    </div>
  </form>
  <footer>${t.footer}</footer>
</main>
</body>
</html>`;
}

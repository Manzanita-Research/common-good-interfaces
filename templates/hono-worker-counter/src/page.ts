import { clientScript, renderStaticHtml, type BinletViewSpec } from "@common-good-interfaces/jsonrender-ui";
import type { CounterState } from "./counter-binlet";

export function renderCounterPage(input: {
  title: string;
  viewUrl: string;
  viewSpec: BinletViewSpec;
  initialState: CounterState;
}): string {
  const initialHtml = renderStaticHtml(input.viewSpec, { ...input.initialState });

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(input.title)}</title>
    <style>
      :root {
        color-scheme: light;
        --paper: #f8f4eb;
        --ink: #201f1c;
        --muted: #6e675d;
        --line: #d8cfc0;
        --accent: #1f7a61;
        --accent-strong: #0f5f4a;
      }

      body {
        margin: 0;
        min-height: 100vh;
        background: var(--paper);
        color: var(--ink);
        font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
      }

      a {
        color: var(--accent-strong);
      }

      .shell {
        width: min(760px, calc(100vw - 32px));
        margin: 0 auto;
        padding: 48px 0;
      }

      .cg-page {
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #fffaf1;
        box-shadow: 0 18px 40px rgba(38, 33, 25, 0.08);
      }

      .cg-stack {
        display: grid;
        gap: 20px;
        padding: 28px;
      }

      .cg-text {
        margin: 0;
        line-height: 1.55;
      }

      .cg-text-eyebrow {
        color: var(--accent);
        font-size: 12px;
        letter-spacing: 0;
        text-transform: uppercase;
      }

      .cg-text-title {
        font-size: 34px;
        line-height: 1.1;
      }

      .cg-stat {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 20px;
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 16px;
        background: var(--paper);
      }

      .cg-stat span {
        color: var(--muted);
      }

      .cg-stat strong {
        font-size: 32px;
      }

      .cg-code {
        overflow: auto;
        margin: 0;
        border-radius: 8px;
        padding: 14px;
        background: #201f1c;
        color: #f8f4eb;
      }

      .cg-link {
        width: fit-content;
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <div data-common-good-root>${initialHtml}</div>
    </div>
    <script>
      window.__COMMON_GOOD_VIEW_URL__ = ${JSON.stringify(input.viewUrl)};
      window.__COMMON_GOOD_INITIAL_STATE__ = ${JSON.stringify(input.initialState)};
    </script>
    <script>${clientScript}</script>
  </body>
</html>`;
}

export function renderIndexPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Common Good Interface</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        background: #f8f4eb;
        color: #201f1c;
        font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
      }

      main {
        width: min(760px, calc(100vw - 32px));
        margin: 0 auto;
        padding: 48px 0;
      }

      section {
        display: grid;
        gap: 18px;
        border: 1px solid #d8cfc0;
        border-radius: 8px;
        background: #fffaf1;
        padding: 28px;
      }

      h1, p {
        margin: 0;
      }

      a {
        color: #0f5f4a;
      }
    </style>
  </head>
  <body>
    <main>
      <section>
        <p>Common Good Interface</p>
        <h1>/common-good</h1>
        <p>Tiny executable capabilities for humans and agents.</p>
        <a href="/common-good/counter">Open the counter binlet</a>
        <a href="/.well-known/common-good-interface">Common Good discovery</a>
        <a href="/.well-known/agent-configuration">AgentAuth discovery stub</a>
      </section>
    </main>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

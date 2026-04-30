---
title: JSONRender UI
description: The small JSON view grammar and renderer used by binlet pages.
---

`@common-good-interfaces/jsonrender-ui` defines the tiny view layer used by the counter starter. A binlet can expose behavior and state through normal routes, then expose a JSON view spec that renders into a human page.

This is intentionally not a full UI framework. It is a small, inspectable grammar for binlet-sized interfaces.

## View spec

A `BinletViewSpec` has a schema version, title, optional state endpoint, optional live WebSocket config, and a root element.

```ts
const spec = {
  schemaVersion: "0.1.0",
  title: "Hit Counter",
  stateEndpoint: "/common-good/counter.json",
  live: {
    websocketPath: "/common-good/counter/live"
  },
  root: {
    type: "Page",
    children: []
  }
};
```

## Elements

The current element set is deliberately small:

<div class="route-reference-list not-content">
  <div class="route-reference-item">
    <span class="route-method">Page</span>
    <code>type: "Page"</code>
    <p>Top-level page wrapper.</p>
  </div>
  <div class="route-reference-item">
    <span class="route-method">Stack</span>
    <code>type: "Stack"</code>
    <p>Vertical section wrapper.</p>
  </div>
  <div class="route-reference-item">
    <span class="route-method">Text</span>
    <code>props.text</code>
    <p>Body, eyebrow, or title text.</p>
  </div>
  <div class="route-reference-item">
    <span class="route-method">Stat</span>
    <code>props.label + props.value</code>
    <p>Label/value display for small live state.</p>
  </div>
  <div class="route-reference-item">
    <span class="route-method">Link</span>
    <code>props.label + props.href</code>
    <p>Simple anchor link.</p>
  </div>
  <div class="route-reference-item">
    <span class="route-method">Code</span>
    <code>props.text</code>
    <p>Preformatted code or route text.</p>
  </div>
</div>

## State expressions

Props can read from the current state with `$state`:

```ts
{
  type: "Stat",
  props: {
    label: "Recorded hits",
    value: { $state: "/count" }
  }
}
```

`resolveViewValue({ $state: "/count" }, { count: 7 })` returns `7`.

## Template expressions

Props can also render small strings with `$template`:

```ts
{
  type: "Text",
  props: {
    variant: "title",
    text: { $template: "Counter: ${/count}" }
  }
}
```

With `{ count: 7 }`, that renders as `Counter: 7`.

## Static rendering

`renderStaticHtml(spec, state)` renders the spec root to HTML using the provided state:

```ts
import { renderStaticHtml } from "@common-good-interfaces/jsonrender-ui";

const html = renderStaticHtml(spec, { count: 7, connections: 1 });
```

The renderer escapes text and attributes before inserting them into HTML.

## Browser client

The package also exports `clientScript`, a small browser script used by the starter page. It:

- fetches `window.__COMMON_GOOD_VIEW_URL__`
- renders into `[data-common-good-root]`
- starts from `window.__COMMON_GOOD_INITIAL_STATE__`
- connects to `spec.live.websocketPath` when present
- updates state for `snapshot` and `counter.updated` events

The live event handling is currently shaped around the counter starter. Treat it as V0 starter behavior, not a generic event reducer yet.

## Source

```txt
packages/jsonrender-ui/src/index.ts
packages/jsonrender-ui/test/render.test.ts
```

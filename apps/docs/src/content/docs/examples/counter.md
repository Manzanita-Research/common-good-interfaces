---
title: Counter Binlet
description: "The first Common Good Interface example: a Durable Object-backed hit counter."
---

The counter is the first example binlet in this repo. It is intentionally small: one executable URL with state, discovery metadata, a JSON endpoint, a JSONRender view spec, and a hibernatable WebSocket feed.

```txt
/common-good/counter
```

## Run it

```sh
pnpm dev:counter
```

Wrangler usually starts the Worker at `http://localhost:8787`.

Visit `/common-good/counter`. Each page load records one hit.

Open the counter in two tabs and reload one of them. The other tab should update over the live WebSocket feed.

## What it exposes

```txt
GET /common-good/counter
GET /common-good/counter.json
GET /common-good/counter.manifest.json
GET /common-good/counter.view.json
GET /common-good/counter/live
```

`/common-good/counter` is the human page and increments the counter.

`/common-good/counter.json` reads the current state without incrementing:

```json
{
  "count": 1,
  "connections": 0
}
```

`/common-good/counter.manifest.json` describes the binlet, its interfaces, policies, and AgentAuth-compatible capabilities.

`/common-good/counter.view.json` returns the JSONRender view spec used by the page.

`/common-good/counter/live` upgrades to a WebSocket and sends `snapshot` and `counter.updated` events.

## Capability descriptors

The counter publishes two capabilities:

```txt
counter_read
counter_increment
```

Both capabilities return the same JSONSchema7-shaped output:

```json
{
  "type": "object",
  "required": ["count", "connections"],
  "properties": {
    "count": { "type": "number" },
    "connections": { "type": "number" }
  }
}
```

In V0, these are discovery metadata only. The starter publishes AgentAuth-compatible descriptors but does not yet implement AgentAuth registration, grants, JWT verification, or execution.

## Policy declarations

The example wires every policy surface to a no-op adapter:

```txt
auth: noop-auth
payment: noop-payment
moderation: noop-moderation
email: noop-email
```

That keeps the starter runnable while leaving clear places for real auth, payment, moderation, and email adapters.

## Source files

```txt
templates/hono-worker-counter/src/counter-binlet.ts
templates/hono-worker-counter/src/index.ts
templates/hono-worker-counter/src/page.ts
```

`counter-binlet.ts` defines the manifest and JSONRender view spec.

`index.ts` defines the Hono routes and Durable Object.

`page.ts` renders the HTML shell that loads the view spec and live updates.

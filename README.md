# common-good-interfaces

Common Good Interfaces give your website a `/common-good` folder: tiny executable capabilities for humans and agents.

A **binlet** is an executable URL with behavior, state, policy, and optional UI. The old web had `/cgi-bin/guestbook.pl`; this project asks what that primitive should look like for the agent era: discoverable, ownable, stateful, moderatable, payable, and still small enough to understand.

V0 is intentionally tiny. It ships a deployable Cloudflare Worker starter with one binlet:

```txt
/common-good/counter
```

The counter is backed by a Durable Object, exposes HTML and JSON, serves a JSONRender view spec, broadcasts live updates over hibernatable WebSockets, and publishes discovery documents for Common Good Interface and AgentAuth-shaped capabilities.

## Quickstart

```sh
pnpm install
pnpm build
pnpm test
pnpm dry-run:counter
pnpm dev:counter
```

Then open the local Wrangler URL and visit:

```txt
/common-good
/common-good/counter
/.well-known/common-good-interface
/.well-known/agent-configuration
```

Deploy the starter to your own Cloudflare account:

```sh
pnpm deploy:counter
```

## The V0 Shape

This repo is template-first:

```txt
packages/core
packages/jsonrender-ui
templates/hono-worker-counter
```

`packages/core` defines the common vocabulary: binlet manifests, capability contracts, route conventions, registry helpers, and no-op policy adapters for auth, payment, moderation, and email.

`packages/jsonrender-ui` is a small client-side renderer for binlet view specs. The UI is decoupled from the behavior: a binlet can expose HTML, JSON, WebSocket, oRPC, OpenAPI, MCP, or AgentAuth surfaces without changing its underlying capability.

`templates/hono-worker-counter` is the first deployable starter. One Hono Worker owns `/common-good/*`, proxies counter state to a Durable Object, and validates WebSocket upgrade requests before handing them to the object.

## Routes

```txt
GET /.well-known/common-good-interface
GET /.well-known/agent-configuration
GET /common-good
GET /common-good/counter
GET /common-good/counter.json
GET /common-good/counter.manifest.json
GET /common-good/counter.view.json
GET /common-good/counter/live
```

Visiting `/common-good/counter` records a hit. The JSON endpoint reads state without incrementing. The live endpoint upgrades to a hibernatable WebSocket and receives snapshots plus counter update events.

## Agent Era Compatibility

V0 does not implement full AgentAuth, x402, MPP, moderation, or email delivery. It does make room for them.

Each binlet can publish AgentAuth-shaped capability metadata: stable `snake_case` names, human descriptions, JSON Schema input/output, and optional execution locations. The starter also serves an AgentAuth discovery stub at `/.well-known/agent-configuration`; registration, grants, approval, JWT lifecycle, and execution endpoints are reserved for a future adapter.

Payment and policy are similarly modeled as adapters rather than hard-coded route behavior. x402 can become the per-call postage stamp. MPP can become the session tab. Workers AI moderation can keep harassment and spam out of contact forms and guestbooks. Cloudflare Email Service can power governed email-sending binlets.

## Roadmap

1. Contact and guestbook binlets with Workers AI moderation and optional paid postage.
2. Web ring binlet backed by Durable Objects.
3. Email-sending binlet using Cloudflare Email Service.
4. x402 and MPP payment adapters.
5. Real AgentAuth server support.
6. oRPC and OpenAPI adapters.
7. Thing-factory using Cloudflare Sandboxes plus Artifacts.

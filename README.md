# common-good-interfaces

Common Good Interfaces give your website a `/common-good` folder: tiny executable capabilities for humans and agents.

A **binlet** is an executable URL with behavior, state, policy, and optional UI. The old web had `/cgi-bin/guestbook.pl`; this project asks what that primitive should look like for the agent era: discoverable, ownable, stateful, moderatable, payable, and still small enough to understand.

V0 is intentionally tiny. It ships a deployable Cloudflare Worker starter with one binlet:

```txt
/common-good/counter
```

The counter is backed by a Durable Object, exposes HTML and JSON, serves a JSONRender view spec, broadcasts live updates over hibernatable WebSockets, and publishes discovery documents for Common Good Interface and AgentAuth-compatible capabilities.

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

## Local Preview

`pnpm dev:counter` starts a Wrangler dev server, usually at `http://localhost:8787`.

Visit `/common-good` for the index page. Visit `/common-good/counter` for the counter binlet. Loading the counter page records one hit.

Open `/common-good/counter` in two browser tabs and reload one of them. The other tab should update over the hibernatable WebSocket feed.

These routes are useful probes:

```txt
/common-good/counter.json
/common-good/counter.manifest.json
/common-good/counter.view.json
```

The JSON endpoint reads state without incrementing. The manifest endpoint describes the binlet. The view endpoint returns the JSONRender spec used by the page.

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

## AgentAuth Compatibility

Common Good does not define a competing capability format. A binlet manifest wraps route, interface, policy, and UI metadata around AgentAuth-compatible capability descriptors.

```txt
Binlet
  route
  interfaces: html/json/websocket/view/openapi/orpc/agentauth
  policies: auth/payment/moderation/email
  capabilities: AgentAuth-compatible descriptors
```

AgentAuth owns the agent-facing action contract:

```txt
capability name
description
input schema
output schema
location
grant and execution semantics
```

Common Good owns the web object around that contract:

```txt
where this tiny executable thing lives
what surfaces it exposes
what policies apply
how humans and agents discover the whole object
```

In V0, capability descriptors are discovery metadata only. The starter publishes capability names, descriptions, locations, and JSONSchema7 input/output shapes, but it does not yet implement AgentAuth registration, grants, JWT verification, or execution.

When full AgentAuth support lands, the same capability definitions should back `/capability/list`, `/capability/describe`, and `/capability/execute`.

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

Each binlet can publish AgentAuth-compatible capability metadata: stable `snake_case` names, human descriptions, JSONSchema7 input/output, and optional execution locations. The starter also serves an AgentAuth discovery stub at `/.well-known/agent-configuration`; registration, grants, approval, JWT lifecycle, and execution endpoints are reserved for a future adapter.

Payment and policy are similarly modeled as adapters rather than hard-coded route behavior. x402 can become the per-call postage stamp. MPP can become the session tab. Workers AI moderation can keep harassment and spam out of contact forms and guestbooks. Cloudflare Email Service can power governed email-sending binlets.

## References

- [AgentAuth protocol specification](https://agentauthprotocol.com/specification)
- [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Cloudflare Durable Objects hibernatable WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)
- [x402 documentation](https://docs.x402.org/)
- [MPP, the Machine Payments Protocol](https://mpp.dev/)
- [Stripe machine payments documentation](https://docs.stripe.com/payments/machine)

## Roadmap

1. Contact and guestbook binlets with Workers AI moderation and optional paid postage.
2. Web ring binlet backed by Durable Objects.
3. Email-sending binlet using Cloudflare Email Service.
4. x402 and MPP payment adapters.
5. Real AgentAuth server support.
6. oRPC and OpenAPI adapters.
7. Thing-factory using Cloudflare Sandboxes plus Artifacts.

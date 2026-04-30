---
title: Core Package
description: Manifest types, route helpers, policy adapter contracts, and discovery helpers.
---

`@common-good-interfaces/core` is the package that defines the Common Good object model. It does not run a server by itself. It gives a Worker, app, or adapter the shared types and helpers needed to describe binlets consistently.

Use it when you need to:

- define a binlet manifest
- build canonical `/common-good/*` routes
- publish the Common Good discovery document
- publish the V0 AgentAuth discovery stub
- wire policy adapter contracts for auth, payment, moderation, and email

## Install surface

The package exports from its root:

```ts
import {
  defineBinlet,
  createCommonGoodManifest,
  createAgentAuthConfigurationStub,
  binletPath,
  binletJsonPath,
  binletManifestPath,
  binletViewPath,
  binletLivePath,
  noopPolicyAdapters,
  type BinletManifest
} from "@common-good-interfaces/core";
```

## Route helpers

The route helpers are deliberately boring. They keep every template and adapter on the same V0 path shape:

<div class="route-reference-list not-content">
  <div class="route-reference-item">
    <span class="route-method">helper</span>
    <code>binletPath("counter")</code>
    <p>Returns <code>/common-good/counter</code>.</p>
  </div>
  <div class="route-reference-item">
    <span class="route-method">helper</span>
    <code>binletJsonPath("counter")</code>
    <p>Returns <code>/common-good/counter.json</code>.</p>
  </div>
  <div class="route-reference-item">
    <span class="route-method">helper</span>
    <code>binletManifestPath("counter")</code>
    <p>Returns <code>/common-good/counter.manifest.json</code>.</p>
  </div>
  <div class="route-reference-item">
    <span class="route-method">helper</span>
    <code>binletViewPath("counter")</code>
    <p>Returns <code>/common-good/counter.view.json</code>.</p>
  </div>
  <div class="route-reference-item">
    <span class="route-method">helper</span>
    <code>binletLivePath("counter")</code>
    <p>Returns <code>/common-good/counter/live</code>.</p>
  </div>
</div>

`absoluteUrl(origin, path)` normalizes one origin and one route path into a full URL without double slashes.

## Define a binlet

`defineBinlet()` validates the manifest shape the package can check today, then returns it unchanged. The current runtime check is important: AgentAuth capability names must be `snake_case`.

```ts
const counter = defineBinlet({
  id: "counter",
  name: "Hit Counter",
  description: "A tiny Durable Object-backed hit counter.",
  route: binletPath("counter"),
  version: "0.1.0",
  interfaces: {
    html: binletPath("counter"),
    json: binletJsonPath("counter"),
    manifest: binletManifestPath("counter"),
    view: binletViewPath("counter"),
    websocket: binletLivePath("counter")
  },
  capabilities: [
    {
      name: "counter_read",
      description: "Read the current hit counter value."
    }
  ],
  policies: {}
});
```

Capability names like `counter-read` throw. Use `counter_read`.

## Publish discovery

`createCommonGoodManifest()` builds the response for `/.well-known/common-good-interface`.

```ts
const manifest = createCommonGoodManifest({
  origin: "https://example.com",
  name: "example",
  description: "Example Common Good Interface.",
  binlets: [counter]
});
```

The returned document includes:

- `version: "0.1.0"`
- `route_prefix: "/common-good"`
- every binlet manifest you pass in
- absolute discovery URLs for Common Good and AgentAuth

## AgentAuth stub

`createAgentAuthConfigurationStub()` publishes an honest V0 AgentAuth discovery document. It intentionally marks execution as not implemented:

```ts
const stub = createAgentAuthConfigurationStub({
  origin: "https://example.com",
  providerName: "common_good_interfaces",
  description: "AgentAuth-shaped discovery stub."
});
```

Use this for `/.well-known/agent-configuration` until real registration, grants, JWT verification, lifecycle, and execution exist.

## Policy adapters

The policy adapter interfaces define the seams where real auth, payment, moderation, and email behavior will plug in:

```ts
type PolicyAdapters = {
  auth: AuthAdapter;
  payment: PaymentAdapter;
  moderation: ModerationAdapter;
  email: EmailAdapter;
};
```

V0 includes `noopPolicyAdapters` so templates can run locally without external services. The no-op adapters allow auth, treat payment as free, allow moderation, and return a not-sent email result.

## Source

```txt
packages/core/src/index.ts
packages/core/test/core.test.ts
```

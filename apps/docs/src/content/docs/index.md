---
title: Common Good Interfaces
description: Tiny executable capabilities for humans and agents.
---

Common Good Interfaces give your website a `/common-good` folder: tiny executable capabilities for humans and agents.

A **binlet** is an executable URL with behavior, state, policy, and optional UI. The old web had `/cgi-bin/guestbook.pl`; Common Good asks what that primitive should look like for the agent era: discoverable, ownable, stateful, moderatable, payable, and still small enough to understand.

V0 ships one deployable Cloudflare Worker starter:

```txt
/common-good/counter
```

The counter is backed by a Durable Object, exposes HTML and JSON, serves a JSONRender view spec, broadcasts live updates over hibernatable WebSockets, and publishes discovery documents for Common Good Interface and AgentAuth-compatible capabilities.

## Install

```sh
pnpm install
pnpm build
pnpm test
```

## Run the starter

```sh
pnpm dev:counter
```

Wrangler will print a local URL, usually `http://localhost:8787`.

## Run this documentation site

```sh
pnpm dev:docs
```


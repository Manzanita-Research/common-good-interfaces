# common-good-interfaces

Common Good Interfaces give your website a `/common-good` folder: tiny executable capabilities for humans and agents.

A **binlet** is an executable URL with behavior, state, policy, and optional UI. The old web had `/cgi-bin/guestbook.pl`; this project asks what that primitive should look like for the agent era.

V0 ships one deployable Cloudflare Worker starter:

```txt
/common-good/counter
```

## Quickstart

```sh
pnpm install
pnpm build
pnpm test
```

Run the docs:

```sh
pnpm dev:docs
```

Run the counter starter:

```sh
pnpm dev:counter
```

## Workspace

```txt
apps/docs                      Starlight documentation site
packages/core                  Manifest, capability, route, and policy types
packages/jsonrender-ui         Tiny renderer for binlet view specs
templates/hono-worker-counter  Hono + Durable Object counter starter
```

## Docs

The Starlight site has the fuller concept, examples, reference, and Cloudflare deployment notes:

```txt
https://common-good-interfaces-docs.manzanita.workers.dev
```

For local preview, run `pnpm dev:docs` and open the URL printed by Astro.

Start there for:

- what a binlet is
- the counter example
- AgentAuth compatibility
- route reference
- Cloudflare deployment

## Scripts

```sh
pnpm dev:docs
pnpm build:docs
pnpm deploy:docs
pnpm dev:counter
pnpm dry-run:counter
pnpm deploy:counter
```

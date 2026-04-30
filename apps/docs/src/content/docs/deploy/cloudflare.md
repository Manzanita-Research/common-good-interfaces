---
title: Deploy to Cloudflare
description: Build and deploy the Starlight documentation site to Cloudflare Workers.
---

The documentation site is a static Astro/Starlight app. Static Astro sites do not need the `@astrojs/cloudflare` adapter; the adapter is only needed when the site uses on-demand rendering, server islands, actions, sessions, or other server-rendered Astro features.

This repo deploys the docs as static assets on Cloudflare Workers using Wrangler.

The current preview URL is:

```txt
https://common-good-interfaces-docs.manzanita.workers.dev
```

## Build locally

```sh
pnpm build:docs
```

The built site is emitted to:

```txt
apps/docs/dist
```

## Preview with Wrangler

From the repo root:

```sh
pnpm --filter @common-good-interfaces/docs run build
pnpm --filter @common-good-interfaces/docs exec wrangler dev
```

Wrangler reads `apps/docs/wrangler.jsonc` and serves the static assets from `./dist`.

## Deploy

```sh
pnpm deploy:docs
```

Set this build environment variable when the docs should point at a separately deployed counter Worker:

```txt
PUBLIC_COMMON_GOOD_COUNTER_ORIGIN=https://common-good-interfaces-counter.manzanita.workers.dev
```

Local docs development still falls back to `http://localhost:8787`, and `?counter_origin=` can override the target for one-off previews.

The docs app uses this Cloudflare Workers assets configuration:

```jsonc
{
  "name": "common-good-interfaces-docs",
  "compatibility_date": "2026-04-30",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  }
}
```

If the docs site later adds server-rendered routes, install the Cloudflare adapter and switch to the on-demand Worker configuration described in the Astro Cloudflare guide.

## References

- [Astro Cloudflare adapter guide](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Astro Cloudflare deployment guide](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Cloudflare Workers static assets](https://developers.cloudflare.com/workers/static-assets/)

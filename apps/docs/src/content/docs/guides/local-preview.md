---
title: Local Preview
description: What to expect when running the counter starter locally.
---

Start the counter Worker:

```sh
pnpm dev:counter
```

Wrangler starts a local development server, usually at `http://localhost:8787`.

Visit `/common-good` for the index page. Visit `/common-good/counter` for the counter binlet. Loading the counter page records one hit.

Open `/common-good/counter` in two browser tabs and reload one of them. The other tab should update over the hibernatable WebSocket feed.

Useful probe routes:

```txt
/common-good/counter.json
/common-good/counter.manifest.json
/common-good/counter.view.json
```

The JSON endpoint reads state without incrementing. The manifest endpoint describes the binlet. The view endpoint returns the JSONRender spec used by the page.


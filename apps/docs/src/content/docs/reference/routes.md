---
title: Routes
description: The V0 routes exposed by the counter starter.
---

The V0 counter starter exposes these routes:

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


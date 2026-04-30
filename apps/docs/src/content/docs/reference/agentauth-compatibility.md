---
title: AgentAuth Compatibility
description: How Common Good Interfaces relate to AgentAuth capability descriptors.
---

V0 capability descriptors are discovery metadata only. The starter publishes capability names, descriptions, locations, and JSONSchema7 input/output shapes, but it does not yet implement AgentAuth registration, grants, JWT verification, or execution.

When full AgentAuth support lands, the same capability definitions should back:

```txt
/capability/list
/capability/describe
/capability/execute
```

## References

- [AgentAuth protocol specification](https://agentauthprotocol.com/specification)
- [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Cloudflare Durable Objects hibernatable WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)
- [x402 documentation](https://docs.x402.org/)
- [MPP, the Machine Payments Protocol](https://mpp.dev/)
- [Stripe machine payments documentation](https://docs.stripe.com/payments/machine)

---
title: Binlets
description: The small executable web object at the center of Common Good Interfaces.
---

A **binlet** is a small executable web object. It has a route, behavior, optional state, policy declarations, and optional UI.

The core shape is:

```txt
Binlet
  route
  interfaces: html/json/websocket/view/openapi/orpc/agentauth
  policies: auth/payment/moderation/email
  capabilities: AgentAuth-compatible descriptors
```

Common Good owns the web object around a capability contract:

```txt
where this tiny executable thing lives
what surfaces it exposes
what policies apply
how humans and agents discover the whole object
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

Common Good does not define a competing capability format. A binlet manifest wraps route, interface, policy, and UI metadata around AgentAuth-compatible capability descriptors.


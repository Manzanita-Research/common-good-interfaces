---
title: Binlets
description: The small executable web object at the center of Common Good Interfaces.
---

A **binlet** is a small executable web object. It has a route, behavior, optional state, policy declarations, and optional UI.

The old web had URLs that pointed straight at tiny executable things. A binlet keeps that directness, but adds the parts a public agent-era surface needs: discovery, policy, state, and inspectable interfaces.

## Core shape

```txt
Binlet
  route
  interfaces: html/json/websocket/view/openapi/orpc/agentauth
  policies: auth/payment/moderation/email
  capabilities: AgentAuth-compatible descriptors
```

## What Common Good owns

Common Good owns the web object around a capability contract:

```txt
where this tiny executable thing lives
what surfaces it exposes
what policies apply
how humans and agents discover the whole object
```

## What AgentAuth owns

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

## V0 anatomy

| Part | Counter starter example | Why it matters |
| --- | --- | --- |
| Route | `/common-good/counter` | The executable object has a stable public URL. |
| State | Durable Object counter | The binlet can remember things without becoming a whole app. |
| Human UI | HTML page | A person can inspect and use the capability directly. |
| Agent surface | JSON and manifest routes | Machines can read state and discover capabilities. |
| Policy slots | `noop-auth`, `noop-payment`, `noop-moderation`, `noop-email` | The boundary is visible even before real adapters are wired. |

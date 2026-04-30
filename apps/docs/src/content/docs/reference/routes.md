---
title: Routes
description: The V0 routes exposed by the counter starter.
---

The V0 counter starter exposes these routes:

<div class="route-reference-list not-content">
  <div class="route-reference-item">
    <span class="route-method">GET</span>
    <code>/.well-known/common-good-interface</code>
    <p>Common Good discovery document.</p>
  </div>
  <div class="route-reference-item">
    <span class="route-method">GET</span>
    <code>/.well-known/agent-configuration</code>
    <p>AgentAuth discovery stub.</p>
  </div>
  <div class="route-reference-item">
    <span class="route-method">GET</span>
    <code>/common-good</code>
    <p>Human-readable index for the namespace.</p>
  </div>
  <div class="route-reference-item">
    <span class="route-method">GET</span>
    <code>/common-good/counter</code>
    <p>Human page for the counter. Visiting records one hit.</p>
  </div>
  <div class="route-reference-item">
    <span class="route-method">GET</span>
    <code>/common-good/counter.json</code>
    <p>Reads counter state without incrementing.</p>
  </div>
  <div class="route-reference-item">
    <span class="route-method">GET</span>
    <code>/common-good/counter.manifest.json</code>
    <p>Describes the binlet, interfaces, policies, and capabilities.</p>
  </div>
  <div class="route-reference-item">
    <span class="route-method">GET</span>
    <code>/common-good/counter.view.json</code>
    <p>Returns the JSONRender view spec used by the page.</p>
  </div>
  <div class="route-reference-item">
    <span class="route-method">GET</span>
    <code>/common-good/counter/live</code>
    <p>Upgrades to a hibernatable WebSocket for snapshots and counter updates.</p>
  </div>
</div>

The incrementing behavior intentionally belongs to the human page. Agent-readable state lives at `/common-good/counter.json`, so a probe can inspect the binlet without changing it.

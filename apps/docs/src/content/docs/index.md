---
title: Common Good Interfaces
description: Tiny executable capabilities for humans and agents.
template: splash
---

<div class="cgi-home not-content">
  <section class="cgi-hero" aria-labelledby="cgi-home-title">
    <div class="cgi-hero-copy">
      <p class="cgi-eyebrow">/.well-known/common-good-interface -> /common-good/counter</p>
      <h1 id="cgi-home-title">A tiny executable namespace for the agent-era web.</h1>
      <p class="cgi-lede">
        Common Good Interfaces give your website a <code>/common-good</code> folder:
        small public capabilities with routes, state, policy, discovery metadata, and optional UI.
      </p>
      <div class="cgi-actions" aria-label="Start reading">
        <a class="cgi-button" href="./guides/local-preview/">Run the counter</a>
        <a class="cgi-button secondary" href="./concepts/binlets/">Understand binlets</a>
      </div>
    </div>
    <div class="cgi-terminal" aria-label="V0 route surface">
      <div class="cgi-terminal-head">
        <span class="cgi-dots" aria-hidden="true"><span></span><span></span><span></span></span>
        <span>V0 route surface</span>
      </div>
      <div class="cgi-route-stack">
        <div class="cgi-route"><span class="cgi-method">GET</span><span>/common-good/counter</span></div>
        <div class="cgi-route"><span class="cgi-method">GET</span><span>/common-good/counter.json</span></div>
        <div class="cgi-route"><span class="cgi-method">GET</span><span>/common-good/counter.manifest.json</span></div>
        <div class="cgi-route"><span class="cgi-method">GET</span><span>/common-good/counter/live</span></div>
      </div>
    </div>
  </section>

  <section class="cgi-section" aria-labelledby="proof-title">
    <h2 id="proof-title">V0 is small on purpose.</h2>
    <p>
      The first starter proves the primitive instead of pretending to be a platform.
      One counter binlet is enough to show the route, state, UI, live feed, and discovery shape.
    </p>
    <div class="cgi-proof-grid">
      <div class="cgi-proof">
        <span class="cgi-tag">01 / route</span>
        <strong>URL-addressable</strong>
        <p>A human or an agent can arrive at the same tiny executable object.</p>
      </div>
      <div class="cgi-proof">
        <span class="cgi-tag">02 / state</span>
        <strong>Durable Object-backed</strong>
        <p>The counter has identity and memory, not just a stateless handler.</p>
      </div>
      <div class="cgi-proof">
        <span class="cgi-tag">03 / surfaces</span>
        <strong>HTML, JSON, view spec, WebSocket</strong>
        <p>The same binlet exposes human UI and machine-readable interfaces.</p>
      </div>
      <div class="cgi-proof">
        <span class="cgi-tag">04 / discovery</span>
        <strong>AgentAuth-shaped metadata</strong>
        <p>Capability descriptors are present now, with grants and execution left for later.</p>
      </div>
    </div>
  </section>

  <section class="cgi-section" aria-labelledby="map-title">
    <h2 id="map-title">Read the docs like a tool drawer.</h2>
    <div class="cgi-doc-grid">
      <a class="cgi-doc-link" href="./concepts/binlets/">
        <strong>Binlets</strong>
        <p>The executable web object: route, interfaces, policy, and capabilities.</p>
      </a>
      <a class="cgi-doc-link" href="./examples/counter/">
        <strong>Counter Binlet</strong>
        <p>The V0 proof: Durable Object state, JSONRender UI, and live updates.</p>
      </a>
      <a class="cgi-doc-link" href="./packages/core/">
        <strong>Core Package</strong>
        <p>Manifest types, route helpers, policy adapters, and discovery stubs.</p>
      </a>
      <a class="cgi-doc-link" href="./packages/jsonrender-ui/">
        <strong>JSONRender UI</strong>
        <p>The tiny JSON view grammar used by the counter page.</p>
      </a>
      <a class="cgi-doc-link" href="./reference/routes/">
        <strong>Route Reference</strong>
        <p>The exact URLs exposed by the counter starter.</p>
      </a>
    </div>
  </section>
</div>

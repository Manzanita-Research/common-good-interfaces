import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  binletJsonPath,
  binletLivePath,
  binletManifestPath,
  binletPath,
  binletViewPath,
  createAgentAuthConfigurationStub,
  createCommonGoodManifest,
  defineBinlet,
  noopPolicyAdapters
} from "../src/index";

describe("route helpers", () => {
  it("builds canonical common-good paths", () => {
    expect(binletPath("counter")).toBe("/common-good/counter");
    expect(binletJsonPath("counter")).toBe("/common-good/counter.json");
    expect(binletManifestPath("counter")).toBe("/common-good/counter.manifest.json");
    expect(binletViewPath("counter")).toBe("/common-good/counter.view.json");
    expect(binletLivePath("counter")).toBe("/common-good/counter/live");
  });

  it("builds absolute URLs without double slashes", () => {
    expect(absoluteUrl("https://example.com/", "/common-good")).toBe("https://example.com/common-good");
  });
});

describe("manifests", () => {
  it("creates a Common Good Interface manifest", () => {
    const binlet = defineBinlet({
      id: "counter",
      name: "Counter",
      description: "Count page hits.",
      route: "/common-good/counter",
      version: "0.1.0",
      interfaces: { html: "/common-good/counter" },
      capabilities: [{ name: "counter_read", description: "Read the counter." }],
      policies: {}
    });

    const manifest = createCommonGoodManifest({
      origin: "https://example.com",
      name: "example",
      description: "Example Common Good Interface.",
      binlets: [binlet]
    });

    expect(manifest.route_prefix).toBe("/common-good");
    expect(manifest.binlets[0]?.capabilities[0]?.name).toBe("counter_read");
    expect(manifest.interfaces.agentauth).toBe("https://example.com/.well-known/agent-configuration");
  });

  it("rejects non snake_case AgentAuth capability names", () => {
    expect(() =>
      defineBinlet({
        id: "bad",
        name: "Bad",
        description: "Bad capability name.",
        route: "/common-good/bad",
        version: "0.1.0",
        interfaces: {},
        capabilities: [{ name: "bad-name", description: "Bad." }],
        policies: {}
      })
    ).toThrow(/snake_case/);
  });

  it("creates an honest AgentAuth discovery stub", () => {
    const stub = createAgentAuthConfigurationStub({
      origin: "https://example.com",
      providerName: "common-good-interfaces",
      description: "A starter."
    });

    expect(stub.implementation_status).toBe("stub");
    expect(stub.endpoints.execute).toBe("/capability/execute");
    expect(stub.default_location).toBe("https://example.com/capability/execute");
  });
});

describe("policy adapters", () => {
  it("allows requests by default without side effects", async () => {
    const request = new Request("https://example.com/common-good/counter");
    const manifest = defineBinlet({
      id: "counter",
      name: "Counter",
      description: "Count page hits.",
      route: "/common-good/counter",
      version: "0.1.0",
      interfaces: {},
      capabilities: [{ name: "counter_read", description: "Read the counter." }],
      policies: {}
    });

    await expect(noopPolicyAdapters.auth.authorize(request, manifest)).resolves.toMatchObject({ ok: true });
    await expect(noopPolicyAdapters.payment.requirePayment(request, manifest)).resolves.toMatchObject({ ok: true });
    await expect(noopPolicyAdapters.moderation.moderate({}, manifest)).resolves.toMatchObject({
      ok: true,
      action: "allow"
    });
    await expect(noopPolicyAdapters.email.send({}, manifest)).resolves.toMatchObject({ ok: true });
  });
});

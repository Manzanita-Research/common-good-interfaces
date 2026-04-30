import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("Common Good Interface starter", () => {
  it("serves Common Good discovery", async () => {
    const response = await SELF.fetch("https://example.com/.well-known/common-good-interface");
    const body = await response.json<{
      route_prefix: string;
      binlets: Array<{ id: string; capabilities: Array<{ name: string }> }>;
    }>();

    expect(response.status).toBe(200);
    expect(body.route_prefix).toBe("/common-good");
    expect(body.binlets[0]?.id).toBe("counter");
    expect(body.binlets[0]?.capabilities.map((capability: { name: string }) => capability.name)).toContain(
      "counter_read"
    );
  });

  it("serves an honest AgentAuth discovery stub", async () => {
    const response = await SELF.fetch("https://example.com/.well-known/agent-configuration");
    const body = await response.json<{ implementation_status: string; endpoints: { execute: string } }>();

    expect(response.status).toBe(200);
    expect(body.implementation_status).toBe("stub");
    expect(body.endpoints.execute).toBe("/capability/execute");
  });

  it("returns 501 for AgentAuth execution endpoints in V0", async () => {
    const response = await SELF.fetch("https://example.com/capability/execute", { method: "POST" });
    const body = await response.json<{ error: string }>();

    expect(response.status).toBe(501);
    expect(body.error).toBe("agentauth_not_implemented");
  });

  it("serves the counter manifest and JSONRender view spec", async () => {
    const manifestResponse = await SELF.fetch("https://example.com/common-good/counter.manifest.json");
    const manifest = await manifestResponse.json<{ id: string; interfaces: { websocket: string } }>();
    const viewResponse = await SELF.fetch("https://example.com/common-good/counter.view.json");
    const view = await viewResponse.json<{ title: string; live: { websocketPath: string } }>();

    expect(manifest.id).toBe("counter");
    expect(manifest.interfaces.websocket).toBe("/common-good/counter/live");
    expect(view.title).toBe("Hit Counter");
    expect(view.live.websocketPath).toBe("/common-good/counter/live");
  });

  it("increments only when the counter page is visited", async () => {
    const first = await SELF.fetch("https://example.com/common-good/counter.json");
    const firstBody = await first.json<{ count: number }>();

    await SELF.fetch("https://example.com/common-good/counter");

    const second = await SELF.fetch("https://example.com/common-good/counter.json");
    const secondBody = await second.json<{ count: number }>();

    expect(secondBody.count).toBe(firstBody.count + 1);
  });

  it("allows cross-origin reads for embeddable counter data", async () => {
    const response = await SELF.fetch("https://example.com/common-good/counter.json", {
      headers: {
        Origin: "https://docs.example"
      }
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain("GET");
  });

  it("answers CORS preflight for embeddable counter reads", async () => {
    const response = await SELF.fetch("https://example.com/common-good/counter.json", {
      method: "OPTIONS",
      headers: {
        Origin: "https://docs.example",
        "Access-Control-Request-Method": "GET"
      }
    });

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("rejects live feed requests without a WebSocket upgrade", async () => {
    const response = await SELF.fetch("https://example.com/common-good/counter/live");
    const body = await response.json<{ error: string }>();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Expected WebSocket upgrade.");
  });

  it("opens a hibernatable WebSocket and broadcasts counter updates", async () => {
    const response = await SELF.fetch("https://example.com/common-good/counter/live", {
      headers: {
        Upgrade: "websocket"
      }
    });
    const socket = response.webSocket;

    expect(response.status).toBe(101);
    expect(socket).toBeDefined();

    if (!socket) {
      throw new Error("Expected a WebSocket from the live feed.");
    }

    const snapshotPromise = nextMessage(socket);
    socket.accept();

    const snapshot = await snapshotPromise;
    expect(snapshot.type).toBe("snapshot");

    const updatePromise = nextMessage(socket);
    await SELF.fetch("https://example.com/common-good/counter");

    const update = await updatePromise;
    expect(update.type).toBe("counter.updated");
    expect(update.count).toBe(snapshot.count + 1);

  });
});

function nextMessage(socket: WebSocket): Promise<{ type: string; count: number; connections: number }> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Timed out waiting for WebSocket message."));
    }, 2000);

    socket.addEventListener(
      "message",
      (event) => {
        clearTimeout(timeout);
        resolve(JSON.parse(String(event.data)) as { type: string; count: number; connections: number });
      },
      { once: true }
    );
  });
}

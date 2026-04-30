import { DurableObject } from "cloudflare:workers";
import { Hono } from "hono";
import {
  AGENT_AUTH_WELL_KNOWN,
  COMMON_GOOD_WELL_KNOWN,
  binletJsonPath,
  binletLivePath,
  binletManifestPath,
  binletPath,
  binletViewPath,
  createAgentAuthConfigurationStub,
  createCommonGoodManifest
} from "@common-good-interfaces/core";
import {
  COUNTER_BINLET_ID,
  COUNTER_OBJECT_NAME,
  createCounterManifest,
  createCounterViewSpec,
  type CounterEvent,
  type CounterState
} from "./counter-binlet";
import { renderCounterPage, renderIndexPage } from "./page";

type AppBindings = {
  COUNTER: DurableObjectNamespace<CounterObject>;
};

type HonoEnv = {
  Bindings: AppBindings;
};

const EMBEDDABLE_READ_HEADERS = {
  "Access-Control-Allow-Headers": "Accept, Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Origin": "*"
} as const;

interface WebSocketAttachment {
  clientId: string;
  joinedAt: number;
}

export class CounterObject extends DurableObject<AppBindings> {
  async getState(): Promise<CounterState> {
    const count = (await this.ctx.storage.get<number>("count")) ?? 0;
    return {
      count,
      connections: this.ctx.getWebSockets().length
    };
  }

  async increment(): Promise<CounterState> {
    const current = (await this.ctx.storage.get<number>("count")) ?? 0;
    const count = current + 1;
    await this.ctx.storage.put("count", count);

    const state = await this.getState();
    this.broadcast({ type: "counter.updated", ...state });
    return state;
  }

  async fetch(request: Request): Promise<Response> {
    if (!isWebSocketUpgrade(request)) {
      return Response.json({ error: "Expected WebSocket upgrade." }, { status: 400 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket];
    const attachment: WebSocketAttachment = {
      clientId: crypto.randomUUID(),
      joinedAt: Date.now()
    };

    this.ctx.acceptWebSocket(server);
    server.serializeAttachment(attachment);

    const state = await this.getState();
    server.send(JSON.stringify({ type: "snapshot", ...state } satisfies CounterEvent));

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message !== "string") {
      return;
    }

    if (message === "snapshot") {
      const state = await this.getState();
      ws.send(JSON.stringify({ type: "snapshot", ...state } satisfies CounterEvent));
    }
  }

  async webSocketClose(): Promise<void> {
    // The peer already initiated the close; no reply is needed for hibernation cleanup.
  }

  private broadcast(event: CounterEvent): void {
    const payload = JSON.stringify(event);

    for (const socket of this.ctx.getWebSockets()) {
      socket.send(payload);
    }
  }
}

export function createApp(): Hono<HonoEnv> {
  const app = new Hono<HonoEnv>();

  app.options("*", () => new Response(null, { status: 204, headers: EMBEDDABLE_READ_HEADERS }));

  app.get(COMMON_GOOD_WELL_KNOWN, (c) => {
    const origin = requestOrigin(c.req.raw);
    const manifest = createCommonGoodManifest({
      origin,
      name: "common-good-interfaces",
      description: "Tiny executable capabilities for humans and agents.",
      binlets: [createCounterManifest(origin)]
    });

    return corsJson(manifest);
  });

  app.get(AGENT_AUTH_WELL_KNOWN, (c) => {
    const origin = requestOrigin(c.req.raw);

    return corsJson(
      createAgentAuthConfigurationStub({
        origin,
        providerName: "common_good_interfaces",
        description: "AgentAuth-shaped discovery stub for Common Good Interfaces V0."
      })
    );
  });

  app.all("/agent/*", (c) => agentAuthNotImplemented(c.req.raw));
  app.all("/host/*", (c) => agentAuthNotImplemented(c.req.raw));
  app.all("/capability/*", (c) => agentAuthNotImplemented(c.req.raw));

  app.get("/common-good", (c) => c.html(renderIndexPage()));

  app.get(binletPath(COUNTER_BINLET_ID), async (c) => {
    const counter = getCounter(c.env);
    const state = await counter.increment();
    const viewSpec = createCounterViewSpec();

    return c.html(
      renderCounterPage({
        title: "Hit Counter",
        viewUrl: binletViewPath(COUNTER_BINLET_ID),
        viewSpec,
        initialState: state
      })
    );
  });

  app.get(binletJsonPath(COUNTER_BINLET_ID), async (c) => {
    const state = await getCounter(c.env).getState();
    return corsJson(state);
  });

  app.get(binletManifestPath(COUNTER_BINLET_ID), (c) => {
    const origin = requestOrigin(c.req.raw);
    return corsJson(createCounterManifest(origin));
  });

  app.get(binletViewPath(COUNTER_BINLET_ID), () => corsJson(createCounterViewSpec()));

  app.get(binletLivePath(COUNTER_BINLET_ID), async (c) => {
    if (!isWebSocketUpgrade(c.req.raw)) {
      return corsJson({ error: "Expected WebSocket upgrade." }, { status: 400 });
    }

    return getCounter(c.env).fetch(c.req.raw);
  });

  app.notFound((c) => c.json({ error: "Not found." }, 404));

  return app;
}

export function isWebSocketUpgrade(request: Request): boolean {
  return request.headers.get("Upgrade")?.toLowerCase() === "websocket";
}

function getCounter(env: AppBindings): DurableObjectStub<CounterObject> {
  return env.COUNTER.getByName(COUNTER_OBJECT_NAME);
}

function requestOrigin(request: Request): string {
  return new URL(request.url).origin;
}

function corsJson(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);

  for (const [key, value] of Object.entries(EMBEDDABLE_READ_HEADERS)) {
    headers.set(key, value);
  }

  return Response.json(data, { ...init, headers });
}

function agentAuthNotImplemented(request: Request): Response {
  return Response.json(
    {
      error: "agentauth_not_implemented",
      message: "Common Good Interfaces V0 publishes AgentAuth discovery metadata but does not implement registration, grants, JWT verification, lifecycle, or execution yet.",
      discovery: new URL(AGENT_AUTH_WELL_KNOWN, request.url).toString()
    },
    { status: 501 }
  );
}

export default createApp();

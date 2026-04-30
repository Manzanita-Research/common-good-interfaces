import {
  absoluteUrl,
  binletJsonPath,
  binletLivePath,
  binletManifestPath,
  binletPath,
  binletViewPath,
  defineBinlet,
  type BinletManifest
} from "@common-good-interfaces/core";
import type { BinletViewSpec } from "@common-good-interfaces/jsonrender-ui";

export const COUNTER_BINLET_ID = "counter";
export const COUNTER_OBJECT_NAME = "site-counter";

export interface CounterState {
  count: number;
  connections: number;
}

export type CounterEvent =
  | {
      type: "snapshot";
      count: number;
      connections: number;
    }
  | {
      type: "counter.updated";
      count: number;
      connections: number;
    };

export interface CounterCapability {
  getState(): Promise<CounterState>;
  increment(): Promise<CounterState>;
  fetch(request: Request): Promise<Response>;
}

export function createCounterManifest(origin: string): BinletManifest {
  const route = binletPath(COUNTER_BINLET_ID);

  return defineBinlet({
    id: COUNTER_BINLET_ID,
    name: "Hit Counter",
    description: "A tiny Durable Object-backed hit counter with a hibernatable live feed.",
    route,
    version: "0.1.0",
    interfaces: {
      html: route,
      json: binletJsonPath(COUNTER_BINLET_ID),
      websocket: binletLivePath(COUNTER_BINLET_ID),
      manifest: binletManifestPath(COUNTER_BINLET_ID),
      view: binletViewPath(COUNTER_BINLET_ID),
      agentauth: absoluteUrl(origin, "/capability/execute")
    },
    capabilities: [
      {
        name: "counter_read",
        description: "Read the current hit counter value and live connection count.",
        location: absoluteUrl(origin, "/capability/execute"),
        output: {
          type: "object",
          required: ["count", "connections"],
          properties: {
            count: { type: "number", description: "Total recorded hits." },
            connections: { type: "number", description: "Current hibernatable WebSocket connections." }
          }
        }
      },
      {
        name: "counter_increment",
        description: "Record one hit and broadcast the new value to connected clients.",
        location: absoluteUrl(origin, "/capability/execute"),
        output: {
          type: "object",
          required: ["count", "connections"],
          properties: {
            count: { type: "number" },
            connections: { type: "number" }
          }
        }
      }
    ],
    policies: {
      auth: {
        adapter: "noop-auth",
        required: false,
        capabilities: ["counter_read", "counter_increment"]
      },
      payment: {
        adapter: "noop-payment",
        required: false,
        mode: "free"
      },
      moderation: {
        adapter: "noop-moderation",
        required: false
      },
      email: {
        adapter: "noop-email",
        required: false
      }
    }
  });
}

export function createCounterViewSpec(): BinletViewSpec {
  return {
    schemaVersion: "0.1.0",
    title: "Hit Counter",
    description: "A JSONRender-powered view for the first Common Good Interface binlet.",
    stateEndpoint: binletJsonPath(COUNTER_BINLET_ID),
    live: {
      websocketPath: binletLivePath(COUNTER_BINLET_ID)
    },
    root: {
      type: "Page",
      children: [
        {
          type: "Stack",
          children: [
            {
              type: "Text",
              props: {
                variant: "eyebrow",
                text: "Common Good Interface"
              }
            },
            {
              type: "Text",
              props: {
                variant: "title",
                text: "Hit Counter"
              }
            },
            {
              type: "Text",
              props: {
                text: "A tiny executable URL with Durable Object state and a hibernatable live feed."
              }
            },
            {
              type: "Stat",
              props: {
                label: "Recorded hits",
                value: { $state: "/count" }
              }
            },
            {
              type: "Stat",
              props: {
                label: "Live connections",
                value: { $state: "/connections" }
              }
            },
            {
              type: "Code",
              props: {
                text: "GET /common-good/counter.json"
              }
            },
            {
              type: "Link",
              props: {
                label: "View manifest",
                href: binletManifestPath(COUNTER_BINLET_ID)
              }
            }
          ]
        }
      ]
    }
  };
}

export type ViewValue =
  | string
  | number
  | boolean
  | null
  | ViewValue[]
  | { [key: string]: ViewValue }
  | StateExpression
  | TemplateExpression;

export interface StateExpression {
  $state: string;
}

export interface TemplateExpression {
  $template: string;
}

export interface ViewElement {
  type: "Page" | "Stack" | "Text" | "Stat" | "Link" | "Code";
  props?: Record<string, ViewValue>;
  children?: ViewElement[];
}

export interface ViewLiveConfig {
  websocketPath: string;
}

export interface BinletViewSpec {
  schemaVersion: "0.1.0";
  title: string;
  description?: string;
  stateEndpoint?: string;
  root: ViewElement;
  live?: ViewLiveConfig;
}

export type ViewState = Record<string, unknown>;

export function resolveViewValue(value: ViewValue | undefined, state: ViewState): unknown {
  if (value === undefined || value === null) {
    return value;
  }

  if (typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveViewValue(item, state));
  }

  if ("$state" in value && typeof value.$state === "string") {
    return readStatePath(state, value.$state);
  }

  if ("$template" in value && typeof value.$template === "string") {
    return value.$template.replace(/\$\{([^}]+)\}/g, (_match, path: string) => {
      const resolved = readStatePath(state, path.trim());
      return resolved === undefined || resolved === null ? "" : String(resolved);
    });
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [key, resolveViewValue(nested as ViewValue, state)])
  );
}

export function renderStaticHtml(spec: BinletViewSpec, state: ViewState): string {
  return renderElement(spec.root, state);
}

export function renderElement(element: ViewElement, state: ViewState): string {
  const props = element.props ?? {};
  const children = (element.children ?? []).map((child) => renderElement(child, state)).join("");

  switch (element.type) {
    case "Page":
      return `<main class="cg-page">${children}</main>`;
    case "Stack":
      return `<section class="cg-stack">${children}</section>`;
    case "Text": {
      const variant = String(resolveViewValue(props.variant, state) ?? "body");
      const text = String(resolveViewValue(props.text, state) ?? "");
      const tag = variant === "title" ? "h1" : variant === "eyebrow" ? "p" : "p";
      return `<${tag} class="cg-text cg-text-${escapeAttribute(variant)}">${escapeHtml(text)}</${tag}>`;
    }
    case "Stat": {
      const label = String(resolveViewValue(props.label, state) ?? "");
      const value = String(resolveViewValue(props.value, state) ?? "");
      return `<div class="cg-stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
    }
    case "Link": {
      const label = String(resolveViewValue(props.label, state) ?? "");
      const href = String(resolveViewValue(props.href, state) ?? "#");
      return `<a class="cg-link" href="${escapeAttribute(href)}">${escapeHtml(label)}</a>`;
    }
    case "Code": {
      const text = String(resolveViewValue(props.text, state) ?? "");
      return `<pre class="cg-code"><code>${escapeHtml(text)}</code></pre>`;
    }
    default:
      return "";
  }
}

export const clientScript = String.raw`
(() => {
  const root = document.querySelector("[data-common-good-root]");
  const viewUrl = window.__COMMON_GOOD_VIEW_URL__;
  const initialState = window.__COMMON_GOOD_INITIAL_STATE__ ?? {};
  let spec = null;
  let state = initialState;

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const readPath = (model, path) => {
    const parts = path.replace(/^\//, "").split("/").filter(Boolean);
    let current = model;
    for (const part of parts) {
      if (current == null || typeof current !== "object") return undefined;
      current = current[part];
    }
    return current;
  };

  const resolve = (value) => {
    if (value == null || typeof value !== "object") return value;
    if (Array.isArray(value)) return value.map(resolve);
    if (typeof value.$state === "string") return readPath(state, value.$state);
    if (typeof value.$template === "string") {
      return value.$template.replace(/\$\{([^}]+)\}/g, (_match, path) => {
        const resolved = readPath(state, path.trim());
        return resolved == null ? "" : String(resolved);
      });
    }
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, resolve(nested)]));
  };

  const renderElement = (element) => {
    const props = element.props ?? {};
    const children = (element.children ?? []).map(renderElement).join("");

    switch (element.type) {
      case "Page":
        return "<main class=\"cg-page\">" + children + "</main>";
      case "Stack":
        return "<section class=\"cg-stack\">" + children + "</section>";
      case "Text": {
        const variant = String(resolve(props.variant) ?? "body");
        const text = String(resolve(props.text) ?? "");
        const tag = variant === "title" ? "h1" : "p";
        return "<" + tag + " class=\"cg-text cg-text-" + escapeHtml(variant) + "\">" + escapeHtml(text) + "</" + tag + ">";
      }
      case "Stat": {
        const label = String(resolve(props.label) ?? "");
        const value = String(resolve(props.value) ?? "");
        return "<div class=\"cg-stat\"><span>" + escapeHtml(label) + "</span><strong>" + escapeHtml(value) + "</strong></div>";
      }
      case "Link": {
        const label = String(resolve(props.label) ?? "");
        const href = String(resolve(props.href) ?? "#");
        return "<a class=\"cg-link\" href=\"" + escapeHtml(href) + "\">" + escapeHtml(label) + "</a>";
      }
      case "Code": {
        const text = String(resolve(props.text) ?? "");
        return "<pre class=\"cg-code\"><code>" + escapeHtml(text) + "</code></pre>";
      }
      default:
        return "";
    }
  };

  const render = () => {
    if (!root || !spec) return;
    root.innerHTML = renderElement(spec.root);
  };

  const connectLive = () => {
    if (!spec.live?.websocketPath) return;
    const url = new URL(spec.live.websocketPath, window.location.href);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(url);

    socket.addEventListener("message", (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "snapshot" || payload.type === "counter.updated") {
          state = { ...state, count: payload.count, connections: payload.connections };
          render();
        }
      } catch (error) {
        console.warn("Common Good live event was not JSON", error);
      }
    });
  };

  fetch(viewUrl)
    .then((response) => response.json())
    .then((nextSpec) => {
      spec = nextSpec;
      render();
      connectLive();
    })
    .catch((error) => {
      if (root) {
        root.textContent = "Could not load this binlet view.";
      }
      console.error(error);
    });
})();
`;

function readStatePath(state: ViewState, path: string): unknown {
  const parts = path.replace(/^\//, "").split("/").filter(Boolean);
  let current: unknown = state;

  for (const part of parts) {
    if (current === null || typeof current !== "object") {
      return undefined;
    }

    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

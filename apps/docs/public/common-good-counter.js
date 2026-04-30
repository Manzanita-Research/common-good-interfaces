const COUNTER_DEPLOYMENT_ORIGIN = "https://common-good-interfaces-counter.manzanita.workers.dev";
const DOCS_DEPLOYMENT_HOST = "common-good-interfaces-docs.manzanita.workers.dev";
const widgets = document.querySelectorAll("[data-counter-widget]");

for (const widget of widgets) {
  hydrateCounterWidget(widget);
}

async function hydrateCounterWidget(widget) {
  const countEl = widget.querySelector("[data-counter-count]");
  const statusEl = widget.querySelector("[data-counter-status]");
  const linkEl = widget.querySelector("[data-counter-link]");
  const origin = resolveCounterOrigin(widget);
  const jsonPath = widget.dataset.counterJson || "/common-good/counter.json";
  const pagePath = widget.dataset.counterPath || "/common-good/counter";
  const jsonUrl = new URL(jsonPath, origin);
  const pageUrl = new URL(pagePath, origin);

  if (linkEl) {
    linkEl.href = pageUrl.toString();
  }

  try {
    setStatus(statusEl, "Counting visit");
    await countCounterVisit(pageUrl);

    const response = await fetch(jsonUrl, {
      headers: { Accept: "application/json" },
      mode: "cors"
    });

    if (!response.ok) {
      throw new Error(`Counter returned ${response.status}`);
    }

    const state = await response.json();
    const count = Number(state.count);

    if (!Number.isFinite(count)) {
      throw new Error("Counter response did not include a numeric count");
    }

    if (countEl) {
      countEl.textContent = formatCounter(count);
      countEl.setAttribute("aria-label", `${count} recorded counter visits`);
    }

    setStatus(statusEl, shortOrigin(origin));
    widget.dataset.counterState = "ready";
  } catch {
    if (countEl) {
      countEl.textContent = "000000";
      countEl.setAttribute("aria-label", "Counter Worker not connected yet");
    }

    setStatus(statusEl, "Worker not deployed yet");
    widget.dataset.counterState = "waiting";
  }
}

function countCounterVisit(pageUrl) {
  const hitUrl = new URL(pageUrl);
  hitUrl.searchParams.set("counter_widget", "docs-home");
  hitUrl.searchParams.set("t", String(Date.now()));

  return fetch(hitUrl, {
    cache: "no-store",
    credentials: "omit",
    mode: "no-cors"
  });
}

function resolveCounterOrigin(widget) {
  const explicit = widget.dataset.counterOrigin?.trim();

  if (explicit) {
    return explicit;
  }

  const queryOrigin = new URLSearchParams(window.location.search).get("counter_origin");

  if (queryOrigin) {
    return queryOrigin;
  }

  if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return "http://localhost:8787";
  }

  if (window.location.hostname === DOCS_DEPLOYMENT_HOST) {
    return COUNTER_DEPLOYMENT_ORIGIN;
  }

  return window.location.origin;
}

function formatCounter(value) {
  return String(Math.max(0, Math.trunc(value))).padStart(6, "0");
}

function shortOrigin(origin) {
  const url = new URL(origin);

  if (url.origin === window.location.origin) {
    return "Same-origin counter";
  }

  return url.host;
}

function setStatus(element, text) {
  if (element) {
    element.textContent = text;
  }
}

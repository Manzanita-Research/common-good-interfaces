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
  const livePath = widget.dataset.counterLive || "/common-good/counter/live";
  const jsonUrl = new URL(jsonPath, origin);
  const pageUrl = new URL(pagePath, origin);
  const liveUrl = toWebSocketUrl(new URL(livePath, origin));
  const originLabel = shortOrigin(origin);

  if (linkEl) {
    linkEl.href = pageUrl.toString();
  }

  connectCounterLive({
    countEl,
    liveUrl,
    originLabel,
    statusEl,
    widget
  });

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

    renderCount(countEl, count);

    if (widget.dataset.counterState !== "live") {
      setStatus(statusEl, `${originLabel} · polling`);
      widget.dataset.counterState = "ready";
    }
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

function connectCounterLive({ countEl, liveUrl, originLabel, statusEl, widget }) {
  if (!("WebSocket" in window)) {
    return;
  }

  const socket = new WebSocket(liveUrl);

  socket.addEventListener("open", () => {
    setStatus(statusEl, `${originLabel} · live`);
    widget.dataset.counterState = "live";
  });

  socket.addEventListener("message", (event) => {
    try {
      const state = JSON.parse(String(event.data));
      const count = Number(state.count);

      if (Number.isFinite(count)) {
        renderCount(countEl, count);
      }
    } catch {
      // Ignore malformed live messages and keep the last rendered count.
    }
  });

  socket.addEventListener("close", () => {
    if (widget.dataset.counterState === "live") {
      setStatus(statusEl, `${originLabel} · polling`);
      widget.dataset.counterState = "ready";
    }
  });

  socket.addEventListener("error", () => {
    if (widget.dataset.counterState !== "waiting") {
      setStatus(statusEl, `${originLabel} · polling`);
    }
  });
}

function renderCount(element, count) {
  if (!element) {
    return;
  }

  element.textContent = formatCounter(count);
  element.setAttribute("aria-label", `${count} recorded counter visits`);
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

  if (window.COMMON_GOOD_COUNTER_ORIGIN) {
    return window.COMMON_GOOD_COUNTER_ORIGIN;
  }

  if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return "http://localhost:8787";
  }

  return window.location.origin;
}

function formatCounter(value) {
  return String(Math.max(0, Math.trunc(value))).padStart(6, "0");
}

function toWebSocketUrl(url) {
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url;
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

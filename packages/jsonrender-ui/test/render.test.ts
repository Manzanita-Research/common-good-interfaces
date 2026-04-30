import { describe, expect, it } from "vitest";
import { renderStaticHtml, resolveViewValue, type BinletViewSpec } from "../src/index";

const spec: BinletViewSpec = {
  schemaVersion: "0.1.0",
  title: "Counter",
  root: {
    type: "Page",
    children: [
      {
        type: "Text",
        props: {
          variant: "title",
          text: { $template: "${/name}: ${/count}" }
        }
      },
      {
        type: "Stat",
        props: {
          label: "Hits",
          value: { $state: "/count" }
        }
      }
    ]
  }
};

describe("JSONRender UI", () => {
  it("resolves state and template expressions", () => {
    expect(resolveViewValue({ $state: "/count" }, { count: 7 })).toBe(7);
    expect(resolveViewValue({ $template: "count=${/count}" }, { count: 7 })).toBe("count=7");
  });

  it("renders a static view from a JSON spec", () => {
    const html = renderStaticHtml(spec, { name: "Counter", count: 7 });

    expect(html).toContain("Counter: 7");
    expect(html).toContain("<strong>7</strong>");
  });
});

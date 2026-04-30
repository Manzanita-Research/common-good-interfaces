import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://common-good-interfaces-docs.manzanita.workers.dev",
  integrations: [
    starlight({
      title: "Common Good Interfaces",
      description:
        "Documentation for tiny executable web capabilities for humans and agents.",
      customCss: ["./src/styles/common-good.css"],
      head: [
        {
          tag: "link",
          attrs: { rel: "preconnect", href: "https://fonts.googleapis.com" },
        },
        {
          tag: "link",
          attrs: {
            rel: "preconnect",
            href: "https://fonts.gstatic.com",
            crossorigin: "",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,600,100,1&display=swap",
          },
        },
      ],
      social: [],
      sidebar: [
        {
          label: "Start Here",
          items: [
            { slug: "index", label: "Start" },
            { slug: "concepts/binlets", label: "Binlets" },
            { slug: "guides/local-preview", label: "Local Preview" },
          ],
        },
        {
          label: "Examples",
          items: [{ slug: "examples/counter", label: "Counter Binlet" }],
        },
        {
          label: "Packages",
          items: [
            { slug: "packages/core", label: "Core" },
            { slug: "packages/jsonrender-ui", label: "JSONRender UI" },
          ],
        },
        {
          label: "Deploy",
          items: [{ slug: "deploy/cloudflare", label: "Cloudflare" }],
        },
        {
          label: "Reference",
          items: [
            { slug: "reference/routes", label: "Routes" },
            { slug: "reference/agentauth-compatibility", label: "AgentAuth Compatibility" },
          ],
        },
      ],
    }),
  ],
});

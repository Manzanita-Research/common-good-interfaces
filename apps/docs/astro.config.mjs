import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://common-good-interfaces-docs.manzanita.workers.dev",
  integrations: [
    starlight({
      title: "Common Good Interfaces",
      description:
        "Documentation for tiny executable web capabilities for humans and agents.",
      social: [],
      sidebar: [
        {
          label: "Start Here",
          items: ["index", "concepts/binlets", "guides/local-preview"],
        },
        {
          label: "Examples",
          items: ["examples/counter"],
        },
        {
          label: "Deploy",
          items: ["deploy/cloudflare"],
        },
        {
          label: "Reference",
          items: ["reference/routes", "reference/agentauth-compatibility"],
        },
      ],
    }),
  ],
});

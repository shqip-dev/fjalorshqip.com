import { defineConfig } from 'astro/config';
import sitemap from "@astrojs/sitemap";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: 'https://fjalorshqip.com',
  integrations: [sitemap(), preact({ compat: true }), mdx()]
});
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://itakura.studio',
  output: 'server',
  adapter: cloudflare({
    mode: 'directory'
  }),
  integrations: [svelte(), mdx()]
});

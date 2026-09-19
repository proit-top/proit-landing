import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://proit.top',
  integrations: [sitemap({ filter: (page) => !['/privacy/', '/terms/', '/404/'].some(path => new URL(page).pathname === path || new URL(page).pathname === path.slice(0, -1)) })],
  trailingSlash: 'always',
});

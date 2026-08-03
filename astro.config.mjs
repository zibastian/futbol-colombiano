import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// La URL del sitio se toma de src/config.ts manualmente aquí
// (Astro necesita el valor en tiempo de config).
const SITE_URL = process.env.SITE_URL || 'https://futbol-colombiano.pages.dev';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'never',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin')
    })
  ],
  build: {
    format: 'file'
  }
});

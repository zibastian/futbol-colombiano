import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// La URL del sitio se toma de src/config.ts manualmente aquí
// (Astro necesita el valor en tiempo de config).
const SITE_URL = process.env.SITE_URL || 'https://futbol-colombiano.seskassner.workers.dev';

export default defineConfig({
  site: SITE_URL,
  // 'ignore': /liga-betplay y /liga-betplay/ resuelven igual.
  // Con 'never' el servidor de preview devuelve 404 en las rutas por carpeta.
  trailingSlash: 'ignore',
  // Las notas publicadas antes del nuevo esquema de URLs conservan su enlace.
  redirects: {
    '/noticias/2026-08-07-luis-diaz-gol-bayern-munich-aston-villa':
      '/colombianos-en-el-exterior/2026-08-07-luis-diaz-gol-bayern-munich-aston-villa'
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin') && !page.includes('/archivo/')
    })
  ],
  build: {
    // 'directory' + trailingSlash never => URLs limpias sin .html en el canonical
    format: 'directory'
  }
});

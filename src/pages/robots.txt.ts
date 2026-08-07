import type { APIContext } from 'astro';

// robots.txt dinámico: usa siempre la URL real del sitio (SITE_URL),
// así no queda desactualizado al cambiar de dominio.
export function GET(context: APIContext) {
  const site = context.site?.href.replace(/\/$/, '') || '';
  const cuerpo = `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${site}/sitemap-index.xml
Sitemap: ${site}/news-sitemap.xml
`;
  return new Response(cuerpo, { headers: { 'Content-Type': 'text/plain' } });
}

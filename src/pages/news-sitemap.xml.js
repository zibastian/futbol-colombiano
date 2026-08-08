import { getCollection } from 'astro:content';
import { SITE } from '../config';
import { urlNota } from '../lib/rutas';

// Sitemap de Google News: solo notas de las últimas 48 horas.
// Referenciado en robots.txt. Requisito para aparecer en Google News.
export async function GET(context) {
  const dosDias = 48 * 60 * 60 * 1000;
  const ahora = Date.now();
  const notas = (await getCollection('noticias', ({ data }) => !data.draft)).filter(
    (n) => ahora - n.data.pubDate.valueOf() < dosDias
  );

  const site = context.site?.href?.replace(/\/$/, '') || SITE.url;
  const urls = notas
    .map(
      (n) => `  <url>
    <loc>${site}${urlNota(n)}</loc>
    <news:news>
      <news:publication>
        <news:name>${SITE.title}</news:name>
        <news:language>es</news:language>
      </news:publication>
      <news:publication_date>${n.data.pubDate.toISOString()}</news:publication_date>
      <news:title>${n.data.title.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</news:title>
    </news:news>
  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}

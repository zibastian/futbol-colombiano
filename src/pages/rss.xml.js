import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../config';

export async function GET(context) {
  const notas = (await getCollection('noticias', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items: notas.slice(0, 30).map((nota) => ({
      title: nota.data.title,
      description: nota.data.description,
      pubDate: nota.data.pubDate,
      link: `/noticias/${nota.id.replace(/\.md$/, '')}`
    })),
    customData: `<language>es-co</language>`
  });
}

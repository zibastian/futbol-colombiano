import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Colección principal: noticias.
// Cada nota es un archivo .md en src/content/noticias/
// La fábrica de agentes escribirá archivos con este esquema exacto.
const noticias = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/noticias' }),
  schema: z.object({
    title: z.string().max(110),
    description: z.string().max(200),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tipo: z
      .enum(['cronica', 'fichaje', 'previa', 'agenda', 'opinion', 'reporte', 'nota'])
      .default('nota'),
    // Tags que generan páginas hub (fase 1.5):
    equipos: z.array(z.string()).default([]),
    torneos: z.array(z.string()).default([]),
    jugadores: z.array(z.string()).default([]),
    // Imagen de portada (generada por el diagramador o plantilla):
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    // Atribución de primicias ("según reporta ..."):
    fuente: z
      .object({
        nombre: z.string(),
        url: z.string().url().optional()
      })
      .optional(),
    // Autor humano (obligatorio en opinión):
    autor: z.string().default('Redacción'),
    draft: z.boolean().default(false)
  })
});

export const collections = { noticias };

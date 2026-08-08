// Un solo lugar donde se construyen las URLs del sitio.
import { seccionDeNota } from '../data/secciones';

export const slugDeArchivo = (id: string) => id.replace(/\.md$/, '');

/** URL final de una nota: /{seccion}/{slug} */
export function urlNota(nota: { id: string; data: any }): string {
  return `/${seccionDeNota(nota.data)}/${slugDeArchivo(nota.id)}`;
}

export const urlSeccion = (slug: string) => `/${slug}`;
export const urlEquipo = (slug: string) => `/equipos/${slug}`;
export const urlJugador = (slug: string) => `/jugadores/${slug}`;

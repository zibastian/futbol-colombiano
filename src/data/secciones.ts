// Secciones del sitio = primer nivel de la URL.
// Patrón acordado: /{seccion}/{slug-de-la-nota}
//   /liga-betplay/nacional-vencio-a-junior
//   /fichajes/quintero-pide-acciones-del-dim
//   /opinion/el-var-no-es-el-problema
//   /colombianos-en-el-exterior/luis-diaz-figura-del-bayern
// Sin fecha en la URL: las notas no envejecen y la sección aporta contexto temático.

import { buscarEquipo } from './equipos';

export interface Seccion {
  slug: string;
  nombre: string;
  descripcion: string;
  enMenu: boolean;
}

export const SECCIONES: Seccion[] = [
  { slug: 'liga-betplay', nombre: 'Liga BetPlay', descripcion: 'Toda la actualidad del torneo de primera división: resultados, tabla de posiciones, fichajes y análisis.', enMenu: true },
  { slug: 'torneo-betplay', nombre: 'Torneo BetPlay', descripcion: 'La segunda división del fútbol colombiano: grupos, resultados y la pelea por el ascenso.', enMenu: true },
  { slug: 'copa-colombia', nombre: 'Copa Colombia', descripcion: 'El torneo que cruza a los clubes de primera y segunda división.', enMenu: false },
  { slug: 'colombianos-en-el-exterior', nombre: 'Colombianos en el exterior', descripcion: 'El seguimiento diario de los futbolistas colombianos en Europa, MLS, Brasil, Argentina y México.', enMenu: true },
  { slug: 'fichajes', nombre: 'Fichajes', descripcion: 'Llegadas, salidas, rumores y negociaciones del mercado de pases del fútbol colombiano.', enMenu: true },
  { slug: 'opinion', nombre: 'Opinión', descripcion: 'Columnas y análisis firmados sobre el fútbol colombiano.', enMenu: true },
  { slug: 'noticias', nombre: 'Noticias', descripcion: 'La actualidad del fútbol profesional colombiano.', enMenu: false }
];

export const seccionPorSlug = (slug: string) => SECCIONES.find((s) => s.slug === slug);

const aSlug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Sección a la que pertenece una nota, derivada de su contenido. */
export function seccionDeNota(data: {
  tipo: string;
  torneos: string[];
  equipos: string[];
  seccion?: string;
}): string {
  if (data.seccion && seccionPorSlug(data.seccion)) return data.seccion;
  if (data.tipo === 'opinion') return 'opinion';
  if (data.tipo === 'fichaje' || data.tipo === 'reporte') return 'fichajes';

  for (const t of data.torneos) {
    const s = aSlug(t);
    if (seccionPorSlug(s)) return s;
  }
  // Si menciona equipos y ninguno es colombiano, es un colombiano en el exterior
  if (data.equipos.length > 0 && data.equipos.every((e) => !buscarEquipo(e))) {
    return 'colombianos-en-el-exterior';
  }
  return 'noticias';
}

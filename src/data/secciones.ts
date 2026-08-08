// Secciones del sitio = primer nivel de la URL: /{seccion}/{slug-de-la-nota}
// Sin fecha: las notas no envejecen y la sección aporta contexto temático.

import { buscarEquipo } from './equipos';

export interface Seccion {
  slug: string;
  nombre: string;
  descripcion: string;
  enMenu: boolean;
  /** Formato del torneo, si la sección es una competición */
  formato?: 'liga' | 'grupos';
  /** La tabla del descenso solo aplica a la primera división */
  descenso?: boolean;
}

export const SECCIONES: Seccion[] = [
  {
    slug: 'liga-betplay', nombre: 'Liga BetPlay', enMenu: true, formato: 'liga', descenso: true,
    descripcion: 'La primera división del fútbol colombiano: tabla de posiciones, goleadores, tabla del descenso y toda la actualidad.'
  },
  {
    slug: 'torneo-betplay', nombre: 'Torneo BetPlay', enMenu: true, formato: 'liga',
    descripcion: 'La segunda división del fútbol colombiano: tabla de posiciones, goleadores y la pelea por el ascenso.'
  },
  {
    slug: 'copa-betplay', nombre: 'Copa BetPlay', enMenu: true, formato: 'grupos',
    descripcion: 'La Copa Colombia: el torneo que se juega todo el año y cruza a los clubes de primera y segunda división.'
  },
  {
    slug: 'colombianos-en-el-exterior', nombre: 'Colombianos en el exterior', enMenu: true,
    descripcion: 'El seguimiento diario de los futbolistas colombianos en Europa, MLS, Brasil, Argentina y México.'
  },
  {
    slug: 'fichajes', nombre: 'Fichajes', enMenu: true,
    descripcion: 'Llegadas, salidas, rumores y negociaciones del mercado de pases del fútbol colombiano.'
  },
  {
    slug: 'opinion', nombre: 'Opinión', enMenu: true,
    descripcion: 'Columnas firmadas sobre el fútbol colombiano. Cada columnista con su mirada y su estilo.'
  },
  {
    slug: 'noticias', nombre: 'Noticias', enMenu: false,
    descripcion: 'La actualidad del fútbol profesional colombiano.'
  }
];

export const seccionPorSlug = (slug: string) => SECCIONES.find((s) => s.slug === slug);

const aSlug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Nombres con los que un torneo puede aparecer en el frontmatter
const ALIAS_TORNEO: Record<string, string> = {
  'liga-betplay': 'liga-betplay',
  'liga-betplay-dimayor': 'liga-betplay',
  'primera-a': 'liga-betplay',
  'torneo-betplay': 'torneo-betplay',
  'primera-b': 'torneo-betplay',
  'copa-betplay': 'copa-betplay',
  'copa-colombia': 'copa-betplay',
  'copa-betplay-dimayor': 'copa-betplay'
};

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
    const destino = ALIAS_TORNEO[aSlug(t)];
    if (destino) return destino;
  }
  if (data.equipos.length > 0 && data.equipos.every((e) => !buscarEquipo(e))) {
    return 'colombianos-en-el-exterior';
  }
  return 'noticias';
}

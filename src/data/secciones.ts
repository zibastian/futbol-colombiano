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
    slug: 'liga-femenina', nombre: 'Liga Femenina BetPlay', enMenu: true, formato: 'liga',
    descripcion: 'La Liga Femenina BetPlay: tabla de posiciones, goleadoras, asistencias y la actualidad del fútbol femenino colombiano.'
  },
  {
    slug: 'copa-betplay', nombre: 'Copa BetPlay', enMenu: true, formato: 'grupos',
    descripcion: 'La Copa Colombia: el torneo que se juega todo el año y cruza a los clubes de primera y segunda división.'
  },
  {
    slug: 'copa-libertadores', nombre: 'Copa Libertadores', enMenu: true, formato: 'grupos',
    descripcion: 'La Copa Libertadores: grupos, resultados, goleadores y el camino de los equipos colombianos en el torneo más importante del continente.'
  },
  {
    slug: 'copa-sudamericana', nombre: 'Copa Sudamericana', enMenu: true, formato: 'grupos',
    descripcion: 'La Copa Sudamericana: grupos, resultados, goleadores y la campaña de los clubes colombianos.'
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

/** Menú de navegación en dos niveles. Las competiciones se agrupan para no
 *  saturar la barra (sobre todo en móvil). */
export interface ItemMenu {
  nombre: string;
  url?: string;
  proximamente?: boolean;
  hijos?: ItemMenu[];
}

export const MENU: ItemMenu[] = [
  { nombre: 'Portada', url: '/' },
  { nombre: 'Liga BetPlay', url: '/liga-betplay' },
  {
    nombre: 'Competiciones',
    hijos: [
      { nombre: 'Liga BetPlay', url: '/liga-betplay' },
      { nombre: 'Torneo BetPlay', url: '/torneo-betplay' },
      { nombre: 'Copa BetPlay', url: '/copa-betplay' },
      { nombre: 'Liga Femenina BetPlay', url: '/liga-femenina' },
      { nombre: 'Copa Libertadores', url: '/copa-libertadores' },
      { nombre: 'Copa Sudamericana', url: '/copa-sudamericana' }
    ]
  },
  { nombre: 'Colombianos en el exterior', url: '/colombianos-en-el-exterior' },
  { nombre: 'Fichajes', url: '/fichajes' },
  { nombre: 'Opinión', url: '/opinion' }
];

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
  'copa-betplay-dimayor': 'copa-betplay',
  'liga-femenina': 'liga-femenina',
  'liga-femenina-betplay': 'liga-femenina',
  'copa-libertadores': 'copa-libertadores',
  'libertadores': 'copa-libertadores',
  'conmebol-libertadores': 'copa-libertadores',
  'copa-sudamericana': 'copa-sudamericana',
  'sudamericana': 'copa-sudamericana',
  'conmebol-sudamericana': 'copa-sudamericana',
  'liga-femenina-betplay-dimayor': 'liga-femenina',
  'liga-profesional-femenina': 'liga-femenina',
  'futbol-femenino': 'liga-femenina'
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

// Índice de estadísticas por jugador.
//
// Las tablas de goleadores enlazan a /jugadores/{slug}. Antes esas páginas solo
// existían para jugadores mencionados en alguna nota o para las siete leyendas,
// así que la mayoría de los enlaces de las tablas caía en un 404.
//
// Acá se cruza todo: quien aparece en una tabla de goleadores o asistencias
// tiene ficha, y en su ficha se ven sus números por torneo. Es la misma fuente
// que usa `getStaticPaths`, así que no puede haber un enlace sin página.
//
// LA FUENTE ES LA MISMA QUE LA DE LAS TABLAS
// Este índice se arma con `estadisticasDelTorneo`, exactamente lo que muestran
// las páginas de sección. Si acá se usara otra fuente, las tablas dirían un
// número y la ficha del jugador otro. Los datos de ejemplo quedan solo como
// respaldo para desarrollar sin clave de API.

import { slugify } from '../lib/slug';
import { TORNEOS } from './torneos';
import { estadisticasDelTorneo } from '../lib/apifootball';
import {
  goleadoresLiga, asistenciasLiga, goleadoresTorneo, asistenciasTorneo,
  goleadoresCopa, asistenciasCopa, type Anotador
} from './estadisticas-demo';

export interface LineaEstadistica {
  torneo: string;
  torneoSlug: string;
  equipo: string;
  goles: number;
  asistencias: number;
  /** 0 = no se sabe. Al reconstruir por eventos la API no dice quién estuvo en
   *  cancha, solo quién marcó, así que la ficha muestra un guion. */
  partidos: number;
}

export interface FichaEstadistica {
  slug: string;
  nombre: string;
  lineas: LineaEstadistica[];
  totalGoles: number;
  totalAsistencias: number;
}

interface Fuente {
  torneo: string;
  torneoSlug: string;
  goles: Anotador[];
  asistencias: Anotador[];
}

const DEMO: Record<string, { goles: Anotador[]; asistencias: Anotador[] }> = {
  'liga-betplay': { goles: goleadoresLiga, asistencias: asistenciasLiga },
  'torneo-betplay': { goles: goleadoresTorneo, asistencias: asistenciasTorneo },
  'copa-betplay': { goles: goleadoresCopa, asistencias: asistenciasCopa }
};

let hayDatosReales = false;

const FUENTES: Fuente[] = await Promise.all(
  TORNEOS.map(async (t): Promise<Fuente> => {
    const real = await estadisticasDelTorneo(t.ligaId, t.season);
    if (real.goles.length) {
      hayDatosReales = true;
      // El nombre lleva el torneo: en Colombia "Liga BetPlay" sola es ambiguo,
      // hay dos campeonatos por año y los números son de uno solo.
      return {
        torneo: real.torneo ? `${t.nombre} ${real.torneo}` : t.nombre,
        torneoSlug: t.slug,
        goles: real.goles,
        asistencias: real.asistencias
      };
    }
    const demo = DEMO[t.slug] ?? { goles: [], asistencias: [] };
    return { torneo: t.nombre, torneoSlug: t.slug, ...demo };
  })
);

/** ¿Los números que se están mostrando son de ejemplo? Decide el aviso de la
 *  ficha del jugador: sin esto, un dato real seguiría rotulado como demo. */
export const ESTADISTICAS_SON_DEMO = !hayDatosReales;

const indice = new Map<string, FichaEstadistica>();

for (const fuente of FUENTES) {
  const registrar = (a: Anotador, campo: 'goles' | 'asistencias') => {
    const slug = slugify(a.jugador);
    if (!indice.has(slug)) {
      indice.set(slug, { slug, nombre: a.jugador, lineas: [], totalGoles: 0, totalAsistencias: 0 });
    }
    const ficha = indice.get(slug)!;
    let linea = ficha.lineas.find((l) => l.torneoSlug === fuente.torneoSlug && l.equipo === a.equipo);
    if (!linea) {
      linea = {
        torneo: fuente.torneo, torneoSlug: fuente.torneoSlug, equipo: a.equipo,
        goles: 0, asistencias: 0, partidos: a.partidos
      };
      ficha.lineas.push(linea);
    }
    linea[campo] = a.cantidad;
    // Los partidos son del jugador, no de la métrica: se queda el mayor.
    linea.partidos = Math.max(linea.partidos, a.partidos);
  };
  fuente.goles.forEach((a) => registrar(a, 'goles'));
  fuente.asistencias.forEach((a) => registrar(a, 'asistencias'));
}

for (const ficha of indice.values()) {
  ficha.totalGoles = ficha.lineas.reduce((s, l) => s + l.goles, 0);
  ficha.totalAsistencias = ficha.lineas.reduce((s, l) => s + l.asistencias, 0);
}

export const ESTADISTICAS_JUGADORES: FichaEstadistica[] = [...indice.values()];

export const estadisticasDeJugador = (slug: string): FichaEstadistica | undefined => indice.get(slug);

/** ¿Este jugador tiene página propia por sus números? La usa TablaAnotadores
 *  para no generar un enlace hacia una URL que no existe. */
export const tieneFichaPorEstadisticas = (slug: string) => indice.has(slug);

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
// Este índice se arma con `datosDe`, la misma puerta de entrada que usan las
// páginas de sección. Si acá se usara otra fuente, las tablas dirían un
// número y la ficha del jugador otro. Los datos de ejemplo quedan solo como
// respaldo para desarrollar sin clave de API.

import { slugify } from '../lib/slug';
import { TORNEOS } from './torneos';
import { datosDe } from './deportivos';
import { equipoPorApiId } from './equipos';
import {
  goleadoresLiga, asistenciasLiga, goleadoresTorneo, asistenciasTorneo,
  goleadoresCopa, asistenciasCopa
} from './estadisticas-demo';
import type { Anotador } from './deportivos';

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
  /** El abreviado, tal como aparece en las tablas. */
  nombre: string;
  /** El completo, para el título de su ficha. Cae al corto si no lo tenemos. */
  nombreCompleto: string;
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

// SOLO JUGADORES DE CLUBES COLOMBIANOS
// En Libertadores y Sudamericana el top de goleadores es casi todo extranjero.
// Generarles ficha sería inventar páginas vacías —no tenemos ni su nombre
// completo— y llenar el sitio de contenido flojo que Google castiga. De los
// nuestros sí sabemos algo, así que ellos sí tienen página.
const esDeClubNuestro = (a: Anotador) => Boolean(equipoPorApiId(a.equipoId));

const FUENTES: Fuente[] = await Promise.all(
  TORNEOS.map(async (t): Promise<Fuente> => {
    const real = await datosDe(t.slug, t.ligaId, t.season);
    if (real.goleadores.length) {
      hayDatosReales = true;
      // El nombre lleva el torneo: en Colombia "Liga BetPlay" sola es ambiguo,
      // hay dos campeonatos por año y los números son de uno solo.
      return {
        torneo: real.torneoVigente ? `${t.nombre} ${real.torneoVigente}` : t.nombre,
        torneoSlug: t.slug,
        goles: real.goleadores.filter(esDeClubNuestro),
        asistencias: real.asistencias.filter(esDeClubNuestro)
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
    // La URL lleva el nombre COMPLETO: /jugadores/hugo-rodallega posiciona y se
    // entiende; /jugadores/h-rodallega no dice nada ni a Google ni a nadie.
    // Además así coincide con el slug que genera una nota, que nombra al
    // jugador completo, y las dos rutas caen en la misma página.
    const slug = slugify(a.nombreCompleto || a.jugador);
    if (!indice.has(slug)) {
      indice.set(slug, {
        slug, nombre: a.jugador, nombreCompleto: a.nombreCompleto || a.jugador,
        lineas: [], totalGoles: 0, totalAsistencias: 0
      });
    }
    const ficha = indice.get(slug)!;
    // El completo puede venir en una competición y no en otra: vale el que haya.
    if (a.nombreCompleto && ficha.nombreCompleto === ficha.nombre) {
      ficha.nombreCompleto = a.nombreCompleto;
    }
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

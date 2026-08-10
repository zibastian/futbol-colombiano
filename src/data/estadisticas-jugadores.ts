// Índice de estadísticas por jugador.
//
// Las tablas de goleadores enlazan a /jugadores/{slug}. Antes esas páginas solo
// existían para jugadores mencionados en alguna nota o para las siete leyendas,
// así que la mayoría de los enlaces de las tablas caía en un 404.
//
// Acá se cruza todo: quien aparece en una tabla de goleadores o asistencias
// tiene ficha, y en su ficha se ven sus números por torneo. Es la misma fuente
// que usa `getStaticPaths`, así que no puede haber un enlace sin página.

import { slugify } from '../lib/slug';
import {
  goleadoresLiga, asistenciasLiga, goleadoresTorneo, asistenciasTorneo,
  goleadoresCopa, asistenciasCopa, type Anotador
} from './estadisticas-demo';
import { goleadorasFemenina, asistenciasFemenina } from './liga-femenina-demo';

export interface LineaEstadistica {
  torneo: string;
  torneoSlug: string;
  equipo: string;
  goles: number;
  asistencias: number;
  partidos: number;
}

export interface FichaEstadistica {
  slug: string;
  nombre: string;
  lineas: LineaEstadistica[];
  totalGoles: number;
  totalAsistencias: number;
}

const FUENTES: { torneo: string; torneoSlug: string; goles: Anotador[]; asistencias: Anotador[] }[] = [
  { torneo: 'Liga BetPlay', torneoSlug: 'liga-betplay', goles: goleadoresLiga, asistencias: asistenciasLiga },
  { torneo: 'Torneo BetPlay', torneoSlug: 'torneo-betplay', goles: goleadoresTorneo, asistencias: asistenciasTorneo },
  { torneo: 'Copa BetPlay', torneoSlug: 'copa-betplay', goles: goleadoresCopa, asistencias: asistenciasCopa },
  { torneo: 'Liga Femenina BetPlay', torneoSlug: 'liga-femenina', goles: goleadorasFemenina, asistencias: asistenciasFemenina }
];

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

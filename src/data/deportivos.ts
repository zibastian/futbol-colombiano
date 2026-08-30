// Datos deportivos de una competición: tabla, goleadores y asistencias.
//
// UNA SOLA PUERTA DE ENTRADA
// La página de la sección y el índice de jugadores tienen que ver exactamente
// lo mismo. Cuando cada uno resolvía sus datos por su cuenta, la tabla decía un
// número y la ficha del jugador decía otro.
//
// DE DÓNDE SALEN, EN ORDEN
//  1. `datos-api.json`, que escribe la fábrica cuando termina un partido. Es la
//     fuente normal: los eventos de un partido terminado no cambian nunca, así
//     que se cuentan una vez y el build no vuelve a preguntar. Costo: 0 requests.
//  2. La API en vivo, si el JSON todavía no existe. Funciona, pero recalcula
//     los goles partido por partido en CADA build.
//  3. Los datos de ejemplo, para desarrollar sin clave.
//
// Para pasar de (2) a (1):  ./fabrica.sh eventos

import { equipoPorApiId } from './equipos';
import { estadisticasDelTorneo, torneosDeTemporada, torneoVigente, type FilaTabla } from '../lib/apifootball';

export interface Anotador {
  jugador: string;
  equipo: string;
  cantidad: number;
  partidos: number;
}

export interface DatosCompeticion {
  /** Nombre del torneo en curso: "Clausura", "Apertura". Null si no aplica. */
  torneoVigente: string | null;
  tabla: FilaTabla[];
  goleadores: Anotador[];
  asistencias: Anotador[];
  fuente: 'json' | 'api' | 'sin-datos';
}

// El JSON puede no existir todavía. `import.meta.glob` devuelve {} en ese caso;
// un import normal rompería el build.
const encontrados = import.meta.glob('./datos-api.json', { eager: true, import: 'default' });
const JSON_DATOS = (Object.values(encontrados)[0] ?? null) as any;

export const HAY_DATOS_PRECALCULADOS = Boolean(JSON_DATOS);

if (!HAY_DATOS_PRECALCULADOS) {
  console.warn(
    '\n[datos] Falta src/data/datos-api.json: los goleadores se van a recalcular\n' +
      '  partido por partido en cada build. Generalo una vez con:\n' +
      '    ./fabrica.sh eventos\n'
  );
}

/** El club como lo escribe el sitio. La API dice "Junior" y "Atletico Nacional",
 *  que no emparejan con nuestro diccionario: por eso se resuelve por id. */
const club = (id?: number | null, porDefecto = '') =>
  equipoPorApiId(id)?.nombre ?? porDefecto;

const anotadorDeJson = (a: any): Anotador => ({
  jugador: a.jugador,
  equipo: club(a.equipoId, a.equipo ?? ''),
  cantidad: a.cantidad,
  // Los eventos dicen quién marcó, no quién estuvo en cancha: PJ no se sabe.
  partidos: 0
});

const filaDeJson = (f: any): FilaTabla => ({
  posicion: f.posicion,
  equipoId: f.equipoId,
  equipo: club(f.equipoId, f.equipo ?? ''),
  logo: '',
  puntos: f.puntos,
  jugados: f.jugados,
  ganados: f.ganados,
  empatados: f.empatados,
  perdidos: f.perdidos,
  golesFavor: f.golesFavor,
  golesContra: f.golesContra,
  diferencia: f.diferencia,
  racha: f.racha ?? null
});

const memoria = new Map<string, Promise<DatosCompeticion>>();

/** Datos de una competición. Memoizado: durante un build se resuelve una vez. */
export function datosDe(slug: string, ligaId: number, season: number): Promise<DatosCompeticion> {
  const clave = `${slug}:${ligaId}:${season}`;
  if (!memoria.has(clave)) memoria.set(clave, resolver(slug, ligaId, season));
  return memoria.get(clave)!;
}

async function resolver(slug: string, ligaId: number, season: number): Promise<DatosCompeticion> {
  const precalculado = JSON_DATOS?.competiciones?.[slug];
  if (precalculado) {
    const torneos = precalculado.torneos ?? [];
    const vigente =
      torneos.find((t: any) => t.nombre === precalculado.torneoVigente) ?? torneos.at(-1);
    return {
      torneoVigente: precalculado.torneoVigente ?? null,
      tabla: (vigente?.tabla ?? []).map(filaDeJson),
      goleadores: (precalculado.goleadores ?? []).map(anotadorDeJson),
      asistencias: (precalculado.asistencias ?? []).map(anotadorDeJson),
      fuente: 'json'
    };
  }

  const [torneos, est] = await Promise.all([
    torneosDeTemporada(ligaId, season),
    estadisticasDelTorneo(ligaId, season)
  ]);
  const vigente = torneoVigente(torneos);
  return {
    torneoVigente: vigente?.nombre ?? null,
    tabla: vigente?.filas ?? [],
    goleadores: est.goles,
    asistencias: est.asistencias,
    fuente: vigente || est.goles.length ? 'api' : 'sin-datos'
  };
}

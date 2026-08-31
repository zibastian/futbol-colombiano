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

export interface Grupo {
  /** Ya traducido y listo para mostrar. */
  nombre: string;
  /** Como lo llama la API. Sirve para emparejar con `tablaVigente`. */
  nombreApi: string;
  filas: FilaTabla[];
}

/** El nombre del grupo, en español y sin la ferretería de la API.
 *
 *  La API mezcla inglés y prefijos internos: "Round 1 - Group B",
 *  "Primera B: Clausura", "Group Stage". Al hincha hay que mostrarle
 *  "Grupo B" y "Clausura". Se traduce SOLO para mostrar: el emparejamiento
 *  interno sigue usando el nombre original, que es el que no cambia. */
export function nombreTorneo(nombre: string): string {
  let n = (nombre || '').trim();
  n = n.replace(/^Primera\s+[AB]:\s*/i, '');      // "Primera B: Clausura"
  n = n.replace(/^Round\s+\d+\s*-\s*/i, '');      // "Round 1 - Group B"
  // El ORDEN importa: "Quarter-finals" contiene "finals", y la traducción de
  // "Play-offs" produce un "final" en español que la regla de Final volvería a
  // capitalizar ("Fase Final"). Primero lo específico, después lo general.
  n = n.replace(/\bQuarter-?finals?\b/gi, 'Cuartos de final');
  n = n.replace(/\bSemi-?finals?\b/gi, 'Semifinales');
  n = n.replace(/\bFinals?\b/g, 'Final');
  n = n.replace(/\bGroup Stage\b/gi, 'Fase de grupos');
  n = n.replace(/\bGroup\b/gi, 'Grupo');
  n = n.replace(/\bPlay-?offs?\b/gi, 'Fase final');
  n = n.replace(/\bQuadrangulars?\b/gi, 'Cuadrangulares');
  n = n.replace(/\bTabla Anual\b/gi, 'Tabla anual');
  n = n.replace(/\s*-\s*/g, ' · ').replace(/\s+/g, ' ').trim();
  return n || nombre;
}

export interface DatosCompeticion {
  /** Torneo de los GOLEADORES: "Clausura", "Apertura". Null en una copa, donde
   *  los goles son de todo el certamen y no se reinician por instancia. */
  torneoVigente: string | null;
  /** Tabla del grupo vigente. En una copa hay varios: ver `grupos`. */
  tabla: FilaTabla[];
  /** Cómo se llama esa tabla, ya en español ("Clausura", "Tabla anual"). */
  tablaNombre: string | null;
  /** Todos los grupos de la competición, para la fase de grupos de la copa. */
  grupos: Grupo[];
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
  // Escudo de la API: es el que se usa para los clubes extranjeros de
  // Libertadores y Sudamericana, que no están en nuestra base.
  logo: f.logo ?? '',
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
    // OJO: el grupo de la tabla y el torneo de los goleadores NO se llaman
    // igual. La tabla de la B dice "Primera B: Clausura" y sus partidos dicen
    // "Clausura - 5". Por eso el JSON trae los dos nombres por separado.
    const vigente =
      torneos.find((t: any) => t.nombre === precalculado.tablaVigente) ?? torneos.at(-1);
    return {
      torneoVigente: precalculado.torneoVigente ?? null,
      tabla: (vigente?.tabla ?? []).map(filaDeJson),
      tablaNombre: vigente ? nombreTorneo(vigente.nombre) : null,
      grupos: torneos.map((t: any) => ({
        nombre: nombreTorneo(t.nombre),
        nombreApi: t.nombre,
        filas: (t.tabla ?? []).map(filaDeJson)
      })),
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
    tablaNombre: vigente ? nombreTorneo(vigente.nombre) : null,
    grupos: torneos.map((t) => ({
      nombre: nombreTorneo(t.nombre), nombreApi: t.nombre, filas: t.filas
    })),
    goleadores: est.goles,
    asistencias: est.asistencias,
    fuente: vigente || est.goles.length ? 'api' : 'sin-datos'
  };
}

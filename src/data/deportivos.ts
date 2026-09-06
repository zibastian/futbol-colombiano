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
  /** id de API-Football del club. Resuelve la ficha sin depender del nombre.
   *  Opcional: los datos de ejemplo y el respaldo en vivo no lo traen. */
  equipoId?: number | null;
  /** Escudo listo para usar: el nuestro si el club está en la base, si no el
   *  de la API. Sin esto, los goleadores de Libertadores salían sin club. */
  logo?: string | null;
  /** "Andrés Arce" en vez de "A. Arce". Los eventos del partido solo traen el
   *  abreviado; el completo sale de /players y la fábrica lo pide una vez, y
   *  solo de los jugadores de clubes colombianos. En las tablas se usa el
   *  corto —entra en una línea— y en la ficha del jugador, el completo. */
  nombreCompleto?: string | null;
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
  n = n.replace(/\bRound of 32\b/gi, 'Dieciseisavos de final');
  n = n.replace(/\bRound of 16\b/gi, 'Octavos de final');
  n = n.replace(/\b3rd Place Final\b/gi, 'Tercer puesto');
  n = n.replace(/\bQualification Round\s*(\d+)\b/gi, 'Fase previa $1');
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

export interface PartidoLlave {
  fecha: string | null;
  estado: string | null;
  localId: number | null;
  local: string;
  logoLocal: string | null;
  visitanteId: number | null;
  visitante: string;
  logoVisitante: string | null;
  golesLocal: number | null;
  golesVisitante: number | null;
  /** Tanda de penales. `goles` trae el marcador de los 90 o del alargue, así
   *  que sin esto una llave definida desde el punto blanco figura empatada. */
  penalesLocal: number | null;
  penalesVisitante: number | null;
}

export interface RondaLlave {
  /** Campeonato al que pertenece la llave ("Clausura"). Vacío en una copa,
   *  donde las rondas no cuelgan de ningún campeonato. */
  torneo: string;
  ronda: string;
  partidos: PartidoLlave[];
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
  /** Goleadores y asistentes de CADA club, por apiId.
   *
   *  La ficha de equipo filtraba el top 10 del torneo y casi ningún club tiene
   *  a alguien ahí, así que la sección quedaba vacía. La fábrica ya tiene a
   *  todos contados: repartirlos por club no cuesta una llamada más. */
  porEquipo: Record<string, { goleadores: Anotador[]; asistencias: Anotador[] }>;
  /** Fase de eliminación directa. Una tabla no sirve para contarla: no hay
   *  puntos, hay cruces, y el eliminado desaparece de las tablas. */
  llaves: RondaLlave[];
  fuente: 'json' | 'api' | 'sin-datos';
}

/** Escudo de un club: el nuestro si lo tenemos, si no el que manda la API. */
export const escudoDeFila = (id?: number | null, logo?: string | null) => {
  const e = equipoPorApiId(id);
  return e?.apiId ? `/escudos/64/${e.apiId}.png` : logo || null;
};

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

// Escudos de TODOS los clubes que aparecen en el JSON, por id.
//
// Los goleadores no traen escudo, pero las tablas sí, y es el mismo club. Se
// arma el índice una vez y con eso los goleadores de Libertadores dejan de
// salir sin equipo: buscarlos por nombre solo encontraba a los colombianos.
const LOGOS: Record<number, string> = (() => {
  const mapa: Record<number, string> = {};
  for (const comp of Object.values(JSON_DATOS?.competiciones ?? {}) as any[]) {
    for (const t of comp.torneos ?? []) {
      for (const f of t.tabla ?? []) {
        if (f.equipoId && f.logo && !mapa[f.equipoId]) mapa[f.equipoId] = f.logo;
      }
    }
    for (const r of comp.llaves ?? []) {
      for (const p of r.partidos ?? []) {
        if (p.localId && p.logoLocal && !mapa[p.localId]) mapa[p.localId] = p.logoLocal;
        if (p.visitanteId && p.logoVisitante && !mapa[p.visitanteId]) {
          mapa[p.visitanteId] = p.logoVisitante;
        }
      }
    }
  }
  return mapa;
})();

const anotadorDeJson = (a: any): Anotador => ({
  jugador: a.jugador,
  nombreCompleto: a.nombreCompleto ?? null,
  equipo: club(a.equipoId, a.equipo ?? ''),
  equipoId: a.equipoId ?? null,
  logo: escudoDeFila(a.equipoId, a.logo ?? (a.equipoId ? LOGOS[a.equipoId] : null)),
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
      llaves: (precalculado.llaves ?? []).map((r: any) => ({
        torneo: r.torneo ?? '',
        ronda: nombreTorneo(r.ronda),
        partidos: (r.partidos ?? []).map((p: any) => ({
          fecha: p.fecha ?? null,
          estado: p.estado ?? null,
          localId: p.localId ?? null,
          local: club(p.localId, p.local ?? ''),
          logoLocal: escudoDeFila(p.localId, p.logoLocal),
          visitanteId: p.visitanteId ?? null,
          visitante: club(p.visitanteId, p.visitante ?? ''),
          logoVisitante: escudoDeFila(p.visitanteId, p.logoVisitante),
          golesLocal: p.golesLocal ?? null,
          golesVisitante: p.golesVisitante ?? null,
          penalesLocal: p.penalesLocal ?? null,
          penalesVisitante: p.penalesVisitante ?? null
        }))
      })),
      porEquipo: Object.fromEntries(
        Object.entries(precalculado.porEquipo ?? {}).map(([id, v]: [string, any]) => [
          id,
          {
            goleadores: (v.goleadores ?? []).map(anotadorDeJson),
            asistencias: (v.asistencias ?? []).map(anotadorDeJson)
          }
        ])
      ),
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
    // La vía en vivo no reparte por club ni arma llaves: es el respaldo.
    porEquipo: {},
    llaves: [],
    fuente: vigente || est.goles.length ? 'api' : 'sin-datos'
  };
}

// Cliente de API-Football para datos en tiempo de BUILD.
// El sitio sigue siendo 100% estático: estos datos se hornean en el HTML
// y se refrescan en cada build (cron / deploy hook).
// Presupuesto: 4 requests por torneo por build (tabla, goleadores, asistencias
// y fixtures de la temporada). Con 3 torneos son 12 por build.

import { equipoPorApiId } from '../data/equipos';

/** El nombre del club como lo escribe el sitio, no como lo escribe la API.
 *  Si el id no está en nuestra base, se deja el nombre de la API tal cual. */
const nombreClub = (id?: number, porDefecto = '') =>
  equipoPorApiId(id)?.nombre ?? porDefecto;

const BASE = 'https://v3.football.api-sports.io';
const KEY = import.meta.env.API_FOOTBALL_KEY || process.env.API_FOOTBALL_KEY;

export interface FilaTabla {
  posicion: number;
  equipoId: number;
  equipo: string;
  logo: string;
  puntos: number;
  jugados: number;
  ganados: number;
  empatados: number;
  perdidos: number;
  golesFavor: number;
  golesContra: number;
  diferencia: number;
  racha: string | null;
}

export interface Partido {
  fecha: string;
  estado: string;
  localId: number;
  local: string;
  visitanteId: number;
  visitante: string;
  golesLocal: number | null;
  golesVisitante: number | null;
}

let avisado = false;

async function api(path: string): Promise<any[]> {
  if (!KEY) {
    if (!avisado) {
      console.warn(
        '\n[api-football] FALTA API_FOOTBALL_KEY en las variables de BUILD.\n' +
          '  Sin ella no se generan tablas de posiciones ni fichas de equipo.\n' +
          '  Cloudflare: Settings -> Build -> Variables and Secrets (NO las del Worker).\n'
      );
      avisado = true;
    }
    return [];
  }
  try {
    const res = await fetch(`${BASE}${path}`, { headers: { 'x-apisports-key': KEY } });
    if (!res.ok) {
      console.warn(`[api-football] ${res.status} en ${path}`);
      return [];
    }
    const json = await res.json();
    if (json.errors && Object.keys(json.errors).length) {
      console.warn(`[api-football] ${path} -> errores:`, JSON.stringify(json.errors));
    }
    const datos = json.response || [];
    console.log(`[api-football] ${path} -> ${datos.length} resultados`);
    return datos;
  } catch (e) {
    console.warn(`[api-football] error en ${path}:`, e);
    return [];
  }
}

export interface Torneo {
  /** Como lo llama la API: "Apertura", "Clausura", "Grupo A"... */
  nombre: string;
  filas: FilaTabla[];
}

const aFila = (f: any): FilaTabla => ({
  posicion: f.rank,
  equipoId: f.team.id,
  equipo: nombreClub(f.team?.id, f.team?.name),
  logo: f.team.logo,
  puntos: f.points,
  jugados: f.all.played,
  ganados: f.all.win,
  empatados: f.all.draw,
  perdidos: f.all.lose,
  golesFavor: f.all.goals.for,
  golesContra: f.all.goals.against,
  diferencia: f.goalsDiff,
  racha: f.form || null
});

/** Los torneos de una temporada, sin mezclar.
 *
 *  En Colombia una temporada tiene DOS campeonatos —Apertura y Clausura— y la
 *  API los devuelve como grupos dentro de la misma temporada. Antes esto hacía
 *  `.flat()` y salía una tabla de 40 filas con cada club repetido y los puntos
 *  de los dos torneos mezclados. */
export async function torneosDeTemporada(ligaId: number, season: number): Promise<Torneo[]> {
  const resp = await api(`/standings?league=${ligaId}&season=${season}`);
  const grupos: any[][] = resp[0]?.league?.standings || [];
  return grupos
    .filter((g) => g && g.length)
    .map((g, i) => ({ nombre: g[0]?.group || `Torneo ${i + 1}`, filas: g.map(aFila) }));
}

/** Cuál de los torneos está en curso.
 *
 *  Se toma el ÚLTIMO que ya tenga partidos jugados. En marzo el Clausura está
 *  en cero y gana el Apertura; en agosto los dos tienen partidos y gana el
 *  Clausura, que es el vigente. Se resuelve con los datos, sin fechas a mano
 *  ni una constante que haya que acordarse de mover a mitad de año. */
export function torneoVigente(torneos: Torneo[]): Torneo | null {
  const conJuego = torneos.filter((t) => t.filas.some((f) => f.jugados > 0));
  return conJuego.at(-1) ?? torneos[0] ?? null;
}

/** Tabla del torneo vigente. */
export async function tablaPosiciones(ligaId: number, season: number): Promise<FilaTabla[]> {
  return torneoVigente(await torneosDeTemporada(ligaId, season))?.filas ?? [];
}

export interface Anotador {
  jugador: string;
  equipo: string;
  cantidad: number;
  partidos: number;
}

/** Goleadores o asistidores de un torneo.
 *
 *  La API devuelve el jugador con un arreglo `statistics` (un elemento por
 *  club en el que jugó esa temporada). Se toma el primero, que es el club
 *  actual, y se suma el total de la métrica pedida. */
async function anotadores(
  ligaId: number,
  season: number,
  metrica: 'goals' | 'assists',
  limite: number
): Promise<Anotador[]> {
  const endpoint = metrica === 'goals' ? 'topscorers' : 'topassists';
  const resp = await api(`/players/${endpoint}?league=${ligaId}&season=${season}`);
  return resp
    .map((p: any) => {
      const st = p.statistics?.[0] ?? {};
      const cantidad = metrica === 'goals' ? st.goals?.total : st.goals?.assists;
      return {
        jugador: p.player?.name ?? '',
        equipo: nombreClub(st.team?.id, st.team?.name ?? ''),
        cantidad: cantidad ?? 0,
        partidos: st.games?.appearences ?? 0
      };
    })
    .filter((a: Anotador) => a.jugador && a.cantidad > 0)
    .slice(0, limite);
}

export const goleadores = (ligaId: number, season: number, limite = 10) =>
  anotadores(ligaId, season, 'goals', limite);

export const asistencias = (ligaId: number, season: number, limite = 10) =>
  anotadores(ligaId, season, 'assists', limite);

export async function fixturesTemporada(ligaId: number, season: number): Promise<Partido[]> {
  const resp = await api(`/fixtures?league=${ligaId}&season=${season}`);
  return resp.map((fx: any) => ({
    fecha: fx.fixture.date,
    estado: fx.fixture.status.short,
    localId: fx.teams.home.id,
    local: fx.teams.home.name,
    visitanteId: fx.teams.away.id,
    visitante: fx.teams.away.name,
    golesLocal: fx.goals.home,
    golesVisitante: fx.goals.away
  }));
}

/** Último partido jugado y próximo por jugar de un equipo, derivados localmente. */
export function ultimoYProximo(fixtures: Partido[], equipoId: number) {
  const del = fixtures
    .filter((p) => p.localId === equipoId || p.visitanteId === equipoId)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  const jugados = del.filter((p) => p.estado === 'FT');
  const porJugar = del.filter((p) => ['NS', 'TBD', 'PST'].includes(p.estado));
  return { ultimo: jugados.at(-1) || null, proximo: porJugar[0] || null };
}

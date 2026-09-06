// Cliente de API-Football para datos en tiempo de BUILD.
// El sitio sigue siendo 100% estático: estos datos se hornean en el HTML
// y se refrescan en cada build (cron / deploy hook).
// PRESUPUESTO DE REQUESTS
// Tabla y fixtures son 2 por torneo. Los goleadores son caros: cuando la
// temporada tiene dos campeonatos (Apertura/Clausura) hay que contarlos gol por
// gol, y eso es una llamada por partido jugado del torneo vigente —unas 50 a
// mitad de torneo, ~190 al final—. Es el precio de que el número sea cierto:
// /players/topscorers no sabe de torneos y devuelve el año entero.
// Todas las respuestas se cachean por build, así que cada ruta se pide una vez
// aunque la usen la sección, las 20 fichas de equipo y el índice de jugadores.

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
  id: number;
  /** "Clausura - 5", "Apertura - 19". De acá sale a qué torneo pertenece. */
  ronda: string;
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

// Un build pide la misma ruta muchas veces: /fixtures?league=239 lo necesitan la
// pagina de la seccion, las 20 fichas de equipo y el indice de jugadores. Como
// dentro de un build los datos no cambian, se guarda la promesa y se reusa.
const enCurso = new Map<string, Promise<any[]>>();
let pedidos = 0;

async function api(path: string): Promise<any[]> {
  const cacheada = enCurso.get(path);
  if (cacheada) return cacheada;
  const promesa = pedir(path);
  enCurso.set(path, promesa);
  return promesa;
}

/** Cuántas llamadas reales se hicieron en este build (el cache no cuenta). */
export const requestsHechos = () => pedidos;

async function pedir(path: string): Promise<any[]> {
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
    pedidos += 1;
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
  equipoId?: number | null;
  logo?: string | null;
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
        equipoId: st.team?.id ?? null,
        logo: st.team?.logo ?? null,
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
    id: fx.fixture.id,
    ronda: fx.league?.round ?? '',
    fecha: fx.fixture.date,
    estado: fx.fixture.status.short,
    localId: fx.teams.home.id,
    local: nombreClub(fx.teams.home?.id, fx.teams.home?.name),
    visitanteId: fx.teams.away.id,
    visitante: nombreClub(fx.teams.away?.id, fx.teams.away?.name),
    golesLocal: fx.goals.home,
    golesVisitante: fx.goals.away
  }));
}

// ---------------------------------------------------------------------------
// Goleadores y asistencias DEL TORNEO
// ---------------------------------------------------------------------------

/** Partidos ya terminados. Incluye alargue y penales: los goles cuentan igual
 *  (los de la tanda no, pero esos la API los marca aparte). */
const TERMINADO = ['FT', 'AET', 'PEN'];

/** ¿A qué torneo pertenece esta ronda? La API las nombra "Clausura - 5". */
const esDelTorneo = (ronda: string, torneo: string) =>
  ronda.toLowerCase().startsWith(torneo.toLowerCase());

/** Pide de a tandas para no abrir cien conexiones a la vez ni que la API corte. */
async function enTandas<T, R>(items: T[], tamano: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const salida: R[] = [];
  for (let i = 0; i < items.length; i += tamano) {
    salida.push(...(await Promise.all(items.slice(i, i + tamano).map(fn))));
  }
  return salida;
}

interface Acumulado {
  jugador: string;
  equipoId?: number;
  equipoNombre: string;
  equipoLogo?: string | null;
  goles: number;
  asistencias: number;
  partidos: Set<number>;
}

/** Goleadores y asistidores reconstruidos gol por gol.
 *
 *  POR QUÉ NO SE USA /players/topscorers
 *  Ese endpoint solo recibe liga y temporada, y en Colombia una temporada tiene
 *  DOS torneos. Devolvía a Rodallega con 13 goles en 27 partidos cuando el
 *  Clausura llevaba 5 fechas: estaba sumando el Apertura. Al lado de una tabla
 *  de posiciones que sí era del Clausura, la página se contradecía sola.
 *
 *  Las rondas vienen etiquetadas ("Clausura - 5"), así que se toman los partidos
 *  terminados de ese torneo y se cuentan sus goles. Cuesta una llamada por
 *  partido, que es el precio de que el número sea cierto. */
async function anotadoresPorEventos(
  ligaId: number,
  season: number,
  torneo: string,
  limite: number
): Promise<{ goles: Anotador[]; asistencias: Anotador[] }> {
  const fixtures = await fixturesTemporada(ligaId, season);
  const delTorneo = fixtures.filter(
    (p) => esDelTorneo(p.ronda, torneo) && TERMINADO.includes(p.estado)
  );
  if (!delTorneo.length) return { goles: [], asistencias: [] };

  console.log(
    `[api-football] goleadores de "${torneo}": ${delTorneo.length} partidos terminados`
  );
  const eventos = await enTandas(delTorneo, 6, (p) => api(`/fixtures/events?fixture=${p.id}`));

  const porJugador = new Map<string, Acumulado>();
  const anotar = (
    persona: any,
    equipo: any,
    campo: 'goles' | 'asistencias',
    fixtureId: number
  ) => {
    const nombre = persona?.name;
    if (!nombre) return;
    const clave = String(persona.id ?? nombre);
    if (!porJugador.has(clave)) {
      porJugador.set(clave, {
        jugador: nombre,
        equipoId: equipo?.id,
        equipoNombre: nombreClub(equipo?.id, equipo?.name ?? ''),
        equipoLogo: equipo?.logo ?? null,
        goles: 0,
        asistencias: 0,
        partidos: new Set()
      });
    }
    const acc = porJugador.get(clave)!;
    acc[campo] += 1;
    acc.partidos.add(fixtureId);
  };

  delTorneo.forEach((partido, i) => {
    for (const e of eventos[i] ?? []) {
      if (e.type !== 'Goal') continue;
      // El penal errado llega como evento de gol; el gol en contra no se le
      // acredita a nadie como goleador.
      if (e.detail === 'Missed Penalty' || e.detail === 'Own Goal') continue;
      anotar(e.player, e.team, 'goles', partido.id);
      if (e.assist?.name) anotar(e.assist, e.team, 'asistencias', partido.id);
    }
  });

  const orden = (campo: 'goles' | 'asistencias') =>
    [...porJugador.values()]
      .filter((a) => a[campo] > 0)
      .sort((a, b) => b[campo] - a[campo] || a.jugador.localeCompare(b.jugador))
      .slice(0, limite)
      .map((a) => ({
        jugador: a.jugador,
        equipo: a.equipoNombre,
        equipoId: a.equipoId ?? null,
        logo: a.equipoLogo ?? null,
        cantidad: a[campo],
        // Partidos en los que participó de un gol, NO partidos jugados: los
        // eventos no dicen quién estuvo en cancha. Se marca con 0 cuando no
        // se sabe, y la ficha del jugador muestra un guion.
        partidos: 0
      }));

  return { goles: orden('goles'), asistencias: orden('asistencias') };
}

/** Goleadores y asistencias de la competición, ya acotados al torneo vigente.
 *
 *  Si la temporada tiene un solo torneo —una copa, una liga europea— alcanza con
 *  /players/topscorers y son dos llamadas. Si tiene dos, hay que reconstruirlo. */
export async function estadisticasDelTorneo(
  ligaId: number,
  season: number,
  limite = 10
): Promise<{ goles: Anotador[]; asistencias: Anotador[]; torneo: string | null }> {
  const torneos = await torneosDeTemporada(ligaId, season);
  const vigente = torneoVigente(torneos);

  if (torneos.length > 1 && vigente) {
    const r = await anotadoresPorEventos(ligaId, season, vigente.nombre, limite);
    if (r.goles.length) return { ...r, torneo: vigente.nombre };
    // Sin goles reconstruidos (torneo recién arrancado, o la API sin eventos)
    // no se cae al total de la temporada: sería el número equivocado otra vez.
    return { goles: [], asistencias: [], torneo: vigente.nombre };
  }

  const [goles, asis] = await Promise.all([
    goleadores(ligaId, season, limite),
    asistencias(ligaId, season, limite)
  ]);
  return { goles, asistencias: asis, torneo: vigente?.nombre ?? null };
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

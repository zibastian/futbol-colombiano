// Cliente de API-Football para datos en tiempo de BUILD.
// El sitio sigue siendo 100% estático: estos datos se hornean en el HTML
// y se refrescan en cada build (cron / deploy hook).
// Presupuesto: 2 requests por torneo por build (tabla + fixtures de la temporada).

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

export async function tablaPosiciones(ligaId: number, season: number): Promise<FilaTabla[]> {
  const resp = await api(`/standings?league=${ligaId}&season=${season}`);
  const grupos = resp[0]?.league?.standings || [];
  const filas = grupos.flat();
  return filas.map((f: any) => ({
    posicion: f.rank,
    equipoId: f.team.id,
    equipo: f.team.name,
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
  }));
}

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

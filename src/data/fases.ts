// Fases de un torneo largo del FPC.
//
// La Liga BetPlay y el Torneo BetPlay no son una tabla sola: son tres momentos
// distintos y cada uno se lee de otra forma.
//
//   1. TODOS CONTRA TODOS — 19 fechas, 20 equipos, clasifican los ocho primeros.
//      Se lee como una tabla única con la zona de clasificación marcada.
//   2. CUADRANGULARES SEMIFINALES — los ocho se reparten en dos grupos de cuatro
//      (A y B) y juegan ida y vuelta. Se lee como dos tablas chicas.
//      El líder de cada grupo pasa a la final.
//   3. FINAL — ida y vuelta entre los dos líderes. Cierra de local el que haya
//      quedado mejor en la reclasificación. Se lee como una llave, no como tabla.
//
// El sitio muestra las tres cosas a la vez cuando corresponde: al llegar a los
// cuadrangulares la gente sigue queriendo ver el todos contra todos, así que la
// fase vigente va arriba y las anteriores quedan abajo, no desaparecen.
//
// `FASE_ACTUAL` es lo único que hay que mover cuando el torneo avanza. Cuando la
// API entregue datos reales, esto sale del calendario en vez de escribirse a mano.

export type Fase = 'todos-contra-todos' | 'cuadrangulares' | 'final';

export const NOMBRE_FASE: Record<Fase, string> = {
  'todos-contra-todos': 'Todos contra todos',
  cuadrangulares: 'Cuadrangulares semifinales',
  final: 'Final'
};

/** Fase en la que está hoy cada torneo. */
export const FASE_ACTUAL: Record<string, Fase> = {
  'liga-betplay': 'cuadrangulares',
  'torneo-betplay': 'todos-contra-todos',
  // 16 fechas a una vuelta más la fecha de clásicos; los ocho primeros pasan.
  'liga-femenina': 'todos-contra-todos'
};

export const faseDe = (slug: string): Fase => FASE_ACTUAL[slug] ?? 'todos-contra-todos';

/** ¿Ya se jugó esta fase? Sirve para decidir qué bloques se muestran. */
const ORDEN: Fase[] = ['todos-contra-todos', 'cuadrangulares', 'final'];
export const faseAlcanzada = (slug: string, fase: Fase) =>
  ORDEN.indexOf(faseDe(slug)) >= ORDEN.indexOf(fase);

// ---------------------------------------------------------------------------
// Datos de ejemplo (mientras el plan Free de API-Football no dé la temporada)
// ---------------------------------------------------------------------------

export const FASES_DEMO = true;

export interface FilaCuadrangular {
  equipo: string;
  pj: number; g: number; e: number; p: number; gf: number; gc: number;
}

export interface Cuadrangular {
  nombre: string;
  filas: FilaCuadrangular[];
}

/** Lo que consume TablaPosiciones: ya ordenado y con puntos y diferencia. */
export interface FilaTabla extends FilaCuadrangular {
  posicion: number;
  pts: number;
  dg: number;
}

/** Cuadrangulares semifinales: dos grupos de cuatro, ida y vuelta (6 fechas). */
const CUADRANGULARES: Cuadrangular[] = [
  {
    nombre: 'Grupo A',
    filas: [
      { equipo: 'Atlético Nacional', pj: 4, g: 3, e: 1, p: 0, gf: 7, gc: 2 },
      { equipo: 'Independiente Santa Fe', pj: 4, g: 2, e: 1, p: 1, gf: 5, gc: 4 },
      { equipo: 'Deportes Tolima', pj: 4, g: 1, e: 1, p: 2, gf: 4, gc: 5 },
      { equipo: 'Atlético Bucaramanga', pj: 4, g: 0, e: 1, p: 3, gf: 2, gc: 7 }
    ]
  },
  {
    nombre: 'Grupo B',
    filas: [
      { equipo: 'Atlético Junior', pj: 4, g: 2, e: 2, p: 0, gf: 6, gc: 3 },
      { equipo: 'América de Cali', pj: 4, g: 2, e: 1, p: 1, gf: 5, gc: 3 },
      { equipo: 'Millonarios', pj: 4, g: 1, e: 1, p: 2, gf: 4, gc: 5 },
      { equipo: 'Independiente Medellín', pj: 4, g: 0, e: 2, p: 2, gf: 3, gc: 7 }
    ]
  }
];

/** Los puntos y la diferencia no se guardan a mano: se calculan, así una
 *  corrección en un resultado no deja la tabla inconsistente. */
export const cuadrangulares = (): { nombre: string; filas: FilaTabla[] }[] =>
  CUADRANGULARES.map((c) => ({
    nombre: c.nombre,
    filas: [...c.filas]
      .map((f) => ({ ...f, pts: f.g * 3 + f.e, dg: f.gf - f.gc }))
      .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf)
      .map((f, i) => ({ ...f, posicion: i + 1 }))
  }));

export interface PartidoFinal {
  local: string;
  visitante: string;
  golesLocal: number | null;
  golesVisitante: number | null;
  estadio?: string;
  cuando: string;
}

export interface Final {
  ida: PartidoFinal;
  vuelta: PartidoFinal;
  /** Quién cierra de local, por reclasificación. */
  ventajaLocalia: string;
}

/** La final es una llave, no una tabla: dos partidos y un global. */
export const FINAL_DEMO: Final = {
  ida: {
    local: 'Atlético Junior',
    visitante: 'Atlético Nacional',
    golesLocal: null,
    golesVisitante: null,
    estadio: 'Metropolitano Roberto Meléndez',
    cuando: 'Miércoles 8:30 p. m.'
  },
  vuelta: {
    local: 'Atlético Nacional',
    visitante: 'Atlético Junior',
    golesLocal: null,
    golesVisitante: null,
    estadio: 'Atanasio Girardot',
    cuando: 'Domingo 6:00 p. m.'
  },
  ventajaLocalia: 'Atlético Nacional'
};

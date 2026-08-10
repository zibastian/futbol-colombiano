// Liga Femenina BetPlay — datos de EJEMPLO mientras no haya plan Pro de API.
//
// Los 16 clubes son los reales de la edición 2026: son fichas de los mismos
// clubes del FPC, así que los escudos y las fichas de equipo se reutilizan tal
// cual. Lo único inventado son los resultados.
//
// Formato 2026: 16 fechas (todos contra todos a una vuelta más una fecha de
// clásicos) y los ocho primeros pasan a cuadrangulares. Mismo modelo de fases
// que la Liga BetPlay, así que la página usa exactamente los mismos componentes.

import type { Anotador } from './estadisticas-demo';

export const FEMENINA_DEMO = true;

interface Base {
  equipo: string;
  pj: number; g: number; e: number; p: number; gf: number; gc: number;
}

const base: Base[] = [
  { equipo: 'Atlético Nacional', pj: 8, g: 6, e: 2, p: 0, gf: 18, gc: 4 },
  { equipo: 'América de Cali', pj: 8, g: 6, e: 1, p: 1, gf: 17, gc: 6 },
  { equipo: 'Independiente Santa Fe', pj: 8, g: 5, e: 2, p: 1, gf: 14, gc: 7 },
  { equipo: 'Deportivo Cali', pj: 8, g: 5, e: 1, p: 2, gf: 13, gc: 8 },
  { equipo: 'Millonarios', pj: 8, g: 4, e: 2, p: 2, gf: 11, gc: 8 },
  { equipo: 'Independiente Medellín', pj: 8, g: 4, e: 1, p: 3, gf: 12, gc: 10 },
  { equipo: 'Atlético Junior', pj: 8, g: 3, e: 3, p: 2, gf: 10, gc: 9 },
  { equipo: 'Atlético Bucaramanga', pj: 8, g: 3, e: 2, p: 3, gf: 9, gc: 9 },
  { equipo: 'Internacional de Bogotá', pj: 8, g: 3, e: 2, p: 3, gf: 8, gc: 9 },
  { equipo: 'Once Caldas', pj: 8, g: 3, e: 1, p: 4, gf: 9, gc: 11 },
  { equipo: 'Deportivo Pasto', pj: 8, g: 2, e: 3, p: 3, gf: 8, gc: 10 },
  { equipo: 'Fortaleza', pj: 8, g: 2, e: 2, p: 4, gf: 7, gc: 11 },
  { equipo: 'Llaneros', pj: 8, g: 2, e: 1, p: 5, gf: 6, gc: 13 },
  { equipo: 'Orsomarso', pj: 8, g: 1, e: 3, p: 4, gf: 6, gc: 12 },
  { equipo: 'Real Santander', pj: 8, g: 1, e: 2, p: 5, gf: 5, gc: 14 },
  { equipo: 'Internacional de Palmira', pj: 8, g: 0, e: 2, p: 6, gf: 4, gc: 15 }
];

/** Puntos, diferencia y posición se calculan: nunca se escriben a mano. */
export const tablaFemenina = base
  .map((f) => ({ ...f, pts: f.g * 3 + f.e, dg: f.gf - f.gc }))
  .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf)
  .map((f, i) => ({ ...f, posicion: i + 1 }));

export const goleadorasFemenina: Anotador[] = [
  { jugador: 'Linda Caicedo', equipo: 'Atlético Nacional', cantidad: 9, partidos: 8 },
  { jugador: 'Catalina Usme', equipo: 'América de Cali', cantidad: 8, partidos: 8 },
  { jugador: 'Mayra Ramírez', equipo: 'Independiente Santa Fe', cantidad: 7, partidos: 8 },
  { jugador: 'Ivonne Chacón', equipo: 'Deportivo Cali', cantidad: 6, partidos: 7 },
  { jugador: 'Gabriela Rodríguez', equipo: 'Millonarios', cantidad: 5, partidos: 8 },
  { jugador: 'Wendy Bonilla', equipo: 'Independiente Medellín', cantidad: 5, partidos: 8 },
  { jugador: 'Manuela Pavi', equipo: 'Atlético Junior', cantidad: 4, partidos: 8 },
  { jugador: 'Karla Torres', equipo: 'Atlético Bucaramanga', cantidad: 4, partidos: 7 },
  { jugador: 'Sofía Martínez', equipo: 'Once Caldas', cantidad: 3, partidos: 8 },
  { jugador: 'Daniela Arias', equipo: 'Internacional de Bogotá', cantidad: 3, partidos: 8 }
];

export const asistenciasFemenina: Anotador[] = [
  { jugador: 'Leicy Santos', equipo: 'América de Cali', cantidad: 6, partidos: 8 },
  { jugador: 'Daniela Montoya', equipo: 'Atlético Nacional', cantidad: 5, partidos: 8 },
  { jugador: 'Gisela Robledo', equipo: 'Independiente Santa Fe', cantidad: 4, partidos: 8 },
  { jugador: 'Ilana Izquierdo', equipo: 'Deportivo Cali', cantidad: 4, partidos: 8 },
  { jugador: 'Yunaira López', equipo: 'Millonarios', cantidad: 3, partidos: 7 },
  { jugador: 'Marcela Restrepo', equipo: 'Independiente Medellín', cantidad: 3, partidos: 8 },
  { jugador: 'Nicole Regnier', equipo: 'Atlético Junior', cantidad: 3, partidos: 8 },
  { jugador: 'Valentina Ospina', equipo: 'Fortaleza', cantidad: 2, partidos: 8 }
];

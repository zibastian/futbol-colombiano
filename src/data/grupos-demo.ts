// Fase de grupos del Torneo BetPlay (datos de EJEMPLO mientras no haya plan Pro).
// Al conectar la API: poner GRUPOS_DEMO = false.
export const GRUPOS_DEMO = true;

interface FilaGrupo {
  equipo: string;
  pj: number; g: number; e: number; p: number; gf: number; gc: number;
}

const grupos: { nombre: string; equipos: FilaGrupo[] }[] = [
  {
    nombre: 'Grupo A',
    equipos: [
      { equipo: 'Cúcuta Deportivo', pj: 4, g: 3, e: 1, p: 0, gf: 8, gc: 3 },
      { equipo: 'Real Cartagena', pj: 4, g: 2, e: 1, p: 1, gf: 6, gc: 4 },
      { equipo: 'Barranquilla FC', pj: 4, g: 1, e: 2, p: 1, gf: 4, gc: 4 },
      { equipo: 'Unión Magdalena', pj: 4, g: 1, e: 0, p: 3, gf: 3, gc: 6 },
      { equipo: 'Real Santander', pj: 4, g: 0, e: 2, p: 2, gf: 2, gc: 6 }
    ]
  },
  {
    nombre: 'Grupo B',
    equipos: [
      { equipo: 'Atlético Huila', pj: 4, g: 3, e: 0, p: 1, gf: 7, gc: 3 },
      { equipo: 'Deportes Quindío', pj: 4, g: 2, e: 2, p: 0, gf: 6, gc: 2 },
      { equipo: 'Deportivo Popayán', pj: 4, g: 1, e: 1, p: 2, gf: 4, gc: 5 },
      { equipo: 'Orsomarso', pj: 4, g: 1, e: 1, p: 2, gf: 3, gc: 5 },
      { equipo: 'Depor FC', pj: 4, g: 0, e: 2, p: 2, gf: 2, gc: 7 }
    ]
  },
  {
    nombre: 'Grupo C',
    equipos: [
      { equipo: 'Patriotas', pj: 4, g: 2, e: 2, p: 0, gf: 5, gc: 2 },
      { equipo: 'Bogotá FC', pj: 4, g: 2, e: 1, p: 1, gf: 5, gc: 3 },
      { equipo: 'Tigres', pj: 4, g: 2, e: 0, p: 2, gf: 4, gc: 4 },
      { equipo: 'Internacional de Bogotá', pj: 4, g: 1, e: 0, p: 3, gf: 3, gc: 6 },
      { equipo: 'Real Soacha Cundinamarca', pj: 4, g: 0, e: 1, p: 3, gf: 2, gc: 8 }
    ]
  },
  {
    nombre: 'Grupo D',
    equipos: [
      { equipo: 'Leones', pj: 4, g: 3, e: 0, p: 1, gf: 6, gc: 2 },
      { equipo: 'Internacional de Palmira', pj: 4, g: 2, e: 1, p: 1, gf: 5, gc: 4 },
      { equipo: 'Llaneros', pj: 4, g: 1, e: 2, p: 1, gf: 4, gc: 4 },
      { equipo: 'Envigado', pj: 4, g: 1, e: 1, p: 2, gf: 3, gc: 4 }
    ]
  }
];

export const gruposDemo = grupos.map((g) => ({
  nombre: g.nombre,
  filas: g.equipos
    .map((f) => ({ ...f, pts: f.g * 3 + f.e, dg: f.gf - f.gc }))
    .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf)
    .map((f, i) => ({ posicion: i + 1, ...f }))
}));

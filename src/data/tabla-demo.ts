// Tabla de posiciones de EJEMPLO para validar el diseño mientras el plan
// de API-Football sea Free (no da acceso a la temporada actual).
// Al contratar el plan Pro: poner TABLA_DEMO = false y borrar este archivo.
export const TABLA_DEMO = true;

interface FilaDemo {
  equipo: string;
  pj: number; g: number; e: number; p: number; gf: number; gc: number;
}

const base: FilaDemo[] = [
  { equipo: 'América de Cali', pj: 3, g: 3, e: 0, p: 0, gf: 11, gc: 1 },
  { equipo: 'Millonarios', pj: 3, g: 3, e: 0, p: 0, gf: 5, gc: 1 },
  { equipo: 'Independiente Santa Fe', pj: 3, g: 2, e: 1, p: 0, gf: 7, gc: 2 },
  { equipo: 'Atlético Nacional', pj: 3, g: 2, e: 1, p: 0, gf: 6, gc: 3 },
  { equipo: 'Junior de Barranquilla', pj: 3, g: 1, e: 1, p: 1, gf: 4, gc: 4 },
  { equipo: 'Deportes Tolima', pj: 3, g: 1, e: 1, p: 1, gf: 3, gc: 3 },
  { equipo: 'Independiente Medellín', pj: 3, g: 1, e: 1, p: 1, gf: 4, gc: 4 },
  { equipo: 'Once Caldas', pj: 3, g: 1, e: 1, p: 1, gf: 3, gc: 3 },
  { equipo: 'Deportivo Pereira', pj: 3, g: 1, e: 1, p: 1, gf: 2, gc: 2 },
  { equipo: 'Atlético Bucaramanga', pj: 3, g: 1, e: 1, p: 1, gf: 3, gc: 4 },
  { equipo: 'Deportivo Cali', pj: 3, g: 1, e: 0, p: 2, gf: 3, gc: 4 },
  { equipo: 'Alianza', pj: 3, g: 1, e: 0, p: 2, gf: 2, gc: 3 },
  { equipo: 'Fortaleza', pj: 3, g: 1, e: 0, p: 2, gf: 2, gc: 4 },
  { equipo: 'La Equidad', pj: 3, g: 0, e: 2, p: 1, gf: 2, gc: 3 },
  { equipo: 'Envigado', pj: 3, g: 0, e: 2, p: 1, gf: 1, gc: 2 },
  { equipo: 'Jaguares de Córdoba', pj: 3, g: 0, e: 2, p: 1, gf: 1, gc: 3 },
  { equipo: 'Águilas Doradas', pj: 3, g: 0, e: 1, p: 2, gf: 2, gc: 5 },
  { equipo: 'Llaneros', pj: 3, g: 0, e: 1, p: 2, gf: 1, gc: 4 },
  { equipo: 'Deportivo Pasto', pj: 3, g: 0, e: 1, p: 2, gf: 1, gc: 5 },
  { equipo: 'Boyacá Chicó', pj: 3, g: 0, e: 0, p: 3, gf: 0, gc: 9 }
];

export const tablaDemo = base
  .map((f) => ({ ...f, pts: f.g * 3 + f.e, dg: f.gf - f.gc }))
  .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf)
  .map((f, i) => ({ posicion: i + 1, ...f }));

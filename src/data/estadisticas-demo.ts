// Goleadores, asistencias y tabla del descenso (datos de EJEMPLO).
// Al conectar el plan Pro de API-Football estos arreglos se reemplazan por
// /players/topscorers y /players/topassists; la forma de los datos es la misma.
export const ESTADISTICAS_DEMO = true;

export interface Anotador {
  jugador: string;
  equipo: string;
  cantidad: number;
  partidos: number;
}

export interface FilaDescenso {
  equipo: string;
  puntos: number;    // puntos acumulados en el trienio
  partidos: number;  // partidos del trienio
}

export const goleadoresLiga: Anotador[] = [
  { jugador: 'Yeison Guzmán', equipo: 'América de Cali', cantidad: 5, partidos: 3 },
  { jugador: 'Hugo Rodallega', equipo: 'Independiente Santa Fe', cantidad: 4, partidos: 3 },
  { jugador: 'Edwin Cardona', equipo: 'Atlético Nacional', cantidad: 3, partidos: 3 },
  { jugador: 'Leonardo Castro', equipo: 'Millonarios', cantidad: 3, partidos: 3 },
  { jugador: 'Adrián Ramos', equipo: 'América de Cali', cantidad: 3, partidos: 2 },
  { jugador: 'Dayro Moreno', equipo: 'Once Caldas', cantidad: 2, partidos: 3 },
  { jugador: 'Marco Pérez', equipo: 'Deportes Tolima', cantidad: 2, partidos: 3 },
  { jugador: 'Luis Sandoval', equipo: 'Junior de Barranquilla', cantidad: 2, partidos: 3 },
  { jugador: 'Francisco Fydriszewski', equipo: 'Independiente Medellín', cantidad: 2, partidos: 3 },
  { jugador: 'Jáder Valencia', equipo: 'Atlético Bucaramanga', cantidad: 2, partidos: 3 }
];

export const asistenciasLiga: Anotador[] = [
  { jugador: 'Edwin Cardona', equipo: 'Atlético Nacional', cantidad: 4, partidos: 3 },
  { jugador: 'Daniel Cataño', equipo: 'Millonarios', cantidad: 3, partidos: 3 },
  { jugador: 'Rafael Carrascal', equipo: 'Atlético Nacional', cantidad: 2, partidos: 3 },
  { jugador: 'Yeison Guzmán', equipo: 'América de Cali', cantidad: 2, partidos: 3 },
  { jugador: 'Hugo Rodallega', equipo: 'Independiente Santa Fe', cantidad: 2, partidos: 3 },
  { jugador: 'Didier Moreno', equipo: 'Independiente Medellín', cantidad: 2, partidos: 3 },
  { jugador: 'Fabián Sambueza', equipo: 'Junior de Barranquilla', cantidad: 2, partidos: 3 },
  { jugador: 'Larry Vásquez', equipo: 'Deportes Tolima', cantidad: 1, partidos: 3 },
  { jugador: 'Robert Mejía', equipo: 'Deportivo Pereira', cantidad: 1, partidos: 3 },
  { jugador: 'Jhon Vásquez', equipo: 'Once Caldas', cantidad: 1, partidos: 3 }
];

export const goleadoresTorneo: Anotador[] = [
  { jugador: 'Jhon Córdoba', equipo: 'Cúcuta Deportivo', cantidad: 4, partidos: 4 },
  { jugador: 'Andrés Sarmiento', equipo: 'Atlético Huila', cantidad: 3, partidos: 4 },
  { jugador: 'Carlos Peralta', equipo: 'Real Cartagena', cantidad: 3, partidos: 4 },
  { jugador: 'Julián Quiñones', equipo: 'Deportes Quindío', cantidad: 2, partidos: 4 },
  { jugador: 'Miguel Nazarith', equipo: 'Unión Magdalena', cantidad: 2, partidos: 4 },
  { jugador: 'Andrés Correa', equipo: 'Patriotas', cantidad: 2, partidos: 4 }
];

export const asistenciasTorneo: Anotador[] = [
  { jugador: 'Sebastián Ramírez', equipo: 'Cúcuta Deportivo', cantidad: 3, partidos: 4 },
  { jugador: 'Óscar Estupiñán', equipo: 'Deportes Quindío', cantidad: 2, partidos: 4 },
  { jugador: 'Kevin Rendón', equipo: 'Atlético Huila', cantidad: 2, partidos: 4 },
  { jugador: 'Camilo Ayala', equipo: 'Bogotá FC', cantidad: 1, partidos: 4 },
  { jugador: 'Daniel Hernández', equipo: 'Leones', cantidad: 1, partidos: 4 }
];

export const goleadoresCopa: Anotador[] = [
  { jugador: 'Dayro Moreno', equipo: 'Once Caldas', cantidad: 3, partidos: 4 },
  { jugador: 'Jhon Córdoba', equipo: 'Cúcuta Deportivo', cantidad: 3, partidos: 4 },
  { jugador: 'Luis Sandoval', equipo: 'Junior de Barranquilla', cantidad: 2, partidos: 3 },
  { jugador: 'Andrés Sarmiento', equipo: 'Atlético Huila', cantidad: 2, partidos: 4 },
  { jugador: 'Marco Pérez', equipo: 'Deportes Tolima', cantidad: 2, partidos: 4 }
];

export const asistenciasCopa: Anotador[] = [
  { jugador: 'Fabián Sambueza', equipo: 'Junior de Barranquilla', cantidad: 2, partidos: 3 },
  { jugador: 'Sebastián Ramírez', equipo: 'Cúcuta Deportivo', cantidad: 2, partidos: 4 },
  { jugador: 'Jhon Vásquez', equipo: 'Once Caldas', cantidad: 2, partidos: 4 },
  { jugador: 'Larry Vásquez', equipo: 'Deportes Tolima', cantidad: 1, partidos: 4 }
];

// Descenso: promedio de puntos por partido en los últimos tres años (solo Liga BetPlay)
const descensoBase: FilaDescenso[] = [
  { equipo: 'Atlético Nacional', puntos: 168, partidos: 114 },
  { equipo: 'Millonarios', puntos: 165, partidos: 114 },
  { equipo: 'América de Cali', puntos: 158, partidos: 114 },
  { equipo: 'Independiente Santa Fe', puntos: 154, partidos: 114 },
  { equipo: 'Junior de Barranquilla', puntos: 152, partidos: 114 },
  { equipo: 'Deportes Tolima', puntos: 150, partidos: 114 },
  { equipo: 'Independiente Medellín', puntos: 148, partidos: 114 },
  { equipo: 'Atlético Bucaramanga', puntos: 146, partidos: 114 },
  { equipo: 'Once Caldas', puntos: 142, partidos: 114 },
  { equipo: 'Deportivo Pereira', puntos: 138, partidos: 114 },
  { equipo: 'Águilas Doradas', puntos: 134, partidos: 114 },
  { equipo: 'Deportivo Cali', puntos: 130, partidos: 114 },
  { equipo: 'Jaguares de Córdoba', puntos: 126, partidos: 114 },
  { equipo: 'La Equidad', puntos: 124, partidos: 114 },
  { equipo: 'Envigado', puntos: 120, partidos: 114 },
  { equipo: 'Alianza', puntos: 118, partidos: 114 },
  { equipo: 'Deportivo Pasto', puntos: 116, partidos: 114 },
  { equipo: 'Boyacá Chicó', puntos: 96, partidos: 114 },
  { equipo: 'Fortaleza', puntos: 62, partidos: 76 },
  { equipo: 'Llaneros', puntos: 24, partidos: 38 }
];

export const tablaDescenso = descensoBase
  .map((f) => ({ ...f, promedio: f.puntos / f.partidos }))
  .sort((a, b) => b.promedio - a.promedio)
  .map((f, i) => ({ posicion: i + 1, ...f }));

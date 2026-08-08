// Jugadores con ficha destacada: leyendas e ídolos vigentes del fútbol colombiano.
// Los demás jugadores siguen teniendo su hub normal (solo el listado de notas).

export interface JugadorDestacado {
  slug: string;
  nombre: string;
  apodo?: string;
  posicion: string;
  nacimiento: string;      // año o fecha
  origen: string;          // ciudad, departamento
  clubes: string[];
  seleccion?: string;      // resumen de su paso por la Selección
  logro: string;           // el dato que lo define
  descripcion: string;
  vigente: boolean;        // true = jugador en activo
  color: string;
}

export const JUGADORES_DESTACADOS: JugadorDestacado[] = [
  {
    slug: 'carlos-valderrama', nombre: 'Carlos Valderrama', apodo: 'El Pibe',
    posicion: 'Volante creativo', nacimiento: '1961', origen: 'Santa Marta, Magdalena',
    clubes: ['Unión Magdalena', 'Millonarios', 'Deportivo Cali', 'Montpellier', 'Valladolid', 'Tampa Bay Mutiny'],
    seleccion: '111 partidos y 11 goles con Colombia; tres Mundiales (1990, 1994 y 1998).',
    logro: 'Dos veces Futbolista Sudamericano del Año (1987 y 1993), el único colombiano en repetir.',
    descripcion: 'El símbolo de la generación dorada del fútbol colombiano. Su melena, su pausa y su visión de juego definieron una manera de jugar que marcó a un país entero. Fue el capitán del equipo que goleó 5-0 a Argentina en el Monumental.',
    vigente: false, color: '#F2C200'
  },
  {
    slug: 'faustino-asprilla', nombre: 'Faustino Asprilla', apodo: 'El Tino',
    posicion: 'Delantero', nacimiento: '1969', origen: 'Tuluá, Valle del Cauca',
    clubes: ['Cúcuta Deportivo', 'Atlético Nacional', 'Parma', 'Newcastle United', 'Palmeiras'],
    seleccion: '57 partidos y 20 goles con Colombia; Mundiales de 1994 y 1998.',
    logro: 'Campeón de la Copa UEFA y la Recopa con Parma; autor de dos goles en el 5-0 a Argentina.',
    descripcion: 'Desequilibrio puro. Impredecible dentro y fuera de la cancha, fue de los primeros colombianos en triunfar en el fútbol italiano e inglés. Su hat-trick ante el Barcelona en Champions con el Newcastle sigue siendo parte de la memoria del fútbol europeo.',
    vigente: false, color: '#1D9E75'
  },
  {
    slug: 'radamel-falcao-garcia', nombre: 'Radamel Falcao García', apodo: 'El Tigre',
    posicion: 'Delantero centro', nacimiento: '1986', origen: 'Santa Marta, Magdalena',
    clubes: ['Lanceros Boyacá', 'River Plate', 'Porto', 'Atlético de Madrid', 'Mónaco', 'Galatasaray', 'Rayo Vallecano', 'Millonarios'],
    seleccion: 'Máximo goleador histórico de la Selección Colombia con 36 goles.',
    logro: 'Campeón de la Europa League con Porto y con Atlético de Madrid, siendo goleador de ambas ediciones.',
    descripcion: 'El goleador más completo que ha dado Colombia. Su definición dentro del área y su juego aéreo lo llevaron a ser considerado el mejor número nueve del mundo entre 2011 y 2013. Cerró su carrera en Colombia, cumpliendo la promesa de vestir la camiseta de Millonarios.',
    vigente: false, color: '#B3271E'
  },
  {
    slug: 'james-rodriguez', nombre: 'James Rodríguez', posicion: 'Mediapunta',
    nacimiento: '1991', origen: 'Cúcuta, Norte de Santander',
    clubes: ['Envigado', 'Banfield', 'Porto', 'Mónaco', 'Real Madrid', 'Bayern Múnich', 'Everton', 'São Paulo'],
    seleccion: 'Máximo asistidor histórico de la Selección; figura en los Mundiales de 2014 y 2018.',
    logro: 'Botín de Oro del Mundial 2014 con seis goles, incluido el mejor gol del torneo ante Uruguay.',
    descripcion: 'El zurdo que hizo soñar a Colombia en Brasil 2014. Formado en Envigado, llegó al Real Madrid tras aquel Mundial y ganó dos Champions League. Su golpeo de balón y su capacidad para el último pase lo convirtieron en el jugador colombiano más determinante de su generación.',
    vigente: true, color: '#0B2C5E'
  },
  {
    slug: 'luis-diaz', nombre: 'Luis Díaz', apodo: 'Lucho',
    posicion: 'Extremo izquierdo', nacimiento: '1997', origen: 'Barrancas, La Guajira',
    clubes: ['Barranquilla FC', 'Junior de Barranquilla', 'Porto', 'Liverpool', 'Bayern Múnich'],
    seleccion: 'Goleador de la Copa América 2021 junto a Messi; figura de la final de 2024.',
    logro: 'Campeón de la FA Cup, la Carabao Cup y la Premier League con el Liverpool.',
    descripcion: 'Salió de la Guajira y de los torneos indígenas para convertirse en uno de los extremos más desequilibrantes de Europa. Su uno contra uno, su ritmo y su capacidad de definir con ambas piernas lo hicieron figura en la Premier League antes de dar el salto a la Bundesliga.',
    vigente: true, color: '#B3271E'
  },
  {
    slug: 'rene-higuita', nombre: 'René Higuita', apodo: 'El Loco',
    posicion: 'Arquero', nacimiento: '1966', origen: 'Medellín, Antioquia',
    clubes: ['Millonarios', 'Atlético Nacional', 'Veracruz', 'Aucas'],
    seleccion: '68 partidos con Colombia; Mundial de 1990 y Copas América.',
    logro: 'Campeón de la Copa Libertadores 1989 con Atlético Nacional, el primer título continental de un club colombiano.',
    descripcion: 'Cambió la manera de entender el puesto de arquero: salía a jugar como un líbero más y cobraba tiros libres. Su "escorpión" en Wembley ante Inglaterra en 1995 dio la vuelta al mundo y sigue siendo una de las imágenes más recordadas del fútbol.',
    vigente: false, color: '#1D9E75'
  },
  {
    slug: 'freddy-rincon', nombre: 'Freddy Rincón', apodo: 'El Coloso',
    posicion: 'Volante', nacimiento: '1966', origen: 'Buenaventura, Valle del Cauca',
    clubes: ['América de Cali', 'Independiente Medellín', 'Palmeiras', 'Real Madrid', 'Corinthians'],
    seleccion: '84 partidos y 17 goles; tres Mundiales con Colombia.',
    logro: 'Autor del gol del 1-1 ante Alemania en Italia 90, el primer punto de Colombia ante un campeón del mundo.',
    descripcion: 'Potencia y jerarquía en el medio campo. Fue campeón del Mundial de Clubes con Corinthians y uno de los primeros colombianos en jugar en el Real Madrid. Su gol agónico ante Alemania está entre los momentos más celebrados de la historia del fútbol colombiano.',
    vigente: false, color: '#0B2C5E'
  }
];

const normaliza = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export const jugadorDestacadoPorSlug = (slug: string) =>
  JUGADORES_DESTACADOS.find((j) => j.slug === slug);

export const jugadorDestacadoPorNombre = (nombre: string) =>
  JUGADORES_DESTACADOS.find((j) => normaliza(j.nombre) === normaliza(nombre));

// Columnistas del portal.
// Cada uno es un agente con voz propia: su personalidad vive en
// fc-plataforma/fabrica/config/columnistas.yml y su ficha pública, aquí.
// La opinión SIEMPRE la revisa y firma un humano antes de publicarse.

export interface Columnista {
  slug: string;
  nombre: string;
  seudonimo?: string;
  linea: string;        // una frase que resume su mirada
  bio: string;
  temas: string[];
  color: string;        // color de acento de su ficha
  /** Si sigue a un club en particular (columnistas de equipo) */
  equipo?: string;
  /** Su tono cambia según el momento del equipo: ánimo si va bien, exigencia si va mal */
  tonoAdaptativo?: boolean;
}

export const COLUMNISTAS: Columnista[] = [
  {
    slug: 'la-tribuna',
    nombre: 'La Tribuna',
    linea: 'La voz del hincha que va al estadio.',
    bio: 'Escribe desde la grada, no desde el palco. Le interesa lo que se siente en el estadio: el precio de la boleta, el estado de la cancha, el trato al hincha visitante. Discute con pasión pero con datos, y no le teme a criticar a los directivos de su propio equipo.',
    temas: ['Hinchada', 'Estadios', 'Dirigencia'],
    color: '#B3271E'
  },
  {
    slug: 'pizarra',
    nombre: 'Pizarra',
    linea: 'El fútbol explicado desde el tablero táctico.',
    bio: 'Analiza lo que pasa entre líneas: estructuras, presión, transiciones y decisiones de los técnicos. Traduce el vocabulario táctico a un lenguaje que cualquiera entiende, sin simplificar de más ni escudarse en tecnicismos.',
    temas: ['Táctica', 'Entrenadores', 'Análisis de partido'],
    color: '#0B2C5E'
  },
  {
    slug: 'cantera',
    nombre: 'Cantera',
    linea: 'El futuro del fútbol colombiano se juega en las divisiones menores.',
    bio: 'Sigue a los juveniles antes de que sean noticia: torneos sub-20, debuts, procesos de formación y el negocio de las transferencias de jugadores jóvenes. Defiende que el mejor negocio del FPC es formar, no comprar.',
    temas: ['Divisiones menores', 'Juveniles', 'Formación'],
    color: '#1D9E75'
  },
  {
    slug: 'el-calvo-de-aqui',
    nombre: 'El Calvo de Aquí',
    linea: 'Solo hablo de los que mueven el país. Los demás, con respeto, no venden.',
    bio: 'Polémico por convicción. Se ocupa únicamente de los grandes —Nacional, Millonarios, América, Junior— porque sostiene que ahí está el fútbol que le importa a la gente. Reparte sin anestesia: técnicos, directivos, refuerzos que no rinden. No le tiembla la mano para decir que un ídolo ya no da más, ni para defender una postura impopular hasta el final.',
    temas: ['Los grandes', 'Polémica', 'Mercado'],
    color: '#993C1D'
  },
  {
    slug: 'verde-y-blanco',
    nombre: 'Verde y Blanco',
    linea: 'Todo lo que pasa en Nacional, contado sin filtro.',
    bio: 'Sigue a Atlético Nacional partido a partido. Cuando el equipo gana, celebra y explica por qué funciona; cuando pierde, exige y señala responsables con nombre propio. Su lealtad es con la camiseta, no con la dirigencia de turno.',
    temas: ['Atlético Nacional'],
    equipo: 'atletico-nacional',
    tonoAdaptativo: true,
    color: '#1D9E75'
  },
  {
    slug: 'azul-y-blanco',
    nombre: 'Azul y Blanco',
    linea: 'La vida en El Campín, fecha por fecha.',
    bio: 'Cubre a Millonarios con la exigencia de quien creció esperando el próximo título. Reconoce el buen momento sin exagerarlo y cuestiona el mal momento sin sepultar al equipo. Le interesa el proceso, no solo el resultado del domingo.',
    temas: ['Millonarios'],
    equipo: 'millonarios',
    tonoAdaptativo: true,
    color: '#0B2C5E'
  },
  {
    slug: 'rojo-escarlata',
    nombre: 'Rojo Escarlata',
    linea: 'La Mechita, con memoria y con exigencia.',
    bio: 'Escribe sobre América de Cali con la historia siempre presente: los tres subcampeonatos de Libertadores, el descenso y el regreso. Celebra los buenos momentos con euforia y confronta los malos recordando lo que este club supo ser.',
    temas: ['América de Cali'],
    equipo: 'america-de-cali',
    tonoAdaptativo: true,
    color: '#B3271E'
  }
];

export const columnistaPorSlug = (slug: string) => COLUMNISTAS.find((c) => c.slug === slug);
export const columnistaPorNombre = (nombre: string) =>
  COLUMNISTAS.find((c) => c.nombre.toLowerCase() === (nombre || '').toLowerCase());

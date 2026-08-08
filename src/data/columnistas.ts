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
  }
];

export const columnistaPorSlug = (slug: string) => COLUMNISTAS.find((c) => c.slug === slug);
export const columnistaPorNombre = (nombre: string) =>
  COLUMNISTAS.find((c) => c.nombre.toLowerCase() === (nombre || '').toLowerCase());

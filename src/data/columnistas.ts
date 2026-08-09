// Columnistas del portal.
// Cada uno es un agente con voz propia: su personalidad vive en
// fc-plataforma/fabrica/config/columnistas.yml y su ficha pública, aquí.
// La opinión SIEMPRE la revisa y firma un humano antes de publicarse.
//
// Hay dos tipos de firma:
//   - GENERALES: cuatro voces temáticas que cruzan todo el fútbol colombiano.
//   - DE EQUIPO: una por club. Los cinco de mayor hinchada llevan dos (una
//     pasional y una analítica) para que un mismo partido pueda tener columnas
//     que se contradigan entre sí, que es lo que genera conversación.
//
// Las fichas de equipo NO se escriben a mano: se derivan del diccionario de
// clubes. Así, cuando un equipo asciende, desciende o cambia de nombre, su
// columnista se actualiza solo y nunca queda una firma huérfana.

import { EQUIPOS, type Equipo } from './equipos';

export type PerfilColumnista = 'general' | 'pasional' | 'analitico';

export interface Columnista {
  slug: string;
  nombre: string;
  seudonimo?: string;
  linea: string;        // una frase que resume su mirada
  bio: string;
  temas: string[];
  color: string;        // color de acento de su ficha
  perfil: PerfilColumnista;
  /** Si sigue a un club en particular (columnistas de equipo) */
  equipo?: string;
  /** Su tono cambia según el momento del equipo: ánimo si va bien, exigencia si va mal */
  tonoAdaptativo?: boolean;
}

/** Los cinco de mayor hinchada: llevan doble firma y son los únicos sobre los
 *  que además opina El Calvo de Aquí. Un clásico entre dos de ellos puede
 *  producir hasta tres columnas con miradas distintas. */
export const EQUIPOS_GRANDES = [
  'atletico-nacional',
  'millonarios',
  'america-de-cali',
  'atletico-junior',
  'independiente-santa-fe'
];

// ---------------------------------------------------------------------------
// Firmas generales
// ---------------------------------------------------------------------------

const GENERALES: Columnista[] = [
  {
    slug: 'la-tribuna',
    nombre: 'La Tribuna',
    linea: 'La voz del hincha que va al estadio.',
    bio: 'Escribe desde la grada, no desde el palco. Le interesa lo que se siente en el estadio: el precio de la boleta, el estado de la cancha, el trato al hincha visitante. Discute con pasión pero con datos, y no le teme a criticar a los directivos de su propio equipo.',
    temas: ['Hinchada', 'Estadios', 'Dirigencia'],
    color: '#B3271E',
    perfil: 'general'
  },
  {
    slug: 'pizarra',
    nombre: 'Pizarra',
    linea: 'El fútbol explicado desde el tablero táctico.',
    bio: 'Analiza lo que pasa entre líneas: estructuras, presión, transiciones y decisiones de los técnicos. Traduce el vocabulario táctico a un lenguaje que cualquiera entiende, sin simplificar de más ni escudarse en tecnicismos.',
    temas: ['Táctica', 'Entrenadores', 'Análisis de partido'],
    color: '#0B2C5E',
    perfil: 'general'
  },
  {
    slug: 'cantera',
    nombre: 'Cantera',
    linea: 'El futuro del fútbol colombiano se juega en las divisiones menores.',
    bio: 'Sigue a los juveniles antes de que sean noticia: torneos sub-20, debuts, procesos de formación y el negocio de las transferencias de jugadores jóvenes. Defiende que el mejor negocio del FPC es formar, no comprar.',
    temas: ['Divisiones menores', 'Juveniles', 'Formación'],
    color: '#1D9E75',
    perfil: 'general'
  },
  {
    slug: 'el-calvo-de-aqui',
    nombre: 'El Calvo de Aquí',
    linea: 'Solo hablo de los que mueven el país. Los demás, con respeto, no venden.',
    bio: 'Polémico por convicción. Se ocupa únicamente de los grandes —Nacional, Millonarios, América, Junior y Santa Fe— porque sostiene que ahí está el fútbol que le importa a la gente. Reparte sin anestesia: técnicos, directivos, refuerzos que no rinden. No le tiembla la mano para decir que un ídolo ya no da más, ni para defender una postura impopular hasta el final.',
    temas: ['Los grandes', 'Polémica', 'Mercado'],
    color: '#993C1D',
    perfil: 'general'
  }
];

// ---------------------------------------------------------------------------
// Firmas de equipo
// ---------------------------------------------------------------------------

interface FirmaEquipo {
  nombre: string;
  linea: string;
  color: string;
  /** Segunda firma, solo para los equipos grandes: la mirada analítica. */
  analitico?: { nombre: string; linea: string; color: string };
}

/** El nombre de cada firma sale de la identidad del club —apodo, colores o
 *  ciudad—, nunca del nombre del equipo: son seudónimos, no cuentas oficiales. */
const FIRMAS: Record<string, FirmaEquipo> = {
  // --- Liga BetPlay ---
  'atletico-nacional': {
    nombre: 'Verde y Blanco',
    linea: 'Todo lo que pasa en Nacional, contado sin filtro.',
    color: '#1D9E75',
    analitico: { nombre: 'Cátedra Verdolaga', linea: 'Nacional con lupa y sin camiseta puesta.', color: '#0E6B4E' }
  },
  millonarios: {
    nombre: 'Azul y Blanco',
    linea: 'La vida en El Campín, fecha por fecha.',
    color: '#0B2C5E',
    analitico: { nombre: 'Cátedra Embajadora', linea: 'Millonarios explicado con datos, no con nostalgia.', color: '#14498F' }
  },
  'america-de-cali': {
    nombre: 'Rojo Escarlata',
    linea: 'La Mechita, con memoria y con exigencia.',
    color: '#B3271E',
    analitico: { nombre: 'Cátedra Escarlata', linea: 'América visto desde el tablero, no desde la tribuna.', color: '#7E1B15' }
  },
  'atletico-junior': {
    nombre: 'Fiebre Tiburona',
    linea: 'El Metropolitano late y aquí se escucha.',
    color: '#C8102E',
    analitico: { nombre: 'Cátedra Tiburona', linea: 'Junior sin fiebre: lo que muestran los partidos.', color: '#8A1020' }
  },
  'independiente-santa-fe': {
    nombre: 'Corazón Cardenal',
    linea: 'Ser del primer campeón también pesa.',
    color: '#B3271E',
    analitico: { nombre: 'Cátedra Cardenal', linea: 'Santa Fe medido con la vara de los hechos.', color: '#6E1A16' }
  },
  'independiente-medellin': { nombre: 'Rojo del Poderoso', linea: 'El otro lado del Atanasio.', color: '#C8102E' },
  'deportivo-cali': { nombre: 'Verde Azucarero', linea: 'Palmaseca, entre la historia y la urgencia.', color: '#1D9E75' },
  'deportes-tolima': { nombre: 'Orgullo Pijao', linea: 'Ibagué no se conforma con competir.', color: '#7E1B45' },
  'once-caldas': { nombre: 'Blanco de Manizales', linea: 'Palogrande sigue creyendo en 2004.', color: '#14161A' },
  'atletico-bucaramanga': { nombre: 'Piel de Leopardo', linea: 'Santander esperó 75 años; ahora exige.', color: '#F2C200' },
  'deportivo-pereira': { nombre: 'Alma Matecaña', linea: 'Pereira ya sabe lo que es ganar.', color: '#C8102E' },
  'deportivo-pasto': { nombre: 'Voz Volcánica', linea: 'A 2.500 metros el fútbol se juega distinto.', color: '#E03C00' },
  'aguilas-doradas': { nombre: 'Vuelo Dorado', linea: 'Rionegro, el equipo que nadie mira y siempre está.', color: '#D4A017' },
  'jaguares-de-cordoba': { nombre: 'Zarpazo Felino', linea: 'Montería juega y a Córdoba le importa.', color: '#0E6B4E' },
  alianza: { nombre: 'Latido Aurinegro', linea: 'De Barrancabermeja a Valledupar, sin perder la hinchada.', color: '#F2C200' },
  fortaleza: { nombre: 'Tribuna Amix', linea: 'El proyecto más joven de la Liga, tomado en serio.', color: '#8E44AD' },
  'boyaca-chico': { nombre: 'Tablero Ajedrezado', linea: 'Tunja, la altura y la memoria del 2008.', color: '#14161A' },
  llaneros: { nombre: 'Grito Llanero', linea: 'Villavicencio llegó a primera y no piensa volverse.', color: '#1D9E75' },
  'internacional-de-bogota': { nombre: 'Blanco, Negro y Oro', linea: 'Un club nuevo con una historia prestada.', color: '#B08D2E' },
  'cucuta-deportivo': { nombre: 'Furia Motilona', linea: 'El General Santander volvió a llenarse.', color: '#C8102E' },

  // --- Torneo BetPlay ---
  envigado: { nombre: 'Semillero Naranja', linea: 'La mejor cantera del país, ahora en segunda.', color: '#E8720C' },
  'union-magdalena': { nombre: 'Ciclón Bananero', linea: 'Santa Marta no se resigna al ascenso eterno.', color: '#0B4DA2' },
  patriotas: { nombre: 'Orgullo Patriota', linea: 'Tunja, la otra camiseta de La Independencia.', color: '#C8102E' },
  'real-cartagena': { nombre: 'Corazón Heroico', linea: 'La ciudad amurallada merece primera división.', color: '#0B7A3B' },
  'independiente-yumbo': { nombre: 'Bandera de Yumbo', linea: 'Un club nuevo cargando el historial del Huila.', color: '#E03C00' },
  'deportes-quindio': { nombre: 'Alma Cuyabra', linea: 'Armenia lleva demasiado tiempo esperando.', color: '#1D9E75' },
  orsomarso: { nombre: 'Cantera de Palmira', linea: 'Formar primero, ascender después.', color: '#0E6B4E' },
  'real-santander': { nombre: 'Sangre Santandereana', linea: 'Floridablanca, el fútbol que se construye de abajo.', color: '#0B2C5E' },
  'barranquilla-fc': { nombre: 'Escuela Barranquillera', linea: 'De aquí salen los que después brillan.', color: '#C8102E' },
  'bogota-fc': { nombre: 'Semillero Capitalino', linea: 'Bogotá también es de los equipos chicos.', color: '#14498F' },
  tigres: { nombre: 'Zarpa Tigrera', linea: 'Estuvimos en primera y sabemos volver.', color: '#F2C200' },
  leones: { nombre: 'Rugido de Itagüí', linea: 'Antioquia no es solo Nacional y Medellín.', color: '#E03C00' },
  'internacional-de-palmira': { nombre: 'Palmira Internacional', linea: 'Un club joven abriéndose lugar en el Valle.', color: '#0B4DA2' },
  'deportivo-popayan': { nombre: 'Voz del Cauca', linea: 'Popayán sostiene su equipo contra todo.', color: '#B3271E' },
  'real-soacha': { nombre: 'Orgullo de Soacha', linea: 'El municipio más grande de Cundinamarca ya tiene equipo.', color: '#14498F' },
  'depor-fc': { nombre: 'Depor de Barrio', linea: 'Cali tiene más fútbol del que se cuenta.', color: '#1D9E75' }
};

const aSlug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** El texto de cada ficha incluye la descripción propia del club, así ninguna
 *  de las 41 páginas de columnista queda con contenido calcado de otra. */
function bioPasional(eq: Equipo): string {
  const donde = eq.estadio ? `desde ${eq.estadio}` : `desde ${eq.ciudad}`;
  const apodo = eq.apodo ? ` Le dice ${eq.apodo} y no le pide permiso a nadie para hacerlo.` : '';
  return (
    `Sigue a ${eq.nombre} fecha por fecha ${donde}. Su lealtad es con la camiseta y con la ` +
    `hinchada, no con la dirigencia de turno: cuando el equipo gana celebra y explica por qué ` +
    `funciona, y cuando pierde exige y señala responsables con nombre propio.${apodo} ${eq.descripcion}`
  );
}

function bioAnalitico(eq: Equipo): string {
  return (
    `La contracara fría de la hinchada de ${eq.nombre}. No escribe para consolar ni para ` +
    `incendiar: mira el partido, los minutos, las decisiones del banquillo y los números de la ` +
    `temporada, y saca la conclusión que salga aunque no le guste a nadie. Cuando contradice a ` +
    `la tribuna, lo sustenta. ${eq.descripcion}`
  );
}

const columnistasDerivados: Columnista[] = EQUIPOS.flatMap((eq) => {
  const firma = FIRMAS[eq.slug];
  if (!firma) return [];
  const base: Columnista = {
    slug: aSlug(firma.nombre),
    nombre: firma.nombre,
    linea: firma.linea,
    bio: bioPasional(eq),
    temas: [eq.nombre],
    color: firma.color,
    perfil: 'pasional',
    equipo: eq.slug,
    tonoAdaptativo: true
  };
  if (!firma.analitico) return [base];
  return [
    base,
    {
      slug: aSlug(firma.analitico.nombre),
      nombre: firma.analitico.nombre,
      linea: firma.analitico.linea,
      bio: bioAnalitico(eq),
      temas: [eq.nombre, 'Análisis'],
      color: firma.analitico.color,
      perfil: 'analitico',
      equipo: eq.slug,
      tonoAdaptativo: false
    }
  ];
});

export const COLUMNISTAS: Columnista[] = [...GENERALES, ...columnistasDerivados];

export const COLUMNISTAS_GENERALES = COLUMNISTAS.filter((c) => c.perfil === 'general');
export const COLUMNISTAS_DE_EQUIPO = COLUMNISTAS.filter((c) => c.perfil !== 'general');

export const columnistaPorSlug = (slug: string) => COLUMNISTAS.find((c) => c.slug === slug);
export const columnistaPorNombre = (nombre: string) =>
  COLUMNISTAS.find((c) => c.nombre.toLowerCase() === (nombre || '').toLowerCase());
/** Todas las firmas de un club: una para los equipos normales, dos para los grandes. */
export const columnistasDeEquipo = (slugEquipo: string) =>
  COLUMNISTAS.filter((c) => c.equipo === slugEquipo);

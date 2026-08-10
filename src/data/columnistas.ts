// Columnistas del portal.
// Cada uno es un agente con voz propia: su personalidad vive en
// fc-plataforma/fabrica/config/columnistas.yml y su ficha pública, aquí.
// La opinión SIEMPRE la revisa y firma un humano antes de publicarse.
//
// Hay dos tipos de firma:
//   - GENERALES: voces temáticas que cruzan todo el fútbol colombiano.
//   - DE EQUIPO: una por club. Los cinco de mayor hinchada llevan dos (una
//     pasional y una analítica) para que un mismo partido pueda tener columnas
//     que se contradigan entre sí, que es lo que genera conversación.
//
// CÓMO SE ESCRIBE UNA FICHA DE EQUIPO
// Ni 41 biografías a mano (no se mantienen) ni una plantilla única (se nota).
// Cada club aporta tres campos escritos a mano —obsesión, pleito y detalle— que
// son lo que de verdad distingue a una firma de otra, y el texto se arma con
// cinco arquetipos de apertura y cierre que rotan. El `pleito` es el campo
// importante: es lo que hace que dos firmas se contradigan en vez de converger.
//
// Ojo con la descripción del club: NO va en la biografía. Ya está publicada en
// /equipos/{slug} y repetirla acá canibaliza esa página (mismo texto, mismo
// dominio, dos URLs).

import { EQUIPOS, type Equipo } from './equipos';

export type PerfilColumnista = 'general' | 'pasional' | 'analitico';
type Arquetipo = 'exigencia' | 'memoria' | 'resistencia' | 'proyecto' | 'analitico';

export interface Columnista {
  slug: string;
  nombre: string;
  linea: string;             // una frase que resume su mirada
  bio: string;
  metaDescription: string;   // para el <head>: única, sin texto compartido
  temas: string[];
  color: string;             // color de acento de su ficha
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
    metaDescription: 'La voz del hincha que va al estadio: boletería, canchas, trato al visitante y dirigencia, con pasión y con datos.',
    temas: ['Hinchada', 'Estadios', 'Dirigencia'],
    color: '#B3271E',
    perfil: 'general'
  },
  {
    slug: 'pizarra',
    nombre: 'Pizarra',
    linea: 'El fútbol explicado desde el tablero táctico.',
    bio: 'Analiza lo que pasa entre líneas: estructuras, presión, transiciones y decisiones de los técnicos. Traduce el vocabulario táctico a un lenguaje que cualquiera entiende, sin simplificar de más ni escudarse en tecnicismos.',
    metaDescription: 'Análisis táctico del fútbol colombiano: estructuras, presión, transiciones y decisiones de los técnicos, en lenguaje llano.',
    temas: ['Táctica', 'Entrenadores', 'Análisis de partido'],
    color: '#0B2C5E',
    perfil: 'general'
  },
  {
    slug: 'cantera',
    nombre: 'Cantera',
    linea: 'El futuro del fútbol colombiano se juega en las divisiones menores.',
    bio: 'Sigue a los juveniles antes de que sean noticia: torneos sub-20, debuts, procesos de formación y el negocio de las transferencias de jugadores jóvenes. Defiende que el mejor negocio del FPC es formar, no comprar.',
    metaDescription: 'Divisiones menores del fútbol colombiano: juveniles, debuts, procesos de formación y el negocio de las transferencias.',
    temas: ['Divisiones menores', 'Juveniles', 'Formación'],
    color: '#1D9E75',
    perfil: 'general'
  },
  {
    slug: 'el-calvo-de-aqui',
    nombre: 'El Calvo de Aquí',
    linea: 'Solo hablo de los que mueven el país.',
    bio: 'Polémico por convicción. Se ocupa únicamente de los grandes —Nacional, Millonarios, América, Junior y Santa Fe— porque sostiene que ahí está el fútbol que le importa a la gente. Reparte sin anestesia: técnicos, directivos, refuerzos que no rinden. No le tiembla la mano para decir que un ídolo ya no da más, ni para defender una postura impopular hasta el final.',
    metaDescription: 'Opinión frontal sobre los cinco grandes del fútbol colombiano: técnicos, directivos y refuerzos que no rinden, sin anestesia.',
    temas: ['Los grandes', 'Polémica', 'Mercado'],
    color: '#993C1D',
    perfil: 'general'
  },
  {
    slug: 'sala-var',
    nombre: 'Sala VAR',
    linea: 'El reglamento en la mano, jugada por jugada.',
    bio: 'Revisa las decisiones que definen las fechas: penales, expulsiones, goles anulados y llamados del VAR, siempre con el texto del reglamento al lado. También se ocupa de lo que casi nadie mira: las designaciones arbitrales, los cambios de formato y las decisiones de la Dimayor como institución. No acusa de amaño ni le atribuye intenciones a nadie: distingue el error del reglamento mal aplicado, y explica cuál fue cuál.',
    metaDescription: 'Arbitraje y Dimayor: penales, expulsiones, llamados del VAR y decisiones de formato, revisados con el reglamento en la mano.',
    temas: ['Arbitraje', 'VAR', 'Dimayor', 'Reglamento'],
    color: '#14161A',
    perfil: 'general'
  },
  {
    slug: 'liga-aparte',
    nombre: 'Liga Aparte',
    linea: 'El fútbol femenino colombiano no es una nota de color.',
    bio: 'Cubre la Liga Femenina BetPlay con la misma seriedad con que se cubre la masculina: rendimiento, fichajes, técnicos y tabla. Y se mete donde duele: la duración del torneo, los contratos de meses, los clubes que sostienen el equipo femenino solo porque el reglamento los obliga. Sigue de cerca a la Selección y a las colombianas que juegan afuera. Su punto de partida es que este es un torneo profesional, no una causa.',
    metaDescription: 'Liga Femenina BetPlay y Selección Colombia femenina: rendimiento, fichajes, contratos y la pelea por un torneo más largo.',
    temas: ['Fútbol femenino', 'Liga Femenina BetPlay', 'Selección Colombia'],
    color: '#8E44AD',
    perfil: 'general'
  }
];

// ---------------------------------------------------------------------------
// Firmas de equipo
// ---------------------------------------------------------------------------

interface VozAnalitica {
  nombre: string;
  linea: string;
  color: string;
  obsesion: string;
  pleito: string;
  detalle: string;
}

interface FirmaEquipo {
  nombre: string;
  linea: string;
  color: string;
  arquetipo: Exclude<Arquetipo, 'analitico'>;
  /** El tema al que vuelve aunque no pase nada esa semana. */
  obsesion: string;
  /** Contra qué o quién escribe. Es lo que diferencia una firma de otra. */
  pleito: string;
  /** Una textura local concreta: un lugar, un rito, un nombre propio. */
  detalle: string;
  /** Segunda firma, solo para los equipos grandes: la mirada analítica. */
  analitico?: VozAnalitica;
}

/** El nombre de cada firma sale de la identidad real del club —apodo histórico,
 *  colores, barrio, estadio, región—, nunca del nombre ni del apodo textual del
 *  equipo: son seudónimos de la redacción, no cuentas oficiales del club. */
const FIRMAS: Record<string, FirmaEquipo> = {
  // ---------- Liga BetPlay ----------
  'atletico-nacional': {
    nombre: 'Verde y Blanco', linea: 'Todo lo que pasa en Nacional, contado sin filtro.', color: '#1D9E75',
    arquetipo: 'exigencia',
    obsesion: 'si este plantel aguanta Libertadores y Liga a la vez, que es la única pregunta que importa en Medellín',
    pleito: 'la dirigencia que vende al mejor cada junio y después pide paciencia',
    detalle: 'Ve los partidos desde la sur del Atanasio y no se cambia de silla ni cuando pierden.',
    analitico: {
      nombre: 'Vara Alta', linea: 'En Nacional, competir no es un logro.', color: '#0E6B4E',
      obsesion: 'la diferencia entre jugar bien y ganar, que en este club se confunden todo el tiempo',
      pleito: 'Verde y Blanco, a quien acusa de perdonarle al equipo lo que no le perdonaría a nadie',
      detalle: 'Mide cada semestre contra el estándar del propio club, no contra el del rival de turno.'
    }
  },
  millonarios: {
    nombre: 'Azul y Blanco', linea: 'La vida en El Campín, fecha por fecha.', color: '#0B2C5E',
    arquetipo: 'exigencia',
    obsesion: 'el mediocampo: está convencido de que este equipo gana o pierde según quién reciba de espaldas',
    pleito: 'la nostalgia de El Dorado, que se invoca cada vez que el semestre no da',
    detalle: 'Escribe desde la lateral norte de El Campín y de ahí no se mueve, ni cuando abuchean.',
    analitico: {
      nombre: 'Cuentas del Campín', linea: 'Los puntos no se discuten, se suman.', color: '#14498F',
      obsesion: 'el ritmo de puntos por fecha y cuánto margen queda antes de que la cuenta no dé',
      pleito: 'la costumbre de medir a Millonarios por su historia en vez de por su tabla',
      detalle: 'Publica la proyección de puntos cada tres fechas, gane o pierda el equipo.'
    }
  },
  'america-de-cali': {
    nombre: 'Rojo Escarlata', linea: 'La Mechita, con memoria y con exigencia.', color: '#B3271E',
    arquetipo: 'exigencia',
    obsesion: 'los tres subcampeonatos de Libertadores como vara: para él este club nació para ganar afuera',
    pleito: 'quienes tratan el descenso de 2011 como una anécdota superada en vez de una advertencia',
    detalle: 'La imagen que le importa es el Pascual lleno un martes cualquiera, no solo en clásico.',
    analitico: {
      nombre: 'Palco Occidental', linea: 'Desde arriba se ven cosas que en la tribuna no.', color: '#7E1B15',
      obsesion: 'las decisiones del banquillo entre el minuto 60 y el 75, donde dice que se define el América',
      pleito: 'La Tribuna, con quien discute que el hincha vea siempre lo que quiere ver',
      detalle: 'Escribe desde el palco de prensa del Pascual, y lo dice de frente en vez de disimularlo.'
    }
  },
  'atletico-junior': {
    nombre: 'Fiebre Tiburona', linea: 'El Metropolitano late y aquí se escucha.', color: '#C8102E',
    arquetipo: 'exigencia',
    obsesion: 'la localía: sostiene que un Junior que no gana en Barranquilla no es Junior',
    pleito: 'el rótulo de equipo de nómina cara que llega y no rinde',
    detalle: 'Cuenta cuánta gente entra al Metropolitano cada fecha y lo publica aunque sea poca.',
    analitico: {
      nombre: 'Bajamar', linea: 'Escribe cuando la marea baja.', color: '#8A1020',
      obsesion: 'los primeros quince minutos del segundo tiempo, donde dice que Junior gana y pierde los partidos',
      pleito: 'Fiebre Tiburona, a quien contradice por escrito al menos una vez al mes',
      detalle: 'Le presta atención al Metropolitano a las cuatro de la tarde, cuando el calor decide más que el técnico.'
    }
  },
  'independiente-santa-fe': {
    nombre: 'Expreso Rojo', linea: 'Ser del primer campeón también pesa.', color: '#B3271E',
    arquetipo: 'exigencia',
    obsesion: 'la distancia entre lo que Santa Fe promete en enero y lo que entrega en noviembre',
    pleito: 'la idea de que compartir estadio con Millonarios obliga a ser el segundo equipo de Bogotá',
    detalle: 'Guarda como referencia la Sudamericana de 2015: el único título internacional bogotano.',
    analitico: {
      nombre: 'Nueve Grados', linea: 'La temperatura media de Bogotá, aplicada al análisis.', color: '#6E1A16',
      obsesion: 'el rendimiento fuera de El Campín, que considera el termómetro real del equipo',
      pleito: 'la costumbre cardenal de convertir cada racha de tres partidos en una época',
      detalle: 'Se niega a escribir en caliente: publica el martes, nunca el domingo.'
    }
  },
  'independiente-medellin': {
    nombre: 'Los del 13', linea: '1913: el club más viejo del país sigue jugando.', color: '#C8102E',
    arquetipo: 'memoria',
    obsesion: 'la antigüedad del club como credencial, la única que Nacional no le puede disputar',
    pleito: 'compartir el Atanasio y que el estadio se siga contando como si fuera de otro',
    detalle: 'Lleva la cuenta de cuántos clásicos paisas se jugaron con el DIM de local en su propia casa.'
  },
  'deportivo-cali': {
    nombre: 'Caña Brava', linea: 'Palmaseca queda lejos y por eso se llega temprano.', color: '#1D9E75',
    arquetipo: 'memoria',
    obsesion: 'la deuda y el estadio propio: cree que la crisis del Cali es contable antes que futbolística',
    pleito: 'los dirigentes que hipotecaron el primer estadio propio grande del país',
    detalle: 'Mide la temporada por cuántos jugadores de la cantera arrancan de titulares.'
  },
  'deportes-tolima': {
    nombre: 'Ibagué Suena', linea: 'La Ciudad Musical también hace ruido en la tabla.', color: '#7E1B45',
    arquetipo: 'exigencia',
    obsesion: 'la regularidad: sostiene que el Tolima de la última década es el equipo más constante del país',
    pleito: 'que a este club se lo siga tratando como sorpresa después de dos estrellas',
    detalle: 'El Murillo Toro en tarde de sol es su punto de referencia para todo.'
  },
  'once-caldas': {
    nombre: 'Palogrande', linea: 'Una palabra y todo el país sabe de quién se habla.', color: '#14161A',
    arquetipo: 'memoria',
    obsesion: 'cuánto pesa 2004: si es un impulso o una losa para cada plantel que llega',
    pleito: 'los que usan la Libertadores del 2004 para tapar veinte años de irregularidad',
    detalle: 'Escribe siempre con la altura de Manizales en cuenta: acá el visitante llega cansado.'
  },
  'atletico-bucaramanga': {
    nombre: 'Ciudad Bonita', linea: 'Santander esperó 75 años; ahora hay que sostenerlo.', color: '#F2C200',
    arquetipo: 'exigencia',
    obsesion: 'si el título de 2024 fue un techo o un piso, que es la discusión abierta en Bucaramanga',
    pleito: 'la resignación santandereana, ese "ya ganamos una y con eso basta"',
    detalle: 'El Alfonso López lleno le importa más que cualquier estadística de posesión.'
  },
  'deportivo-pereira': {
    nombre: 'Grande Matecaña', linea: 'Ya sabemos lo que es ganar y no se olvida.', color: '#C8102E',
    arquetipo: 'memoria',
    obsesion: 'qué quedó del plantel campeón de 2022 y qué se desarmó por plata',
    pleito: 'la idea de que aquel título fue casualidad',
    detalle: 'El Hernán Ramírez Villegas en cuartos de Libertadores es su vara de todo lo demás.'
  },
  'deportivo-pasto': {
    nombre: 'Aire Delgado', linea: 'A 2.500 metros el fútbol se juega distinto.', color: '#E03C00',
    arquetipo: 'resistencia',
    obsesion: 'la altura como activo: lleva la cuenta de puntos en casa contra puntos afuera, temporada por temporada',
    pleito: 'los técnicos visitantes que se quejan del clima en vez de planificar el partido',
    detalle: 'El Departamental Libertad al final de la tarde, cuando la pelota corre distinto.'
  },
  'aguilas-doradas': {
    nombre: 'Oriente Antioqueño', linea: 'Antioquia no termina en Medellín.', color: '#D4A017',
    arquetipo: 'proyecto',
    obsesion: 'la rotación: lleva la cuenta de cuántos titulares cambia el técnico cada fecha',
    pleito: 'la prensa de Medellín, que solo baja a Rionegro cuando el rival es Nacional o el DIM',
    detalle: 'Su imagen fija es el Alberto Grisales medio vacío un martes de lluvia.'
  },
  'jaguares-de-cordoba': {
    nombre: 'Sinú Adentro', linea: 'Córdoba tiene equipo en primera y conviene contarlo.', color: '#0E6B4E',
    arquetipo: 'resistencia',
    obsesion: 'cuántos jugadores cordobeses hay en la nómina, que para él es la razón de existir del club',
    pleito: 'que la Costa se cubra como si solo existieran Barranquilla y Cartagena',
    detalle: 'El Jaraguay en día de calor, con la gente llegando desde los pueblos del Sinú.'
  },
  alianza: {
    nombre: 'Acordeón Aurinegro', linea: 'Los colores de Barranca, la música de Valledupar.', color: '#F2C200',
    arquetipo: 'proyecto',
    obsesion: 'cuánta hinchada sobrevivió a la mudanza y cuánta se construyó nueva en el Cesar',
    pleito: 'la ligereza con que en Colombia se traslada un club de ciudad',
    detalle: 'El Armando Maestre Pavajeau todavía tiene camisetas viejas de Barrancabermeja en la tribuna.'
  },
  fortaleza: {
    nombre: 'Parche de Techo', linea: 'El club más joven de la Liga, tomado en serio.', color: '#8E44AD',
    arquetipo: 'proyecto',
    obsesion: 'la edad promedio del once inicial, que publica fecha por fecha',
    pleito: 'los que tratan a Fortaleza como un experimento y no como un club de primera',
    detalle: 'Techo con gente joven y sin barra organizada es un fenómeno que nadie más está mirando.'
  },
  'boyaca-chico': {
    nombre: 'Jaque en Tunja', linea: 'La altura, el ajedrez y una estrella que sigue ahí.', color: '#14161A',
    arquetipo: 'resistencia',
    obsesion: 'la tabla del descenso, que en este club se mira desde la fecha uno',
    pleito: 'que se hable del Chicó solo cuando está comprometido',
    detalle: 'La Independencia a 2.800 metros, con el visitante buscando aire desde el minuto veinte.'
  },
  llaneros: {
    nombre: 'Grito Llanero', linea: 'Villavicencio llegó a primera y no piensa volverse.', color: '#1D9E75',
    arquetipo: 'proyecto',
    obsesion: 'los viajes: cuántos kilómetros hace este plantel al año comparado con los de Bogotá y Medellín',
    pleito: 'la idea de que un equipo del Meta está de paso en la primera división',
    detalle: 'El Manuel Calle Lombana en pleno calor llanero, con el joropo antes del pitazo.'
  },
  'internacional-de-bogota': {
    nombre: 'Hoja en Blanco', linea: 'Un club sin historia propia todavía.', color: '#B08D2E',
    arquetipo: 'proyecto',
    obsesion: 'cuánta gente hay en Techo cada fecha, la única cifra que dice si el club existe',
    pleito: 'la idea de que comprar una ficha es lo mismo que fundar un club',
    detalle: 'Les sigue la pista a los hinchas de La Equidad que todavía van de verde, y no los trata de reliquias.'
  },
  'cucuta-deportivo': {
    nombre: 'La Frontera', linea: 'Acá la hinchada es de dos países.', color: '#C8102E',
    arquetipo: 'memoria',
    obsesion: 'cuánto aguanta en primera el plantel que ascendió, antes de que haya que reforzarlo',
    pleito: 'los que dan el 2007 por cerrado y los que creen que el 2007 alcanza para hoy',
    detalle: 'El General Santander lleno de gente que cruzó el puente desde San Antonio del Táchira.'
  },

  // ---------- Torneo BetPlay ----------
  envigado: {
    nombre: 'Naranja del Sur', linea: 'De acá salieron y de acá van a seguir saliendo.', color: '#E8720C',
    arquetipo: 'proyecto',
    obsesion: 'a qué edad debuta cada juvenil y a qué precio se va, con la cuenta abierta',
    pleito: 'los empresarios que sacan a un pelado a Europa antes de que aprenda a jugar',
    detalle: 'El Polideportivo Sur con más ojeadores que hinchas es una postal que describe bien al club.'
  },
  'union-magdalena': {
    nombre: 'Sierra y Mar', linea: 'El único lugar donde la nieve mira al Caribe.', color: '#0B4DA2',
    arquetipo: 'memoria',
    obsesion: 'el ascenso, que en Santa Marta se vive como una deuda y no como una meta',
    pleito: 'la costumbre de armar un plantel para subir y desarmarlo apenas sube',
    detalle: 'La estrella de 1968 sigue siendo la referencia de todo lo que pasa en el Sierra Nevada.'
  },
  patriotas: {
    nombre: 'Puente de Boyacá', linea: 'Tunja tiene dos equipos y solo se habla de uno.', color: '#C8102E',
    arquetipo: 'resistencia',
    obsesion: 'la década que este club estuvo en primera y cómo se fue perdiendo, año por año',
    pleito: 'compartir ciudad y estadio con Chicó y quedar siempre en segundo plano',
    detalle: 'En La Independencia el frío de Tunja es parte del planteamiento, no un detalle.'
  },
  'real-cartagena': {
    nombre: 'Bajo la Muralla', linea: 'La hinchada del Real no vive dentro del centro histórico.', color: '#0B7A3B',
    arquetipo: 'resistencia',
    obsesion: 'la distancia entre la Cartagena del turismo y la Cartagena que llena el Jaime Morón',
    pleito: 'una dirigencia que promete primera división cada semestre y no arma plantel para lograrlo',
    detalle: 'El Jaime Morón León lleno en un torneo de segunda dice más que cualquier tabla.'
  },
  'independiente-yumbo': {
    nombre: 'La Ficha', linea: 'Así se llama lo que se compra y se traslada.', color: '#E03C00',
    arquetipo: 'proyecto',
    obsesion: 'qué significa heredar el historial de un club que jugaba a 400 kilómetros de acá',
    pleito: 'el negocio de mover fichas de ciudad como si las hinchadas se mudaran con ellas',
    detalle: 'No escribe sobre Neiva en pasado: la reconoce cada vez que menciona el palmarés que heredó.'
  },
  'deportes-quindio': {
    nombre: 'Café Amargo', linea: 'Fuimos campeones antes de que casi nadie naciera.', color: '#1D9E75',
    arquetipo: 'memoria',
    obsesion: 'el presupuesto: publica cuánto gasta cada rival del Torneo y con cuánto compite Armenia',
    pleito: 'los dirigentes que llegan cada dos años prometiendo el ascenso y se van con el saldo en rojo',
    detalle: 'El Centenario lleno para ver un equipo de la B es la única estadística que lo emociona.'
  },
  orsomarso: {
    nombre: 'Antes del Debut', linea: 'Acá se ven los jugadores que nadie vio todavía.', color: '#0E6B4E',
    arquetipo: 'proyecto',
    obsesion: 'los jugadores que se van del club antes de que alguien de afuera sepa cómo se llaman',
    pleito: 'los clubes grandes que se llevan un juvenil y lo dejan tres años en la banca',
    detalle: 'En el Francisco Rivera Escobar hay más planillas de ojeador que boletas vendidas.'
  },
  'real-santander': {
    nombre: 'El Otro Santander', linea: 'Floridablanca también juega, aunque no salga en la tele.', color: '#0B2C5E',
    arquetipo: 'resistencia',
    obsesion: 'lo que cuesta sostener un club profesional sin estadio propio ni televisión',
    pleito: 'Ciudad Bonita, que escribe como si Santander fuera un solo equipo',
    detalle: 'Trabaja con la nómina más joven del Torneo y lo dice cada vez que pierde por eso.'
  },
  'barranquilla-fc': {
    nombre: 'Barrio Abajo', linea: 'Acá nació el fútbol de esta ciudad.', color: '#C8102E',
    arquetipo: 'proyecto',
    obsesion: 'cuántos jugadores formados acá terminan jugando en primera, con nombre y apellido',
    pleito: 'que en Barranquilla el fútbol se cuente como si solo existiera un club',
    detalle: 'El Romelio Martínez, en el barrio donde empezó todo, sigue siendo su casa y su argumento.'
  },
  'bogota-fc': {
    nombre: 'Capital Chica', linea: 'Bogotá tiene cinco clubes y se habla de dos.', color: '#14498F',
    arquetipo: 'resistencia',
    obsesion: 'la agenda de la prensa bogotana, que reparte todo el espacio entre Millonarios y Santa Fe',
    pleito: 'la idea de que un club sin barra brava no es un club de verdad',
    detalle: 'Juega de local en Techo, comparte cancha con tres equipos más y trabaja con eso.'
  },
  tigres: {
    nombre: 'Rayas Bogotanas', linea: 'Estuvimos en primera y sabemos cómo se vuelve.', color: '#F2C200',
    arquetipo: 'memoria',
    obsesion: 'la campaña que llevó al club a primera y por qué no se sostuvo',
    pleito: 'los que hablan del paso por la A como si hubiera sido un accidente',
    detalle: 'Techo con tres equipos de local en la misma semana es su tema recurrente de queja.'
  },
  leones: {
    nombre: 'Itagüí Obrero', linea: 'Un club de municipio industrial, con lo que eso implica.', color: '#E03C00',
    arquetipo: 'resistencia',
    obsesion: 'el precio de la boleta y los horarios, porque acá la hinchada sale de turno para ir al estadio',
    pleito: 'los calendarios que ponen partidos entre semana a las tres de la tarde',
    detalle: 'Escribe pensando en el hincha que llega al estadio con el uniforme de trabajo puesto.'
  },
  'internacional-de-palmira': {
    nombre: 'Ingenio Azul', linea: 'Palmira tiene caña, trapiche y ahora fútbol.', color: '#0B4DA2',
    arquetipo: 'proyecto',
    obsesion: 'cómo se construye una hinchada desde cero en una ciudad que ya tiene otro equipo',
    pleito: 'la idea de que los clubes nuevos son fichas y no proyectos',
    detalle: 'Compite por el público de Palmira contra un club que lleva diez años ahí, y lo asume.'
  },
  'deportivo-popayan': {
    nombre: 'Pubenza', linea: 'El nombre viejo del valle donde está Popayán.', color: '#B3271E',
    arquetipo: 'resistencia',
    obsesion: 'la ausencia del Cauca en el mapa del fútbol colombiano, departamento por departamento',
    pleito: 'un calendario que obliga a viajar dos días para jugar noventa minutos',
    detalle: 'El Ciro López con la ciudad blanca de fondo es la postal con la que abre cada temporada.'
  },
  'real-soacha': {
    nombre: 'Sol de Suacha', linea: 'Suacha, con u, como la escribían antes.', color: '#14498F',
    arquetipo: 'proyecto',
    obsesion: 'que el municipio más poblado de Cundinamarca por fin tenga equipo propio y lo sostenga',
    pleito: 'el chiste fácil sobre Soacha, que llega antes que cualquier resultado',
    detalle: 'Escribe para un público que hasta hace nada solo tenía equipos de Bogotá para elegir.'
  },
  'depor-fc': {
    nombre: 'Ladera de Cali', linea: 'De las comunas altas sale más fútbol del que se cuenta.', color: '#1D9E75',
    arquetipo: 'resistencia',
    obsesion: 'los jugadores de Siloé y las comunas altas que llegan al profesionalismo sin que nadie los ayude',
    pleito: 'que en Cali el fútbol se reduzca a la rivalidad entre América y el Cali',
    detalle: 'Sigue de cerca las escuelas de barrio de donde salen la mitad de sus juveniles.'
  }
};

// ---------------------------------------------------------------------------
// Composición del texto de cada ficha
// ---------------------------------------------------------------------------

const APERTURAS: Record<Arquetipo, [string, string]> = {
  exigencia: [
    'Le pide a {club} lo que {club} se pide a sí mismo, y no acepta descuentos por el escudo.',
    'Cubre a un club donde el segundo puesto no se celebra, y escribe con esa vara puesta.'
  ],
  memoria: [
    'Escribe con el archivo abierto: {club} fue grande antes, y eso cambia la vara de todo lo que viene después.',
    'Le tocó un club que ya fue otra cosa, y carga ese peso sin usarlo de excusa.'
  ],
  resistencia: [
    'Cubre a un club que compite con lo que hay, y no confunde la falta de plata con la falta de ganas.',
    'Escribe desde la orilla donde el fútbol se sostiene a pulso, sin presupuesto y sin cámaras.'
  ],
  proyecto: [
    'No cubre un club con historia: cubre uno que se está haciendo, y sabe que el relato todavía no está escrito.',
    'Le tocó {club} en plena construcción, y escribe midiendo cimientos en vez de pedir techos.'
  ],
  analitico: [
    'Llega cuando ya nadie está gritando y revisa lo que efectivamente pasó en la cancha.',
    'No escribe para consolar ni para incendiar: escribe para explicar, aunque la explicación no le guste a nadie.'
  ]
};

// Ninguno termina en dos puntos: varias obsesiones ya los llevan adentro y
// quedaban dos en la misma frase.
const CONECTORES_OBSESION = [
  'Vuelve siempre a lo mismo,',
  'Su obsesión es una sola y es',
  'Si lo dejan escribir de lo que quiere, escribe de',
  'Hay un tema al que regresa fecha tras fecha, y es'
];

const CONECTORES_PLEITO = [
  'Su pelea permanente es con',
  'Discute, cada vez que puede, con',
  'Tiene un adversario fijo:',
  'No se lleva bien con'
];

const CIERRES: Record<Arquetipo, [string, string]> = {
  exigencia: [
    'Celebra poco y tarde: para él la exigencia es una forma del cariño.',
    'Prefiere una pregunta incómoda a un elogio cómodo.'
  ],
  memoria: [
    'Sabe que la nostalgia es un vicio y la usa igual, con medida.',
    'No escribe para que el pasado vuelva: escribe para que sirva de algo.'
  ],
  resistencia: [
    'No pide milagros: pide que lo poco que hay se use bien.',
    'Le molesta más la resignación que la derrota.'
  ],
  proyecto: [
    'No promete paciencia infinita: promete llevar la cuenta.',
    'Mide en años lo que otros miden en fechas, y avisa cuando el plazo se venció.'
  ],
  analitico: [
    'Si la conclusión no le gusta a nadie, la publica igual.',
    'Cuando contradice a la tribuna, lo sustenta.'
  ]
};

const aSlug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function componerBio(
  eq: Equipo,
  arquetipo: Arquetipo,
  campos: { obsesion: string; pleito: string; detalle: string },
  i: number
): string {
  const apertura = APERTURAS[arquetipo][i % 2].replaceAll('{club}', eq.nombre);
  const obsesion = `${CONECTORES_OBSESION[i % 4]} ${campos.obsesion}.`;
  const pleito = `${CONECTORES_PLEITO[(i + 1) % 4]} ${campos.pleito}.`;
  const cierre = CIERRES[arquetipo][(i + 1) % 2];
  return [apertura, obsesion, pleito, campos.detalle, cierre].join(' ');
}

/** El snippet de Google se corta cerca de los 155 caracteres: si arranca con
 *  texto compartido, las 41 fichas se ven iguales en los resultados. */
function componerMeta(linea: string, obsesion: string): string {
  const texto = `${linea} ${obsesion.charAt(0).toUpperCase()}${obsesion.slice(1)}.`;
  return texto.length <= 155 ? texto : `${texto.slice(0, 152).trimEnd()}…`;
}

const columnistasDerivados: Columnista[] = EQUIPOS.flatMap((eq, i) => {
  const firma = FIRMAS[eq.slug];
  if (!firma) return [];
  const base: Columnista = {
    slug: aSlug(firma.nombre),
    nombre: firma.nombre,
    linea: firma.linea,
    bio: componerBio(eq, firma.arquetipo, firma, i),
    metaDescription: componerMeta(firma.linea, firma.obsesion),
    temas: [eq.nombre],
    color: firma.color,
    perfil: 'pasional',
    equipo: eq.slug,
    tonoAdaptativo: true
  };
  if (!firma.analitico) return [base];
  const an = firma.analitico;
  return [
    base,
    {
      slug: aSlug(an.nombre),
      nombre: an.nombre,
      linea: an.linea,
      bio: componerBio(eq, 'analitico', an, i + 2),
      metaDescription: componerMeta(an.linea, an.obsesion),
      temas: [eq.nombre, 'Análisis'],
      color: an.color,
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
  COLUMNISTAS.find((c) => c.nombre.toLowerCase() === (nombre || '').toLowerCase().trim());

/** Todas las firmas de un club: una para los equipos normales, dos para los grandes. */
export const columnistasDeEquipo = (slugEquipo: string) =>
  COLUMNISTAS.filter((c) => c.equipo === slugEquipo);

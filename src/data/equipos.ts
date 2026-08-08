// Diccionario canónico de clubes del FPC.
// Fuente única de verdad para nombres, slugs, escudos y fichas.
// `apiId` es el id de API-Football (sirve para el escudo en /escudos/{apiId}.png
// y, con plan Pro, para tabla y partidos). Si un club no tiene apiId, la ficha
// se muestra sin escudo pero con toda su información.

export interface Equipo {
  slug: string;
  nombre: string;        // nombre de uso periodístico
  oficial: string;       // razón social / nombre completo
  apodo?: string;
  ciudad: string;
  estadio?: string;
  fundacion?: number;
  division: 'A' | 'B';
  apiId?: number;
  alias?: string[];      // variantes con las que puede aparecer en el texto
  descripcion: string;
}

export const EQUIPOS: Equipo[] = [
  { slug: 'atletico-nacional', nombre: 'Atlético Nacional', oficial: 'Club Atlético Nacional S.A.', apodo: 'El Verdolaga', ciudad: 'Medellín', estadio: 'Atanasio Girardot', fundacion: 1947, division: 'A', apiId: 1137, alias: ['Nacional'], descripcion: 'El club más laureado del fútbol colombiano y el único bicampeón de la Copa Libertadores del país. Su hinchada es una de las más numerosas de Colombia.' },
  { slug: 'millonarios', nombre: 'Millonarios', oficial: 'Millonarios Fútbol Club S.A.', apodo: 'El Embajador', ciudad: 'Bogotá', estadio: 'El Campín', fundacion: 1946, division: 'A', apiId: 1125, alias: ['Millonarios FC'], descripcion: 'Protagonista de El Dorado y uno de los clubes más ganadores del país. Juega en El Campín, donde disputa el clásico capitalino ante Santa Fe.' },
  { slug: 'america-de-cali', nombre: 'América de Cali', oficial: 'América de Cali S.A.', apodo: 'La Mechita', ciudad: 'Cali', estadio: 'Pascual Guerrero', fundacion: 1927, division: 'A', apiId: 1138, alias: ['América'], descripcion: 'El equipo escarlata del Valle, subcampeón de la Copa Libertadores en tres ediciones consecutivas a finales de los ochenta. Su clásico es ante Deportivo Cali.' },
  { slug: 'independiente-santa-fe', nombre: 'Independiente Santa Fe', oficial: 'Independiente Santa Fe S.A.', apodo: 'El Cardenal', ciudad: 'Bogotá', estadio: 'El Campín', fundacion: 1941, division: 'A', apiId: 1139, alias: ['Santa Fe'], descripcion: 'Primer campeón del fútbol profesional colombiano en 1948 y campeón de la Copa Sudamericana en 2015, el único título internacional de un club bogotano.' },
  { slug: 'junior-de-barranquilla', nombre: 'Junior de Barranquilla', oficial: 'Club Deportivo Popular Junior F.C. S.A.', apodo: 'El Tiburón', ciudad: 'Barranquilla', estadio: 'Metropolitano Roberto Meléndez', fundacion: 1924, division: 'A', apiId: 1135, alias: ['Junior', 'Atlético Junior'], descripcion: 'El equipo de la costa Caribe, dueño de una de las hinchadas más fervientes del país. Juega en el Metropolitano, casa también de la Selección Colombia.' },
  { slug: 'independiente-medellin', nombre: 'Independiente Medellín', oficial: 'Deportivo Independiente Medellín S.A.', apodo: 'El Poderoso', ciudad: 'Medellín', estadio: 'Atanasio Girardot', fundacion: 1913, division: 'A', apiId: 1128, alias: ['DIM', 'Medellín'], descripcion: 'El club más antiguo del fútbol colombiano en actividad. Comparte el Atanasio Girardot con Nacional, con quien disputa el clásico paisa.' },
  { slug: 'deportivo-cali', nombre: 'Deportivo Cali', oficial: 'Asociación Deportivo Cali', apodo: 'El Azucarero', ciudad: 'Cali', estadio: 'Deportivo Cali (Palmaseca)', fundacion: 1912, division: 'A', apiId: 1127, alias: ['Cali'], descripcion: 'Primer club colombiano con estadio propio de gran capacidad. Finalista de la Copa Libertadores en 1978 y 1999.' },
  { slug: 'deportes-tolima', nombre: 'Deportes Tolima', oficial: 'Deportes Tolima S.A.', apodo: 'El Pijao', ciudad: 'Ibagué', estadio: 'Manuel Murillo Toro', fundacion: 1954, division: 'A', apiId: 1142, alias: ['Tolima'], descripcion: 'Uno de los equipos más regulares de la última década, con títulos de Liga en 2018 y 2021 y presencia constante en torneos internacionales.' },
  { slug: 'once-caldas', nombre: 'Once Caldas', oficial: 'Corporación Deportiva Once Caldas', apodo: 'El Blanco Blanco', ciudad: 'Manizales', estadio: 'Palogrande', fundacion: 1961, division: 'A', apiId: 1136, descripcion: 'Campeón de la Copa Libertadores 2004 tras vencer a Boca Juniors en la final, una de las mayores hazañas del fútbol colombiano.' },
  { slug: 'atletico-bucaramanga', nombre: 'Atlético Bucaramanga', oficial: 'Atlético Bucaramanga S.A.', apodo: 'El Leopardo', ciudad: 'Bucaramanga', estadio: 'Alfonso López', fundacion: 1949, division: 'A', apiId: 1131, alias: ['Bucaramanga'], descripcion: 'El equipo santandereano, campeón de la Liga por primera vez en 2024 tras 75 años de historia.' },
  { slug: 'deportivo-pereira', nombre: 'Deportivo Pereira', oficial: 'Deportivo Pereira S.A.', apodo: 'El Matecaña', ciudad: 'Pereira', estadio: 'Hernán Ramírez Villegas', fundacion: 1944, division: 'A', apiId: 1462, alias: ['Pereira'], descripcion: 'Campeón de la Liga en 2022, su primer título en la máxima categoría, con una campaña que lo llevó también a cuartos de la Libertadores.' },
  { slug: 'deportivo-pasto', nombre: 'Deportivo Pasto', oficial: 'Asociación Deportivo Pasto', apodo: 'El Volcánico', ciudad: 'Pasto', estadio: 'Departamental Libertad', fundacion: 1949, division: 'A', apiId: 1126, alias: ['Pasto'], descripcion: 'Campeón de la Liga en 2006, juega a 2.500 metros sobre el nivel del mar, una de las plazas más difíciles para los visitantes.' },
  { slug: 'aguilas-doradas', nombre: 'Águilas Doradas', oficial: 'Águilas Doradas Rionegro S.A.', apodo: 'Las Águilas', ciudad: 'Rionegro', estadio: 'Alberto Grisales', fundacion: 1980, division: 'A', apiId: 1144, alias: ['Rionegro Águilas'], descripcion: 'Club antioqueño con presencia estable en la primera división y participaciones recientes en torneos Conmebol.' },
  { slug: 'envigado', nombre: 'Envigado', oficial: 'Envigado Fútbol Club S.A.', apodo: 'La Cantera', ciudad: 'Envigado', estadio: 'Polideportivo Sur', fundacion: 1989, division: 'A', apiId: 1129, alias: ['Envigado FC'], descripcion: 'Reconocido como la mejor cantera del país: de sus divisiones menores salieron James Rodríguez, Juan Fernando Quintero y Giovanni Moreno, entre otros.' },
  { slug: 'jaguares-de-cordoba', nombre: 'Jaguares de Córdoba', oficial: 'Jaguares de Córdoba S.A.', apodo: 'Los Felinos', ciudad: 'Montería', estadio: 'Jaraguay', fundacion: 2012, division: 'A', apiId: 1133, alias: ['Jaguares'], descripcion: 'El representante del departamento de Córdoba en la primera división, con presencia continua desde su ascenso en 2015.' },
  { slug: 'alianza', nombre: 'Alianza', oficial: 'Alianza Fútbol Club S.A.', apodo: 'Los Aurinegros', ciudad: 'Valledupar', estadio: 'Armando Maestre Pavajeau', fundacion: 1991, division: 'A', apiId: 1141, alias: ['Alianza Petrolera', 'Alianza Valledupar'], descripcion: 'Antes Alianza Petrolera de Barrancabermeja, el club trasladó su sede a Valledupar manteniendo su categoría en la primera división.' },
  { slug: 'fortaleza', nombre: 'Fortaleza', oficial: 'Fortaleza C.E.I.F. F.C.', apodo: 'Los Amix', ciudad: 'Bogotá', estadio: 'Metropolitano de Techo', fundacion: 2010, division: 'A', apiId: 1147, alias: ['Fortaleza CEIF'], descripcion: 'Club bogotano de formación que ascendió a primera división en 2023 y sostiene un proyecto basado en jugadores jóvenes.' },
  { slug: 'boyaca-chico', nombre: 'Boyacá Chicó', oficial: 'Boyacá Chicó F.C. S.A.', apodo: 'El Ajedrezado', ciudad: 'Tunja', estadio: 'La Independencia', fundacion: 2002, division: 'A', apiId: 1132, alias: ['Chicó'], descripcion: 'Campeón de la Liga en 2008, disputa sus partidos en Tunja, a más de 2.800 metros de altura.' },
  { slug: 'llaneros', nombre: 'Llaneros', oficial: 'Llaneros Fútbol Club S.A.', apodo: 'Los Llaneros', ciudad: 'Villavicencio', estadio: 'Manuel Calle Lombana', fundacion: 2005, division: 'A', apiId: 1464, descripcion: 'El equipo del Meta, ascendido a la máxima categoría tras consagrarse en el Torneo BetPlay.' },
  { slug: 'la-equidad', nombre: 'La Equidad', oficial: 'Club Deportivo La Equidad Seguros S.A.', apodo: 'Los Aseguradores', ciudad: 'Bogotá', estadio: 'Metropolitano de Techo', fundacion: 1982, division: 'A', descripcion: 'Club bogotano propiedad del grupo asegurador del mismo nombre, campeón de la Copa Colombia en 2008.' },
  { slug: 'union-magdalena', nombre: 'Unión Magdalena', oficial: 'Unión Magdalena S.A.', apodo: 'El Ciclón Bananero', ciudad: 'Santa Marta', estadio: 'Sierra Nevada', fundacion: 1950, division: 'B', apiId: 1465, descripcion: 'Campeón de la Liga en 1968, histórico representante de Santa Marta y del fútbol de la costa Caribe.' },
  { slug: 'patriotas', nombre: 'Patriotas', oficial: 'Patriotas Boyacá F.C. S.A.', apodo: 'La Banda Roja', ciudad: 'Tunja', estadio: 'La Independencia', fundacion: 2003, division: 'B', apiId: 1140, descripcion: 'Club boyacense con una década en la primera división antes de su descenso al Torneo BetPlay.' },
  { slug: 'cucuta-deportivo', nombre: 'Cúcuta Deportivo', oficial: 'Cúcuta Deportivo F.C. S.A.', apodo: 'El Motilón', ciudad: 'Cúcuta', estadio: 'General Santander', fundacion: 1924, division: 'B', apiId: 1470, alias: ['Cúcuta'], descripcion: 'Semifinalista de la Copa Libertadores 2007, uno de los grandes históricos que hoy milita en la segunda división.' },
  { slug: 'real-cartagena', nombre: 'Real Cartagena', oficial: 'Real Cartagena F.C. S.A.', apodo: 'El Heroico', ciudad: 'Cartagena', estadio: 'Jaime Morón León', fundacion: 1971, division: 'B', apiId: 1459, descripcion: 'El equipo de la ciudad amurallada, con varias temporadas en primera división y una hinchada fiel en la costa.' },
  { slug: 'atletico-huila', nombre: 'Atlético Huila', oficial: 'Corporación Social Deportiva y Cultural Atlético Huila', apodo: 'Los Opitas', ciudad: 'Neiva', estadio: 'Guillermo Plazas Alcid', fundacion: 1990, division: 'B', apiId: 1130, alias: ['Huila'], descripcion: 'Subcampeón de la Liga en 2007 y campeón de la Copa Libertadores Femenina en 2018, un hito para el fútbol colombiano.' },
  { slug: 'deportes-quindio', nombre: 'Deportes Quindío', oficial: 'Deportes Quindío S.A.', apodo: 'El Cuyabro', ciudad: 'Armenia', estadio: 'Centenario', fundacion: 1951, division: 'B', apiId: 1461, alias: ['Quindío'], descripcion: 'Campeón de la Liga en 1956, histórico del fútbol cafetero que busca su regreso a la primera división.' },
  { slug: 'orsomarso', nombre: 'Orsomarso', oficial: 'Orsomarso S.C.', ciudad: 'Palmira', estadio: 'Francisco Rivera Escobar', fundacion: 2015, division: 'B', apiId: 1469, descripcion: 'Club vallecaucano de formación, con proyecto centrado en jugadores jóvenes del suroccidente del país.' },
  { slug: 'real-santander', nombre: 'Real Santander', oficial: 'Real Santander F.C.', ciudad: 'Floridablanca', fundacion: 2008, division: 'B', apiId: 1463, descripcion: 'Representante santandereano en el Torneo BetPlay, con trabajo enfocado en divisiones menores.' },
  { slug: 'barranquilla-fc', nombre: 'Barranquilla FC', oficial: 'Barranquilla Fútbol Club S.A.', ciudad: 'Barranquilla', estadio: 'Romelio Martínez', fundacion: 2007, division: 'B', apiId: 1466, alias: ['Barranquilla'], descripcion: 'Filial formativa con sede en la capital del Atlántico, participante habitual del Torneo BetPlay.' },
  { slug: 'bogota-fc', nombre: 'Bogotá FC', oficial: 'Bogotá Fútbol Club S.A.', ciudad: 'Bogotá', estadio: 'Metropolitano de Techo', fundacion: 2003, division: 'B', apiId: 1458, descripcion: 'Club capitalino de la segunda división, con énfasis en la formación de jugadores jóvenes.' },
  { slug: 'tigres', nombre: 'Tigres', oficial: 'Tigres Fútbol Club S.A.', ciudad: 'Bogotá', estadio: 'Metropolitano de Techo', fundacion: 2011, division: 'B', apiId: 1145, alias: ['Tigres FC'], descripcion: 'Club bogotano que llegó a disputar la primera división y hoy compite en el Torneo BetPlay.' },
  { slug: 'leones', nombre: 'Leones', oficial: 'Leones F.C. S.A.', ciudad: 'Itagüí', fundacion: 1957, division: 'B', apiId: 1143, alias: ['Leones FC'], descripcion: 'Club antioqueño con paso por la primera división, actualmente en el Torneo BetPlay.' },
  { slug: 'internacional-de-bogota', nombre: 'Internacional de Bogotá', oficial: 'Internacional de Bogotá F.C.', ciudad: 'Bogotá', fundacion: 2019, division: 'B', apiId: 1134, descripcion: 'Uno de los clubes más recientes del profesionalismo colombiano, con sede en la capital.' },
  { slug: 'internacional-de-palmira', nombre: 'Internacional de Palmira', oficial: 'Internacional F.C. de Palmira', ciudad: 'Palmira', fundacion: 2019, division: 'B', apiId: 23326, descripcion: 'Representante de Palmira en el Torneo BetPlay, de creación reciente.' },
  { slug: 'deportivo-popayan', nombre: 'Deportivo Popayán', oficial: 'Asociación Deportivo Popayán', ciudad: 'Popayán', estadio: 'Ciro López', fundacion: 1980, division: 'B', apiId: 1460, alias: ['Popayán'], descripcion: 'El equipo del Cauca, participante del Torneo BetPlay con fuerte arraigo regional.' },
  { slug: 'real-soacha', nombre: 'Real Soacha Cundinamarca', oficial: 'Real Soacha Cundinamarca F.C.', ciudad: 'Soacha', fundacion: 2021, division: 'B', apiId: 22099, alias: ['Real Soacha'], descripcion: 'Club cundinamarqués de reciente fundación que compite en la segunda división.' },
  { slug: 'depor-fc', nombre: 'Depor FC', oficial: 'Depor Fútbol Club', ciudad: 'Cali', fundacion: 2010, division: 'B', apiId: 1468, descripcion: 'Club vallecaucano de formación con participación en el Torneo BetPlay.' }
];

const porSlug = new Map(EQUIPOS.map((e) => [e.slug, e]));

const normaliza = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const indiceNombres = new Map<string, Equipo>();
for (const e of EQUIPOS) {
  indiceNombres.set(normaliza(e.nombre), e);
  indiceNombres.set(normaliza(e.oficial), e);
  for (const a of e.alias || []) indiceNombres.set(normaliza(a), e);
}

/** Busca un club por cualquiera de sus nombres o alias. Sin coincidencias parciales
 *  (evita que "Cali" traiga a "América de Cali" o "Chicó" a otro club). */
export function buscarEquipo(nombre: string): Equipo | undefined {
  return indiceNombres.get(normaliza(nombre));
}

export function equipoPorSlug(slug: string): Equipo | undefined {
  return porSlug.get(slug);
}

export function escudoDe(e?: Equipo, tamano: 64 | 256 = 256): string | null {
  return e?.apiId ? `/escudos/${tamano === 64 ? '64/' : ''}${e.apiId}.png` : null;
}

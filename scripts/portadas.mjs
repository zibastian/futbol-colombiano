// Generador de portadas por plantilla — la base del futuro "diagramador".
// Compone piezas SVG con la identidad del sitio y los escudos REALES de los
// equipos (embebidos en base64 para que se vean aunque el SVG se cargue como <img>).
//
// Uso: npm run portadas      (requiere src/data/escudos.json -> npm run escudos)

import { readFile, writeFile, mkdir } from 'node:fs/promises';

const OUT = 'public/demo';
await mkdir(OUT, { recursive: true });

let colores = {};
try {
  colores = JSON.parse(await readFile('src/data/colores-equipos.json', 'utf8'));
} catch {
  console.warn('Sin src/data/colores-equipos.json — corre: python3 scripts/colores-escudos.py');
}

let escudos = [];
try {
  escudos = JSON.parse(await readFile('src/data/escudos.json', 'utf8'));
} catch {
  console.warn('Sin src/data/escudos.json — corre primero: npm run escudos');
}

const aSlug = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const buscar = (nombre) => {
  const s = aSlug(nombre);
  return (
    escudos.find((e) => e.slug === s) ||
    escudos.find((e) => e.slug.includes(s) || s.includes(e.slug))
  );
};

async function escudoBase64(nombre) {
  const eq = buscar(nombre);
  if (!eq) return null;
  try {
    const png = await readFile(`public/escudos/${eq.id}.png`);
    return `data:image/png;base64,${png.toString('base64')}`;
  } catch {
    return null;
  }
}

/** Color dominante del escudo, para teñir la franja. Si el club no tiene
 *  escudo descargado, se cae al azul de la marca. */
function colorDe(nombre) {
  const eq = buscar(nombre);
  return (eq && colores[String(eq.id)]?.[0]) || '#1B4C9E';
}

/* Lenguaje visual común a todas las portadas (variante C, la elegida):
   fondo con degradado y trama diagonal, franja amarilla inclinada como eje, y
   el dato principal en tinta oscura sobre el amarillo. La trama y el degradado
   son lo que sacan a la pieza del color plano. */
const TRAMA = `<defs>
    <!-- Sombra tenue en el texto claro. La geometría ya evita que el título
         pise la franja, pero un escudo o un fondo claro pueden aparecer detrás
         en cualquier momento: esto garantiza que el texto siempre se lea. -->
    <filter id="sombraTexto" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.55"/>
    </filter>
    <pattern id="rayas" width="26" height="26" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <rect width="13" height="26" fill="#FFFFFF" opacity="0.035"/>
    </pattern>
    <linearGradient id="fondoBase" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#12305C"/><stop offset="1" stop-color="#08172D"/>
    </linearGradient>
  </defs>`;

/* Geometría de la franja inclinada.
   El título NO puede empezar donde la franja todavía existe: letras blancas
   sobre amarillo no se leen. Estos números son el contrato entre la franja y
   el texto, y de acá sale el cálculo de la primera línea. */
const FRANJA = {
  equipo:  { yIzq: 232, alto: 55, subida: 82, acento: 17 },
  partido: { yIzq: 300, alto: 215, subida: 85, acento: 17 }
};

/** Y del borde INFERIOR de la franja (acento incluido) a una X dada. */
const bordeInferior = (f, x) => f.yIzq + f.alto + f.acento - (x / 1200) * f.subida;

/** Primera línea de texto que no toca la franja, con aire suficiente.
 *  0.72em es la altura de mayúscula: es lo que sube la letra desde la línea base. */
const baseBajoFranja = (f, x, tam, aire = 24) =>
  Math.round(bordeInferior(f, x) + aire + tam * 0.72);

const fondoTramado = (bg) => `${TRAMA}
  <rect width="1200" height="675" fill="${bg === '#0B2C5E' ? 'url(#fondoBase)' : bg}"/>
  <rect width="1200" height="675" fill="url(#rayas)"/>`;

const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* Ancho del texto dentro del SVG
 * ------------------------------
 * Un SVG que se carga como <img> queda aislado de la pagina: NO puede usar las
 * webfonts del sitio. El navegador sustituye Barlow Condensed por su sans por
 * defecto, que es bastante mas ancha, y el titulo se desborda o pisa los escudos.
 * Por eso no alcanza con estimar el ancho: hay que fijarlo.
 *
 * textLength le dice al navegador el ancho exacto que debe ocupar la linea y el
 * ajusta los glifos, use la fuente que use. Como el objetivo se calcula con las
 * proporciones de Barlow Condensed, el texto ademas queda condensado: se parece
 * al diseno en vez de depender de que fuente tenga el telefono.
 */
const EM_TITULO = 0.55; // ancho medio por caracter, Barlow Condensed bold en mayusculas
const EM_ANCHA = 0.75;  // el mismo texto en la sans de reemplazo (Helvetica/Roboto)

/** Ancho objetivo de una linea de titulo. */
const anchoTitulo = (txt, tam) => Math.round(txt.length * tam * EM_TITULO);

/* Ancho aproximado de cada letra en mayúscula, en fracción de em.
   Contar caracteres no alcanza: "PROBLEMA" son ocho letras anchas y
   "EL VAR NO ES EL" son quince, pero muchas angostas y con espacios. */
const ANCHO_CARACTER = {
  ...Object.fromEntries([...'BCEFKLPRSTXYZ'].map((c) => [c, 0.68])),
  ...Object.fromEntries([...'ADGHNOQUV'].map((c) => [c, 0.78])),
  ...Object.fromEntries([...'MW'].map((c) => [c, 1.0])),
  ...Object.fromEntries([...'IJ'].map((c) => [c, 0.32])),
  ...Object.fromEntries([...'0123456789'].map((c) => [c, 0.6])),
  Á: 0.78, É: 0.68, Í: 0.32, Ó: 0.78, Ú: 0.78, Ñ: 0.78,
  ' ': 0.28, ',': 0.3, '.': 0.3, '-': 0.35, ':': 0.3
};

const anchoNatural = (txt, tam) =>
  [...txt.toUpperCase()].reduce((s, c) => s + (ANCHO_CARACTER[c] ?? 0.7), 0) * tam;

/** textLength de cada línea de un título de varias líneas, con UNA SOLA escala.
 *
 *  Si cada línea se comprime por su cuenta, las que traen letras anchas se
 *  achatan más que las otras y el título parece escrito en dos tipografías:
 *  "EL VAR NO ES EL" quedaba al 92% y "PROBLEMA" al 74%. Acá se mide el ancho
 *  real de cada línea, se calcula el factor con la más larga, y ese mismo
 *  factor se aplica a todas. */
function anchosDelBloque(lineas, tam, anchoMax) {
  const naturales = lineas.map((l) => anchoNatural(l, tam));
  const iMax = naturales.indexOf(Math.max(...naturales));
  const objetivo = Math.min(anchoTitulo(lineas[iMax], tam), anchoMax);
  const escala = objetivo / naturales[iMax];
  return naturales.map((n) => Math.round(n * escala));
}

/** Cuerpo de texto que solo se comprime si no cabe (kicker, bajadas). */
function limitar(txt, tam, anchoMax, em = EM_ANCHA, extra = 0) {
  const estimado = txt.length * tam * em + extra;
  return estimado > anchoMax ? ` textLength="${Math.round(anchoMax)}" lengthAdjust="spacingAndGlyphs"` : '';
}

function partirTitulo(t, ancho = 17) {
  const palabras = t.split(' ');
  const lineas = [];
  let actual = '';
  for (const p of palabras) {
    if ((actual + ' ' + p).trim().length > ancho && actual) {
      lineas.push(actual.trim());
      actual = p;
    } else actual = (actual + ' ' + p).trim();
  }
  if (actual) lineas.push(actual);
  return lineas;
}

const marca = `<g transform="translate(80,585)">
    <clipPath id="l"><circle cx="24" cy="0" r="24"/></clipPath>
    <g clip-path="url(#l)">
      <rect x="0" y="-24" width="48" height="24" fill="#F2C200"/>
      <rect x="0" y="0" width="48" height="12" fill="#1B4C9E"/>
      <rect x="0" y="12" width="48" height="12" fill="#C8102E"/>
    </g>
    <circle cx="24" cy="0" r="24" fill="none" stroke="#FDFCF9" stroke-width="2.5"/>
    <text x="62" y="-4" font-family="Barlow Condensed, Oswald, sans-serif" font-size="26" font-weight="700" fill="#FFFFFF" letter-spacing="1">FÚTBOL</text>
    <text x="62" y="19" font-family="Barlow Condensed, Oswald, sans-serif" font-size="26" font-weight="700" fill="#F2C200" letter-spacing="1">COLOMBIANO</text>
  </g>`;

/** Plantilla 1: enfrentamiento — escudo vs escudo (partidos y previas).
 *  El marcador manda: va enorme, en tinta oscura, sobre la franja amarilla. */
async function piezaPartido({ kicker, local, visitante, marcador, sub, bg = '#0B2C5E' }) {
  const [a, b] = await Promise.all([escudoBase64(local), escudoBase64(visitante)]);
  const [ca, cb] = [colorDe(local), colorDe(visitante)];
  const tam = marcador.length > 3 ? 110 : 168;
  const img = (d, x) =>
    d
      ? `<image href="${d}" x="${x}" y="290" width="160" height="160" preserveAspectRatio="xMidYMid meet"/>`
      : `<circle cx="${x + 80}" cy="370" r="70" fill="none" stroke="#F2C200" stroke-width="3"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  ${fondoTramado(bg)}
  <polygon points="0,300 1200,215 1200,430 0,515" fill="#F2C200"/>
  <polygon points="0,300 1200,215 1200,232 0,317" fill="${ca}" opacity="0.75"/>
  <polygon points="0,498 1200,413 1200,430 0,515" fill="${cb}" opacity="0.75"/>
  <rect width="1200" height="8" fill="#F2C200"/>
  <text x="600" y="112" text-anchor="middle" font-family="Barlow Condensed, Oswald, sans-serif" font-size="38" font-weight="700" fill="#F2C200"${limitar(kicker, 38, 900, EM_ANCHA, kicker.length * 5)} letter-spacing="5">${esc(kicker)}</text>
  ${img(a, 150)}
  ${img(b, 890)}
  <text x="600" y="405" text-anchor="middle" font-family="Barlow Condensed, Oswald, sans-serif" font-size="${tam}" font-weight="700" fill="#0A1626" textLength="${anchoTitulo(marcador, tam)}" lengthAdjust="spacingAndGlyphs">${esc(marcador)}</text>
  <text x="600" y="590" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="26" fill="#C7D6EC"${limitar(sub, 26, 900, 0.55)}>${esc(sub)}</text>
  ${marca}
</svg>
`;
}

/** Plantilla 2: un solo equipo o jugador (fichajes, notas de club).
 *  Mismo lenguaje que la de partido: trama, franja inclinada y el titular
 *  apoyado sobre ella, para que las dos plantillas se lean como una familia. */
async function piezaEquipo({ kicker, titulo, sub, equipo, bg = '#14161A' }) {
  const d = equipo ? await escudoBase64(equipo) : null;
  const acento = equipo ? colorDe(equipo) : '#1B4C9E';
  const lineas = partirTitulo(titulo, 15);
  const tam = lineas.length === 1 ? 76 : 60;
  // Antes era un número fijo (330 / 300) y la primera línea caía ENCIMA de la
  // franja amarilla: texto blanco sobre amarillo, ilegible. Ahora se calcula.
  const y0 = baseBajoFranja(FRANJA.equipo, 80, tam);
  const anchos = anchosDelBloque(lineas, tam, 720);
  const tspans = lineas
    .map((l, i) => `<tspan x="80" y="${y0 + i * (tam + 6)}" textLength="${anchos[i]}" lengthAdjust="spacingAndGlyphs">${esc(l)}</tspan>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  ${fondoTramado(bg)}
  <polygon points="0,232 1200,150 1200,205 0,287" fill="#F2C200"/>
  <polygon points="0,287 1200,205 1200,222 0,304" fill="${acento}" opacity="0.8"/>
  <rect width="1200" height="8" fill="#F2C200"/>
  ${d ? `<image href="${d}" x="850" y="330" width="270" height="270" opacity="0.95" preserveAspectRatio="xMidYMid meet"/>` : ''}
  <text x="80" y="196" font-family="Barlow Condensed, Oswald, sans-serif" font-size="38" font-weight="700" fill="#F2C200"${limitar(kicker, 38, 700, EM_ANCHA, kicker.length * 4)} letter-spacing="4">${esc(kicker)}</text>
  <text font-family="Barlow Condensed, Oswald, sans-serif" font-size="${tam}" font-weight="700" fill="#FFFFFF" filter="url(#sombraTexto)">${tspans}</text>
  <text x="80" y="${y0 + lineas.length * (tam + 6) + 18}" font-family="Inter, system-ui, sans-serif" font-size="28" fill="#C3CFE0"${limitar(sub, 28, 700, 0.55)}>${esc(sub)}</text>
  ${marca}
</svg>
`;
}

/** Logo oficial del torneo, si existe en public/torneos/{slug}.png
 *  Uso editorial para identificar la competición. Ver docs/imagenes.md */
async function logoTorneo(slug) {
  try {
    const png = await readFile(`public/torneos/${slug}.png`);
    return `data:image/png;base64,${png.toString('base64')}`;
  } catch {
    return null;
  }
}

/** Banner de sección: título + franja con los escudos reales de los equipos. */
async function piezaBanner({ slug, kicker, titulo, sub, equipos = [], bg = '#0B2C5E', acento = '#F2C200' }) {
  const logo = slug ? await logoTorneo(slug) : null;
  const escudos = (await Promise.all(equipos.map(escudoBase64))).filter(Boolean);

  // Geometría: primero se reserva el espacio de los escudos y del logo,
  // y el título se ajusta al ancho que queda (nunca se pisan).
  const tam = 66;              // lado de cada escudo
  const paso = 84;             // separación entre escudos
  const anchoPanel = escudos.length ? escudos.length * paso + 26 : 0;
  const panelX = 1200 - anchoPanel - 40;
  const xTexto = logo ? 240 : 70;
  const disponible = (escudos.length ? panelX - 34 : 1140) - xTexto;

  // El título se dimensiona con las proporciones de Barlow Condensed y luego se
  // fija con textLength, así el render no depende de la fuente del navegador.
  const tamTitulo = Math.max(30, Math.min(56, Math.floor(disponible / (titulo.length * EM_TITULO))));
  const anchoT = Math.min(anchoTitulo(titulo, tamTitulo), disponible);

  const fila = escudos
    .map((d, i) => `<image href="${d}" x="${panelX + 13 + i * paso}" y="${120 + (92 - tam) / 2}" width="${tam}" height="${tam}" preserveAspectRatio="xMidYMid meet"/>`)
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 260" width="1200" height="260">
  <rect width="1200" height="260" fill="${bg}"/>
  <rect width="1200" height="6" fill="#F2C200"/>
  <g opacity="0.07">
    <circle cx="600" cy="130" r="150" fill="none" stroke="#FFFFFF" stroke-width="3"/>
    <line x1="600" y1="-20" x2="600" y2="280" stroke="#FFFFFF" stroke-width="3"/>
  </g>
  ${logo ? `<image href="${logo}" x="62" y="52" width="152" height="152" preserveAspectRatio="xMidYMid meet"/>` : ''}
  <text x="${xTexto}" y="92" font-family="Barlow Condensed, Oswald, sans-serif" font-size="25" font-weight="700" fill="${acento}" letter-spacing="4"${limitar(kicker, 25, disponible, EM_ANCHA, kicker.length * 4)}>${esc(kicker)}</text>
  <text x="${xTexto}" y="${92 + tamTitulo + 8}" font-family="Barlow Condensed, Oswald, sans-serif" font-size="${tamTitulo}" font-weight="700" fill="#FFFFFF" textLength="${anchoT}" lengthAdjust="spacingAndGlyphs">${esc(titulo)}</text>
  <text x="${xTexto}" y="${92 + tamTitulo + 46}" font-family="Inter, system-ui, sans-serif" font-size="21" fill="#C3CFE0"${limitar(sub, 21, disponible, 0.55)}>${esc(sub)}</text>
  ${escudos.length ? `<rect x="${panelX}" y="120" width="${anchoPanel}" height="92" rx="10" fill="#FFFFFF" opacity="0.1"/>` : ''}
  ${fila}
</svg>
`;
}

/** Banner en versión móvil: el alto se calcula sumando los bloques, así nada
 *  se pisa ni queda cortado por más largo que sea el nombre del torneo. */
async function piezaBannerMovil({ slug, kicker, titulo, sub, equipos = [], bg = '#0B2C5E', acento = '#F2C200' }) {
  const logo = slug ? await logoTorneo(slug) : null;
  const escudos = (await Promise.all(equipos.slice(0, 5).map(escudoBase64))).filter(Boolean);
  const W = 800;
  const MARGEN = 36;

  // Se corta en líneas largas a propósito: partir de más ("TORNEO / BETPLAY")
  // deja renglones cortos que estiran el banner sin necesidad.
  const lineas = partirTitulo(titulo, 15);
  const masLarga = Math.max(...lineas.map((l) => l.length));
  const util = W - 2 * MARGEN - 28;   // 700 px de caja de texto
  const tamTitulo = Math.min(78, Math.floor(util / (masLarga * EM_TITULO)));
  const altoLinea = Math.round(tamTitulo * 1.05);

  // Composición vertical: cada bloque se apila debajo del anterior
  const LOGO = 118;
  let y = MARGEN;
  const yLogo = y;
  if (logo) y += LOGO + 16;
  const yKicker = y + 24;          // baseline del kicker
  y = yKicker + 20;
  const yTitulo = y + tamTitulo;   // baseline de la primera línea
  y = yTitulo + (lineas.length - 1) * altoLinea + 16;
  const ySub = y + 22;
  y = ySub + 16;
  const yEscudos = escudos.length ? y + 18 : y;
  const H = (escudos.length ? yEscudos + 62 : y) + MARGEN;

  // Cada línea lleva su propio textLength: así ninguna se sale del banner y las
  // proporciones son las mismas en cualquier teléfono.
  const anchos = anchosDelBloque(lineas, tamTitulo, util);
  const tspans = lineas
    .map((l, i) => `<tspan x="${W / 2}" y="${yTitulo + i * altoLinea}" textLength="${anchos[i]}" lengthAdjust="spacingAndGlyphs">${esc(l)}</tspan>`)
    .join('');

  const paso = 78;
  const inicio = (W - escudos.length * paso) / 2;
  const fila = escudos
    .map((d, i) => `<image href="${d}" x="${inicio + i * paso + 8}" y="${yEscudos}" width="62" height="62" preserveAspectRatio="xMidYMid meet"/>`)
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <rect width="${W}" height="8" fill="#F2C200"/>
  <g opacity="0.06">
    <circle cx="${W / 2}" cy="${H / 2}" r="${Math.min(W, H) * 0.42}" fill="none" stroke="#FFFFFF" stroke-width="4"/>
    <line x1="60" y1="${H / 2}" x2="${W - 60}" y2="${H / 2}" stroke="#FFFFFF" stroke-width="4"/>
  </g>
  ${logo ? `<image href="${logo}" x="${W / 2 - LOGO / 2}" y="${yLogo}" width="${LOGO}" height="${LOGO}" preserveAspectRatio="xMidYMid meet"/>` : ''}
  <text x="${W / 2}" y="${yKicker}" text-anchor="middle" font-family="Barlow Condensed, Oswald, sans-serif" font-size="30" font-weight="700" fill="${acento}" letter-spacing="5"${limitar(kicker, 30, util, EM_ANCHA, kicker.length * 5)}>${esc(kicker)}</text>
  <text text-anchor="middle" font-family="Barlow Condensed, Oswald, sans-serif" font-size="${tamTitulo}" font-weight="700" fill="#FFFFFF" letter-spacing="1">${tspans}</text>
  <text x="${W / 2}" y="${ySub}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="25" fill="#C3CFE0"${limitar(sub, 25, util, 0.55)}>${esc(sub)}</text>
  ${fila}
</svg>
`;
}

const banners = [
  ['liga-betplay.svg', { slug: 'liga-betplay', kicker: 'PRIMERA DIVISIÓN', titulo: 'LIGA BETPLAY', sub: 'Tabla, goleadores y descenso',
    equipos: ['Atletico Nacional', 'Millonarios', 'America de Cali', 'Santa Fe', 'Junior'] }],
  ['torneo-betplay.svg', { slug: 'torneo-betplay', kicker: 'SEGUNDA DIVISIÓN', titulo: 'TORNEO BETPLAY', sub: 'La pelea por el ascenso', bg: '#14498F',
    equipos: ['Envigado', 'Real Cartagena', 'Union Magdalena', 'Patriotas', 'Quindio'] }],
  ['copa-betplay.svg', { slug: 'copa-betplay', kicker: 'TODO EL AÑO', titulo: 'COPA BETPLAY', sub: 'Primera y segunda división se cruzan', bg: '#0F6E56',
    equipos: ['Atletico Nacional', 'Cucuta', 'Junior', 'Patriotas', 'Once Caldas'] }],
  ['liga-femenina.svg', { slug: 'liga-femenina', kicker: 'FÚTBOL FEMENINO', titulo: 'LIGA FEMENINA', sub: 'Tabla, goleadoras y asistencias', bg: '#7E1B45',
    equipos: ['Atletico Nacional', 'America de Cali', 'Santa Fe', 'Deportivo Cali', 'Millonarios'] }],
  // Las copas continentales se cuentan desde el ángulo del sitio: qué hacen
  // los colombianos ahí. Por eso los escudos son los de los clubes nuestros
  // que las juegan, no los de los favoritos del torneo.
  ['copa-libertadores.svg', { slug: 'copa-libertadores', kicker: 'CONMEBOL', titulo: 'COPA LIBERTADORES', sub: 'El camino de los colombianos', bg: '#0E3B2E',
    equipos: ['Independiente Medellin', 'Deportes Tolima', 'Santa Fe', 'Junior'] }],
  ['copa-sudamericana.svg', { slug: 'copa-sudamericana', kicker: 'CONMEBOL', titulo: 'COPA SUDAMERICANA', sub: 'El camino de los colombianos', bg: '#7A4E12',
    equipos: ['America de Cali', 'Millonarios', 'Independiente Medellin', 'Santa Fe'] }],
  ['fichajes.svg', { slug: 'fichajes', kicker: 'MERCADO DE PASES', titulo: 'FICHAJES', sub: 'Llegadas, salidas y rumores del FPC', bg: '#14161A',
    equipos: ['Millonarios', 'Atletico Nacional', 'America de Cali', 'Junior', 'Santa Fe'] }],
  ['colombianos-en-el-exterior.svg', { slug: 'colombianos-en-el-exterior', kicker: 'SEGUIMIENTO DIARIO', titulo: 'COLOMBIANOS EN EL EXTERIOR', sub: 'Europa, MLS, Brasil y Argentina', bg: '#B3271E', equipos: [] }],
  ['opinion.svg', { slug: 'opinion', kicker: 'COLUMNAS FIRMADAS', titulo: 'OPINIÓN', sub: 'Cada firma, su mirada', bg: '#0B2C5E', equipos: [] }],
  ['noticias.svg', { slug: 'noticias', kicker: 'ACTUALIDAD', titulo: 'NOTICIAS', sub: 'Todo el fútbol profesional colombiano', bg: '#14161A', equipos: [] }]
];

const piezas = [
  ['cronica.svg', piezaPartido, { kicker: 'CRÓNICA', local: 'Atletico Nacional', visitante: 'Junior', marcador: '2-1', sub: 'Fecha 3 · Atanasio Girardot' }],
  ['previa.svg', piezaPartido, { kicker: 'PREVIA', local: 'Millonarios', visitante: 'Independiente Santa Fe', marcador: 'VS', sub: 'Domingo 8:00 p.m. · El Campín', bg: '#1B4C9E' }],
  ['liga.svg', piezaPartido, { kicker: 'LIGA BETPLAY', local: 'America de Cali', visitante: 'Boyaca Chico', marcador: '7-0', sub: 'Fecha 2 · Pascual Guerrero', bg: '#14161A' }],
  ['fichaje.svg', piezaEquipo, { kicker: 'FICHAJES', titulo: 'QUINTERO AL DIM', sub: 'Negociación en curso', equipo: 'Independiente Medellin' }],
  ['exterior.svg', piezaEquipo, { kicker: 'EXTERIOR', titulo: 'LUIS DÍAZ, FIGURA', sub: 'Bayern Múnich · Bundesliga', equipo: null, bg: '#B3271E' }],
  ['opinion.svg', piezaEquipo, { kicker: 'OPINIÓN', titulo: 'EL VAR NO ES EL PROBLEMA', sub: 'Columna', equipo: null, bg: '#0B2C5E' }],
  ['bienvenida.svg', piezaEquipo, { kicker: 'EL PORTAL', titulo: 'VUELVE EL FÚTBOL NUESTRO', sub: 'Cobertura total del FPC', equipo: null, bg: '#1B4C9E' }],
];

for (const [archivo, fn, args] of piezas) {
  await writeFile(`${OUT}/${archivo}`, await fn(args));
  console.log(`  ok ${archivo}`);
}

await mkdir('public/banners', { recursive: true });
for (const [archivo, args] of banners) {
  await writeFile(`public/banners/${archivo}`, await piezaBanner(args));
  await writeFile(`public/banners/${archivo.replace('.svg', '-movil.svg')}`, await piezaBannerMovil(args));
  console.log(`  ok banners/${archivo} (+ versión móvil)`);
}

// Portada genérica de respaldo (vive fuera de /demo: se usa siempre que una nota no traiga imagen)
await writeFile(
  'public/portada-default.svg',
  await piezaEquipo({ kicker: 'FÚTBOL COLOMBIANO', titulo: 'NOTICIAS DEL FPC', sub: 'Liga BetPlay · Copa Colombia · Exterior', equipo: null })
);
console.log('  ok portada-default.svg (respaldo permanente)');
console.log(escudos.length ? `Escudos disponibles: ${escudos.length}` : 'Sin escudos: se usó el balón tricolor como respaldo');

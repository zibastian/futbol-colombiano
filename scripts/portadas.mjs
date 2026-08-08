// Generador de portadas por plantilla — la base del futuro "diagramador".
// Compone piezas SVG con la identidad del sitio y los escudos REALES de los
// equipos (embebidos en base64 para que se vean aunque el SVG se cargue como <img>).
//
// Uso: npm run portadas      (requiere src/data/escudos.json -> npm run escudos)

import { readFile, writeFile, mkdir } from 'node:fs/promises';

const OUT = 'public/demo';
await mkdir(OUT, { recursive: true });

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

const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');

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

/** Plantilla 1: enfrentamiento — escudo vs escudo (partidos y previas). */
async function piezaPartido({ kicker, local, visitante, marcador, sub, bg = '#0B2C5E' }) {
  const [a, b] = await Promise.all([escudoBase64(local), escudoBase64(visitante)]);
  const img = (d, x) =>
    d
      ? `<image href="${d}" x="${x}" y="250" width="190" height="190" preserveAspectRatio="xMidYMid meet"/>`
      : `<circle cx="${x + 95}" cy="345" r="80" fill="none" stroke="#F2C200" stroke-width="3"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <rect width="1200" height="675" fill="${bg}"/>
  <rect width="1200" height="8" fill="#F2C200"/>
  <text x="600" y="150" text-anchor="middle" font-family="Barlow Condensed, Oswald, sans-serif" font-size="40" font-weight="700" fill="#F2C200" letter-spacing="5">${esc(kicker)}</text>
  ${img(a, 190)}
  ${img(b, 820)}
  <text x="600" y="380" text-anchor="middle" font-family="Barlow Condensed, Oswald, sans-serif" font-size="${marcador.length > 3 ? 76 : 104}" font-weight="700" fill="#FFFFFF">${esc(marcador)}</text>
  <text x="600" y="470" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="30" fill="#C3CFE0">${esc(sub)}</text>
  ${marca}
</svg>
`;
}

/** Plantilla 2: un solo equipo o jugador (fichajes, notas de club). */
async function piezaEquipo({ kicker, titulo, sub, equipo, bg = '#14161A' }) {
  const d = equipo ? await escudoBase64(equipo) : null;
  const lineas = partirTitulo(titulo, 15);
  const tam = lineas.length === 1 ? 82 : 64;
  const y0 = lineas.length === 1 ? 320 : 280;
  const tspans = lineas
    .map((l, i) => `<tspan x="80" y="${y0 + i * (tam + 8)}">${esc(l)}</tspan>`)
    .join('');
  const marcaAgua = d
    ? `<image href="${d}" x="820" y="230" width="300" height="300" opacity="0.9" preserveAspectRatio="xMidYMid meet"/>`
    : `<clipPath id="bw"><circle cx="1020" cy="510" r="145"/></clipPath>
       <g clip-path="url(#bw)" opacity="0.15">
         <rect x="875" y="365" width="290" height="145" fill="#F2C200"/>
         <rect x="875" y="510" width="290" height="73" fill="#1B4C9E"/>
         <rect x="875" y="583" width="290" height="73" fill="#C8102E"/>
       </g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <rect width="1200" height="675" fill="${bg}"/>
  <rect width="1200" height="8" fill="#F2C200"/>
  ${marcaAgua}
  <text x="80" y="180" font-family="Barlow Condensed, Oswald, sans-serif" font-size="38" font-weight="700" fill="#F2C200" letter-spacing="4">${esc(kicker)}</text>
  <text font-family="Barlow Condensed, Oswald, sans-serif" font-size="${tam}" font-weight="700" fill="#FFFFFF" letter-spacing="1">${tspans}</text>
  <text x="80" y="${y0 + lineas.length * (tam + 8) + 14}" font-family="Inter, system-ui, sans-serif" font-size="30" fill="#C3CFE0">${esc(sub)}</text>
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

  // Barlow Condensed en mayúsculas ocupa ~0.47em por carácter
  const tamTitulo = Math.max(34, Math.min(62, Math.floor(disponible / (titulo.length * 0.47))));

  const fila = escudos
    .map((d, i) => `<image href="${d}" x="${panelX + 13 + i * paso}" y="${130 - tam / 2 + 33}" width="${tam}" height="${tam}" preserveAspectRatio="xMidYMid meet"/>`)
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 260" width="1200" height="260">
  <rect width="1200" height="260" fill="${bg}"/>
  <rect width="1200" height="6" fill="#F2C200"/>
  <g opacity="0.07">
    <circle cx="600" cy="130" r="150" fill="none" stroke="#FFFFFF" stroke-width="3"/>
    <line x1="600" y1="-20" x2="600" y2="280" stroke="#FFFFFF" stroke-width="3"/>
  </g>
  ${logo ? `<image href="${logo}" x="62" y="52" width="152" height="152" preserveAspectRatio="xMidYMid meet"/>` : ''}
  <text x="${xTexto}" y="92" font-family="Barlow Condensed, Oswald, sans-serif" font-size="25" font-weight="700" fill="${acento}" letter-spacing="4">${esc(kicker)}</text>
  <text x="${xTexto}" y="${92 + tamTitulo + 8}" font-family="Barlow Condensed, Oswald, sans-serif" font-size="${tamTitulo}" font-weight="700" fill="#FFFFFF" letter-spacing="1">${esc(titulo)}</text>
  <text x="${xTexto}" y="${92 + tamTitulo + 46}" font-family="Inter, system-ui, sans-serif" font-size="21" fill="#C3CFE0">${esc(sub)}</text>
  ${escudos.length ? `<rect x="${panelX}" y="120" width="${anchoPanel}" height="92" rx="10" fill="#FFFFFF" opacity="0.1"/>` : ''}
  ${fila}
</svg>
`;
}

const banners = [
  ['liga-betplay.svg', { slug: 'liga-betplay', kicker: 'PRIMERA DIVISIÓN', titulo: 'LIGA BETPLAY', sub: 'Tabla, goleadores y descenso',
    equipos: ['Atletico Nacional', 'Millonarios', 'America de Cali', 'Santa Fe', 'Junior'] }],
  ['torneo-betplay.svg', { slug: 'torneo-betplay', kicker: 'SEGUNDA DIVISIÓN', titulo: 'TORNEO BETPLAY', sub: 'La pelea por el ascenso', bg: '#14498F',
    equipos: ['Cucuta', 'Real Cartagena', 'Union Magdalena', 'Huila', 'Quindio'] }],
  ['copa-betplay.svg', { slug: 'copa-betplay', kicker: 'TODO EL AÑO', titulo: 'COPA BETPLAY', sub: 'Primera y segunda división se cruzan', bg: '#0F6E56',
    equipos: ['Atletico Nacional', 'Cucuta', 'Junior', 'Huila', 'Once Caldas'] }],
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
  console.log(`  ok banners/${archivo}`);
}

// Portada genérica de respaldo (vive fuera de /demo: se usa siempre que una nota no traiga imagen)
await writeFile(
  'public/portada-default.svg',
  await piezaEquipo({ kicker: 'FÚTBOL COLOMBIANO', titulo: 'NOTICIAS DEL FPC', sub: 'Liga BetPlay · Copa Colombia · Exterior', equipo: null })
);
console.log('  ok portada-default.svg (respaldo permanente)');
console.log(escudos.length ? `Escudos disponibles: ${escudos.length}` : 'Sin escudos: se usó el balón tricolor como respaldo');

// Tres tratamientos visuales para la portada de partido, sobre el MISMO
// partido, para poder compararlos de verdad. Cuando se elija uno, se lleva a
// scripts/portadas.mjs y este archivo se borra.
//
// Uso: npm run portadas:variantes  ->  public/demo/variantes/
//
// Los colores de cada club salen de su escudo (scripts/colores-escudos.py),
// no de una lista escrita a mano.

import { readFile, writeFile, mkdir } from 'node:fs/promises';

const OUT = 'public/demo/variantes';
await mkdir(OUT, { recursive: true });

const escudos = JSON.parse(await readFile('src/data/escudos.json', 'utf8'));
const colores = JSON.parse(await readFile('src/data/colores-equipos.json', 'utf8'));

const aSlug = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const buscar = (nombre) => {
  const s = aSlug(nombre);
  return escudos.find((e) => e.slug === s) || escudos.find((e) => e.slug.includes(s) || s.includes(e.slug));
};

async function club(nombre) {
  const eq = buscar(nombre);
  if (!eq) throw new Error(`Sin escudo: ${nombre}`);
  const png = await readFile(`public/escudos/${eq.id}.png`);
  const [c1, c2] = colores[String(eq.id)] ?? ['#1B2A44', '#F2C200'];
  return { nombre, img: `data:image/png;base64,${png.toString('base64')}`, color: c1, color2: c2 };
}

const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** Mezcla un color con el fondo. Los colores de camiseta son brillantes: sobre
 *  ellos el texto blanco no se lee, así que se apagan antes de usarlos. */
function mezclar(hex, conHex, cantidad) {
  const n = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = n(hex);
  const [r2, g2, b2] = n(conHex);
  const m = (a, b) => Math.round(a * (1 - cantidad) + b * cantidad);
  return `#${[m(r1, r2), m(g1, g2), m(b1, b2)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

// El SVG se carga como <img>: no tiene las webfonts del sitio. textLength fija
// el ancho de cada texto para que el render no dependa de la fuente sustituta.
const EM = 0.55;
const ancho = (t, tam) => Math.round(t.length * tam * EM);
const marca = (x, y) => `<g transform="translate(${x},${y})">
    <clipPath id="lg"><circle cx="24" cy="0" r="24"/></clipPath>
    <g clip-path="url(#lg)">
      <rect x="0" y="-24" width="48" height="24" fill="#F2C200"/>
      <rect x="0" y="0" width="48" height="12" fill="#1B4C9E"/>
      <rect x="0" y="12" width="48" height="12" fill="#C8102E"/>
    </g>
    <circle cx="24" cy="0" r="24" fill="none" stroke="#FDFCF9" stroke-width="2.5"/>
    <text x="62" y="-4" font-family="Barlow Condensed, sans-serif" font-size="26" font-weight="700" fill="#FFFFFF" textLength="${ancho('FÚTBOL', 26)}" lengthAdjust="spacingAndGlyphs">FÚTBOL</text>
    <text x="62" y="19" font-family="Barlow Condensed, sans-serif" font-size="26" font-weight="700" fill="#F2C200" textLength="${ancho('COLOMBIANO', 26)}" lengthAdjust="spacingAndGlyphs">COLOMBIANO</text>
  </g>`;

const K = (t, x, y, tam = 34, fill = '#F2C200') =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-size="${tam}" font-weight="700" fill="${fill}" textLength="${ancho(t, tam) + t.length * 5}" lengthAdjust="spacing">${esc(t)}</text>`;

// ---------------------------------------------------------------------------
// A — Diagonal de color: cada mitad toma el color del club. Se ve de quién es
//     el partido antes de leer una palabra.
// ---------------------------------------------------------------------------
function variantePrimera({ kicker, a, b, marcador, sub }) {
  const izq = mezclar(a.color, '#0A1626', 0.62);
  const der = mezclar(b.color, '#0A1626', 0.62);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${mezclar(izq, '#FFFFFF', 0.1)}"/><stop offset="1" stop-color="${mezclar(izq, '#000000', 0.25)}"/>
    </linearGradient>
    <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${mezclar(der, '#FFFFFF', 0.1)}"/><stop offset="1" stop-color="${mezclar(der, '#000000', 0.25)}"/>
    </linearGradient>
  </defs>
  <polygon points="0,0 690,0 510,675 0,675" fill="url(#gi)"/>
  <polygon points="690,0 1200,0 1200,675 510,675" fill="url(#gd)"/>
  <polygon points="690,0 706,0 526,675 510,675" fill="#F2C200" opacity="0.9"/>
  <rect width="1200" height="8" fill="#F2C200"/>
  ${K(kicker, 600, 112)}
  <image href="${a.img}" x="150" y="250" width="200" height="200" preserveAspectRatio="xMidYMid meet"/>
  <image href="${b.img}" x="850" y="250" width="200" height="200" preserveAspectRatio="xMidYMid meet"/>
  <text x="600" y="382" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-size="${marcador.length > 3 ? 92 : 128}" font-weight="700" fill="#FFFFFF" textLength="${ancho(marcador, marcador.length > 3 ? 92 : 128)}" lengthAdjust="spacingAndGlyphs">${esc(marcador)}</text>
  <rect x="${600 - 60}" y="408" width="120" height="5" fill="#F2C200"/>
  <text x="600" y="470" text-anchor="middle" font-family="Inter, sans-serif" font-size="28" fill="#E6EDF7" opacity="0.92">${esc(sub)}</text>
  ${marca(80, 585)}
</svg>
`;
}

// ---------------------------------------------------------------------------
// B — Escudos al sangre: el escudo gigante y recortado por el borde da escala
//     y profundidad; el nítido queda al frente.
// ---------------------------------------------------------------------------
function varianteSegunda({ kicker, a, b, marcador, sub }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <radialGradient id="fondo" cx="0.5" cy="0.42" r="0.78">
      <stop offset="0" stop-color="#17356B"/><stop offset="1" stop-color="#060F1F"/>
    </radialGradient>
    <linearGradient id="brilloA" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${a.color}" stop-opacity="0.55"/><stop offset="1" stop-color="${a.color}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="brilloB" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="${b.color}" stop-opacity="0.55"/><stop offset="1" stop-color="${b.color}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#fondo)"/>
  <rect width="420" height="675" fill="url(#brilloA)"/>
  <rect x="780" width="420" height="675" fill="url(#brilloB)"/>
  <image href="${a.img}" x="-160" y="60" width="560" height="560" opacity="0.13" preserveAspectRatio="xMidYMid meet"/>
  <image href="${b.img}" x="800" y="60" width="560" height="560" opacity="0.13" preserveAspectRatio="xMidYMid meet"/>
  <rect width="1200" height="8" fill="#F2C200"/>
  ${K(kicker, 600, 118)}
  <image href="${a.img}" x="205" y="265" width="175" height="175" preserveAspectRatio="xMidYMid meet"/>
  <image href="${b.img}" x="820" y="265" width="175" height="175" preserveAspectRatio="xMidYMid meet"/>
  <text x="600" y="392" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-size="${marcador.length > 3 ? 96 : 140}" font-weight="700" fill="#FFFFFF" textLength="${ancho(marcador, marcador.length > 3 ? 96 : 140)}" lengthAdjust="spacingAndGlyphs">${esc(marcador)}</text>
  <text x="600" y="468" text-anchor="middle" font-family="Inter, sans-serif" font-size="28" fill="#C7D6EC">${esc(sub)}</text>
  ${marca(80, 585)}
</svg>
`;
}

// ---------------------------------------------------------------------------
// C — Impacto tipográfico: el marcador manda. Franja amarilla en diagonal y
//     nombres de los clubes en condensada bajo cada escudo.
// ---------------------------------------------------------------------------
function varianteTercera({ kicker, a, b, marcador, sub }) {
  const nom = (t, x, y) =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-size="30" font-weight="700" fill="#FFFFFF" opacity="0.85" textLength="${Math.min(ancho(t, 30), 300)}" lengthAdjust="spacingAndGlyphs">${esc(t.toUpperCase())}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <pattern id="rayas" width="26" height="26" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <rect width="13" height="26" fill="#FFFFFF" opacity="0.035"/>
    </pattern>
    <linearGradient id="fondoC" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#12305C"/><stop offset="1" stop-color="#08172D"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#fondoC)"/>
  <rect width="1200" height="675" fill="url(#rayas)"/>
  <polygon points="0,300 1200,215 1200,430 0,515" fill="#F2C200"/>
  <polygon points="0,300 1200,215 1200,232 0,317" fill="${a.color}" opacity="0.75"/>
  <polygon points="0,498 1200,413 1200,430 0,515" fill="${b.color}" opacity="0.75"/>
  <rect width="1200" height="8" fill="#F2C200"/>
  ${K(kicker, 600, 112, 34, '#F2C200')}
  <image href="${a.img}" x="150" y="290" width="160" height="160" preserveAspectRatio="xMidYMid meet"/>
  <image href="${b.img}" x="890" y="290" width="160" height="160" preserveAspectRatio="xMidYMid meet"/>
  ${nom(a.nombre, 230, 505)}
  ${nom(b.nombre, 970, 490)}
  <text x="600" y="405" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-size="${marcador.length > 3 ? 110 : 168}" font-weight="700" fill="#0A1626" textLength="${ancho(marcador, marcador.length > 3 ? 110 : 168)}" lengthAdjust="spacingAndGlyphs">${esc(marcador)}</text>
  <text x="600" y="590" text-anchor="middle" font-family="Inter, sans-serif" font-size="26" fill="#C7D6EC">${esc(sub)}</text>
  ${marca(80, 620)}
</svg>
`;
}

const partido = {
  kicker: 'CRÓNICA',
  marcador: '2-1',
  sub: 'Fecha 3 · Atanasio Girardot',
  a: await club('Atletico Nacional'),
  b: await club('Junior')
};

const variantes = [
  ['a-diagonal-de-color.svg', variantePrimera],
  ['b-escudos-al-sangre.svg', varianteSegunda],
  ['c-impacto-tipografico.svg', varianteTercera]
];

for (const [archivo, fn] of variantes) {
  await writeFile(`${OUT}/${archivo}`, fn(partido), 'utf8');
  console.log(`  ok ${OUT}/${archivo}`);
}
console.log(`\nColores tomados del escudo — ${partido.a.nombre}: ${partido.a.color} · ${partido.b.nombre}: ${partido.b.color}`);

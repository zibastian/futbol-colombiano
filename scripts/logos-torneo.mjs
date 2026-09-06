// Prepara los logos de torneo: quita el fondo blanco EXTERIOR y lo deja
// transparente, conservando el blanco que forma parte del logo (el interior
// del escudo, los contornos, etc.).
//
//   1. npm run logos      (baja lo que falte de API-Football y limpia el fondo)
//   2. npm run portadas
//
// Los logos de la Liga, el Torneo y la Copa BetPlay se guardaron a mano en
// `originales/`. Eso no escala: cada competición nueva quedaba sin imagen hasta
// que alguien se acordara de buscar el PNG. API-Football ya devuelve el logo de
// cada competición en /leagues, y es la misma fuente de la que salen los
// escudos de los clubes, así que ahora se baja solo.
//
// Si preferís una imagen propia para alguna, guardala en
// `public/torneos/originales/{slug}.png` y el script no la pisa.
//
// Cómo funciona: en vez de borrar todos los píxeles blancos, hace un "relleno por
// inundación" desde los bordes hacia adentro. Solo se vuelve transparente el blanco
// que está conectado con el borde de la imagen: el blanco encerrado por el logo
// (dentro del escudo) queda intacto.
//
// Los logos de torneo son marcas registradas: uso editorial para identificar la
// competición. Ver docs/imagenes.md

import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { TORNEOS } from '../src/data/torneos.ts';
import sharp from 'sharp';

const ENTRADA = 'public/torneos/originales';
const SALIDA = 'public/torneos';
const UMBRAL = Number(process.env.UMBRAL || 236); // qué tan claro cuenta como fondo

await mkdir(ENTRADA, { recursive: true });

const existentes = async () => {
  try {
    return (await readdir(ENTRADA)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
  } catch {
    return [];
  }
};

// --- Bajar de API-Football lo que falte ------------------------------------
// Una llamada por competición que no tenga logo, y solo la primera vez.
const KEY = process.env.API_FOOTBALL_KEY;
const yaEstan = new Set((await existentes()).map((f) => f.replace(/\.[^.]+$/, '')));
const faltan = TORNEOS.filter((t) => !yaEstan.has(t.slug));

if (faltan.length && !KEY) {
  console.log(`Faltan logos (${faltan.map((t) => t.slug).join(', ')}) y no hay API_FOOTBALL_KEY.`);
  console.log('Poné la clave en el entorno, o guardá el PNG a mano en', ENTRADA);
} else {
  for (const t of faltan) {
    try {
      const res = await fetch(`https://v3.football.api-sports.io/leagues?id=${t.ligaId}`, {
        headers: { 'x-apisports-key': KEY }
      });
      const json = await res.json();
      const url = json.response?.[0]?.league?.logo;
      if (!url) throw new Error('la API no devolvió logo');
      const img = await fetch(url);
      await writeFile(`${ENTRADA}/${t.slug}.png`, Buffer.from(await img.arrayBuffer()));
      console.log(`  bajado ${t.slug} (liga ${t.ligaId})`);
    } catch (e) {
      console.warn(`  FALLO ${t.slug}: ${e.message}`);
    }
  }
}

const archivos = await existentes();
if (!archivos.length) {
  console.log(`Sin imágenes en ${ENTRADA}/`);
  console.log('Guardá ahí el logo (ej: liga-betplay.png) y volvé a correr: npm run logos');
  process.exit(0);
}

for (const archivo of archivos) {
  const slug = archivo.replace(/\.[^.]+$/, '');

  const { data, info } = await sharp(`${ENTRADA}/${archivo}`)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h } = info;
  const esFondo = (i) => {
    const p = i * 4;
    return data[p] >= UMBRAL && data[p + 1] >= UMBRAL && data[p + 2] >= UMBRAL;
  };

  // Relleno por inundación desde los cuatro bordes
  const visitado = new Uint8Array(w * h);
  const pila = [];
  for (let x = 0; x < w; x++) {
    pila.push(x, (h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    pila.push(y * w, y * w + (w - 1));
  }

  let borrados = 0;
  while (pila.length) {
    const i = pila.pop();
    if (i < 0 || i >= w * h || visitado[i]) continue;
    visitado[i] = 1;
    if (!esFondo(i)) continue; // el logo corta la inundación

    data[i * 4 + 3] = 0;
    borrados++;

    const x = i % w;
    const y = (i - x) / w;
    if (x > 0) pila.push(i - 1);
    if (x < w - 1) pila.push(i + 1);
    if (y > 0) pila.push(i - w);
    if (y < h - 1) pila.push(i + w);
  }

  const png = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toBuffer();

  await sharp(png)
    .trim()
    .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(`${SALIDA}/${slug}.png`);

  const pct = Math.round((borrados / (w * h)) * 100);
  console.log(`✓ ${slug}.png — ${pct}% de fondo exterior eliminado (el blanco interno se conserva)`);
}

console.log('\nListo. Ahora: npm run portadas');
console.log('Si quedó fondo sin quitar, probá con más tolerancia: UMBRAL=225 npm run logos');

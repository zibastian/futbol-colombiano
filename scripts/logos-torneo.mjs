// Prepara los logos de torneo: quita el fondo blanco EXTERIOR y lo deja
// transparente, conservando el blanco que forma parte del logo (el interior
// del escudo, los contornos, etc.).
//
//   1. Guardar la imagen original en public/torneos/originales/{slug}.png (o .jpg)
//   2. npm run logos
//   3. npm run portadas
//
// Cómo funciona: en vez de borrar todos los píxeles blancos, hace un "relleno por
// inundación" desde los bordes hacia adentro. Solo se vuelve transparente el blanco
// que está conectado con el borde de la imagen: el blanco encerrado por el logo
// (dentro del escudo) queda intacto.
//
// Los logos de torneo son marcas registradas: uso editorial para identificar la
// competición. Ver docs/imagenes.md

import { readdir, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const ENTRADA = 'public/torneos/originales';
const SALIDA = 'public/torneos';
const UMBRAL = Number(process.env.UMBRAL || 236); // qué tan claro cuenta como fondo

await mkdir(ENTRADA, { recursive: true });

let archivos = [];
try {
  archivos = (await readdir(ENTRADA)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
} catch {}

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

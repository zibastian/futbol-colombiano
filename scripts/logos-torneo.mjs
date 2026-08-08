// Prepara los logos de torneo: recorta el fondo blanco y lo deja transparente,
// para que se vean bien sobre los fondos oscuros de los banners.
//
//   1. Guardar la imagen original en public/torneos/originales/{slug}.png (o .jpg)
//   2. npm run logos
//   3. npm run portadas
//
// Los logos de torneo son marcas registradas: se usan solo para identificar la
// competición en contexto informativo. Ver docs/imagenes.md

import { readdir, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const ENTRADA = 'public/torneos/originales';
const SALIDA = 'public/torneos';
const UMBRAL = 238; // qué tan claro debe ser un pixel para considerarlo fondo

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
  const entrada = `${ENTRADA}/${archivo}`;

  // 1. Pasar a RGBA y trabajar sobre los pixeles crudos
  const { data, info } = await sharp(entrada)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let transparentados = 0;
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    if (r >= UMBRAL && g >= UMBRAL && b >= UMBRAL) {
      data[i + 3] = 0; // fondo blanco -> transparente
      transparentados++;
    }
  }

  // 2. Recomponer, recortar el sobrante transparente y normalizar tamaño
  const png = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  })
    .png()
    .toBuffer();

  await sharp(png)
    .trim()
    .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(`${SALIDA}/${slug}.png`);

  const pct = Math.round((transparentados / (info.width * info.height)) * 100);
  console.log(`✓ ${slug}.png — ${pct}% del área quedó transparente`);
}

console.log(`\nListo. Ahora: npm run portadas (los banners tomarán el logo automáticamente).`);

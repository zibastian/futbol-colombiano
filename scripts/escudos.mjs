// Descarga y normalización de escudos desde API-Football.
// Uso:  npm run escudos          (solo los que faltan)
//       FORZAR=1 npm run escudos (vuelve a bajar todos)
//
// LA FUENTE ES equipos.ts, NO LA API
// Antes este script pedía "los equipos de la liga 239 en la temporada 2024" y
// bajaba lo que viniera. El problema es que la API cambia de identidad a un
// club y el script ni se entera: Independiente Yumbo pasó a tener el id 27411
// y acá se seguía bajando el escudo del Atlético Huila (1130), la ficha de la
// que nació. El club quedaba sin escudo y sin enlace, en silencio.
//
// Ahora se recorre nuestra propia base de clubes y se pide cada escudo por su
// apiId. Si un club de equipos.ts no tiene escudo, se ve en la salida.
//
// Salida: public/escudos/{apiId}.png (256x256) y public/escudos/64/{apiId}.png
// Todos centrados en lienzo cuadrado transparente => nunca se descuadran.

import { mkdir, writeFile, access } from 'node:fs/promises';
import sharp from 'sharp';
import { EQUIPOS } from '../src/data/equipos.ts';

const KEY = process.env.API_FOOTBALL_KEY;
if (!KEY) {
  console.error('Falta API_FOOTBALL_KEY. Uso: API_FOOTBALL_KEY=xxxx npm run escudos');
  process.exit(1);
}

const OUT = 'public/escudos';
const FORZAR = process.env.FORZAR === '1';

const existe = async (ruta) => {
  try { await access(ruta); return true; } catch { return false; }
};

async function api(path) {
  const res = await fetch(`https://v3.football.api-sports.io/${path}`, {
    headers: { 'x-apisports-key': KEY }
  });
  if (!res.ok) throw new Error(`API ${res.status} en ${path}`);
  const json = await res.json();
  if (json.errors && Object.keys(json.errors).length) {
    throw new Error(`API error: ${JSON.stringify(json.errors)}`);
  }
  return json.response;
}

async function normalizar(buffer) {
  // 1. Recortar transparencia sobrante  2. Encajar en 256x256 centrado
  const recortado = await sharp(buffer).trim().toBuffer();
  const grande = await sharp(recortado)
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const chico = await sharp(grande).resize(64, 64).png().toBuffer();
  return { grande, chico };
}

await mkdir(`${OUT}/64`, { recursive: true });
await mkdir('src/data', { recursive: true });

const manifiesto = [];
let bajados = 0, saltados = 0;
const sinApiId = [];
const fallidos = [];

for (const equipo of EQUIPOS) {
  if (!equipo.apiId) { sinApiId.push(equipo.nombre); continue; }
  manifiesto.push({
    id: equipo.apiId, nombre: equipo.nombre, slug: equipo.slug, division: equipo.division
  });

  const destino = `${OUT}/${equipo.apiId}.png`;
  if (!FORZAR && (await existe(destino)) && (await existe(`${OUT}/64/${equipo.apiId}.png`))) {
    saltados++;
    continue;
  }
  try {
    const [info] = await api(`teams?id=${equipo.apiId}`);
    if (!info?.team?.logo) throw new Error('la API no devolvió escudo');
    const res = await fetch(info.team.logo);
    const { grande, chico } = await normalizar(Buffer.from(await res.arrayBuffer()));
    await writeFile(destino, grande);
    await writeFile(`${OUT}/64/${equipo.apiId}.png`, chico);
    console.log(`  OK  ${equipo.nombre} (id ${equipo.apiId}) — la API lo llama "${info.team.name}"`);
    bajados++;
  } catch (e) {
    fallidos.push(`${equipo.nombre} (id ${equipo.apiId}): ${e.message}`);
  }
}

manifiesto.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
await writeFile('src/data/escudos.json', JSON.stringify(manifiesto, null, 2));

console.log(`\nEscudos: ${bajados} bajados, ${saltados} ya estaban.`);
console.log(`Manifiesto: src/data/escudos.json (${manifiesto.length} clubes)`);
if (sinApiId.length) {
  console.log(`\nSIN apiId en equipos.ts (nunca van a tener escudo):`);
  for (const n of sinApiId) console.log(`  - ${n}`);
}
if (fallidos.length) {
  console.log(`\nFALLARON:`);
  for (const f of fallidos) console.log(`  - ${f}`);
  console.log('  Revisá que el apiId sea el que usa la API HOY: un club puede');
  console.log('  cambiar de identidad (fusión, traslado, cambio de nombre).');
}

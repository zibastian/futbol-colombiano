// Descarga y normalización de escudos de Primera A y B desde API-Football.
// Uso:  API_FOOTBALL_KEY=xxxx npm run escudos
// Ejecutar UNA VEZ (y al inicio de cada temporada si hay ascensos/descensos).
// Consume ~4 requests de la cuota diaria (2 ligas x 1 página, + reintentos).
//
// Salida: public/escudos/{teamId}.png (256x256) y public/escudos/64/{teamId}.png
// Todos centrados en lienzo cuadrado transparente => nunca se descuadran.

import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const KEY = process.env.API_FOOTBALL_KEY;
if (!KEY) {
  console.error('Falta API_FOOTBALL_KEY. Uso: API_FOOTBALL_KEY=xxxx npm run escudos');
  process.exit(1);
}

// IDs de liga en API-Football: 239 = Primera A, 240 = Primera B (Colombia)
const LIGAS = [239, 240];
// Los escudos no cambian de una temporada a otra, así que usamos una temporada
// accesible con el plan Free (que bloquea la actual: "try from 2022 to 2024").
// Con plan Pro: SEASON=2026 npm run escudos
const SEASON = process.env.SEASON || '2024';
const OUT = 'public/escudos';

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
let total = 0;
const manifiesto = [];

const aSlug = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

for (const liga of LIGAS) {
  console.log(`Liga ${liga}, temporada ${SEASON}...`);
  let equipos = [];
  try {
    equipos = await api(`teams?league=${liga}&season=${SEASON}`);
  } catch (e) {
    console.error(`  No se pudo consultar la liga ${liga}: ${e.message}`);
    console.error('  Si el error es del plan, probar: SEASON=2024 npm run escudos');
    continue;
  }
  for (const { team } of equipos) {
    try {
      const res = await fetch(team.logo);
      const buffer = Buffer.from(await res.arrayBuffer());
      const { grande, chico } = await normalizar(buffer);
      await writeFile(`${OUT}/${team.id}.png`, grande);
      await writeFile(`${OUT}/64/${team.id}.png`, chico);
      manifiesto.push({ id: team.id, nombre: team.name, slug: aSlug(team.name), liga });
      console.log(`  OK ${team.name} (id ${team.id})`);
      total++;
    } catch (e) {
      console.warn(`  FALLO ${team.name}: ${e.message} — respaldo: buscar en TheSportsDB`);
    }
  }
}

// El manifiesto permite generar las fichas de equipo sin depender de la API
// en cada build (nombre, slug y ruta del escudo por ID).
manifiesto.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
await writeFile('src/data/escudos.json', JSON.stringify(manifiesto, null, 2));
console.log(`Listo: ${total} escudos normalizados en ${OUT}/`);
console.log(`Manifiesto: src/data/escudos.json (${manifiesto.length} equipos)`);

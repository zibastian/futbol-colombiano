// Busca y descarga una imagen libre (Openverse + Wikimedia Commons) para usarla
// dentro de las notas: estadios, hinchada, ambiente, historia, actos oficiales.
//
//   npm run imagen -- "estadio el campin"            (busca y muestra opciones)
//   npm run imagen -- "estadio el campin" --guardar 2  (descarga la opción 2)
//
// Solo devuelve imágenes con licencia que permite uso comercial. Guarda el crédito
// en src/data/fotos-creditos.json y el archivo en public/fotos/{slug}.jpg
// El crédito se muestra al pie de la imagen en la nota (lo exige la licencia).

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const UA = 'FutbolColombiano/1.0 (portal de noticias)';
const OUT = 'public/fotos';
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

const args = process.argv.slice(2);
const consulta = args.filter((a) => !a.startsWith('--') && !/^\d+$/.test(a)).join(' ');
const guardarIdx = args.indexOf('--guardar');
const elegida = guardarIdx !== -1 ? Number(args[guardarIdx + 1] || 1) : null;

if (!consulta) {
  console.log('Uso: npm run imagen -- "estadio el campin" [--guardar 1]');
  process.exit(0);
}

const aSlug = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50);

/** Openverse: buscador oficial de Creative Commons (agrega Flickr, museos, etc.) */
async function buscarOpenverse(q) {
  const url = `https://api.openverse.org/v1/images/?${new URLSearchParams({
    q, license_type: 'commercial', page_size: '8', mature: 'false'
  })}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) {
      console.log(`  (Openverse respondió ${res.status})`);
      return [];
    }
    const json = await res.json();
    return (json.results || []).map((r) => ({
      origen: 'Openverse',
      titulo: r.title || q,
      url: r.url,
      autor: r.creator || 'Autor no identificado',
      licencia: `${(r.license || '').toUpperCase()} ${r.license_version || ''}`.trim(),
      licenciaUrl: r.license_url || '',
      fuente: r.foreign_landing_url || r.url
    }));
  } catch (e) {
    console.log(`  (Openverse: ${e.message})`);
    return [];
  }
}

/** Wikimedia Commons: complementa con material histórico y retratos */
async function buscarCommons(q) {
  const permitidas = /^(cc0|cc[- ]by([- ]sa)?|public domain|pd-)/i;
  const api = 'https://commons.wikimedia.org/w/api.php';
  const pedir = async (params) => {
    const res = await fetch(`${api}?${new URLSearchParams({ ...params, format: 'json', origin: '*' })}`,
      { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`Commons ${res.status}`);
    await esperar(700);
    return res.json();
  };
  try {
    const busqueda = await pedir({
      action: 'query', list: 'search', srsearch: `${q} filetype:bitmap`,
      srnamespace: '6', srlimit: '4'
    });
    const salida = [];
    for (const s of busqueda.query?.search || []) {
      const r = await pedir({
        action: 'query', prop: 'imageinfo', titles: s.title,
        iiprop: 'url|extmetadata', iiurlwidth: '1400'
      });
      const info = Object.values(r.query?.pages || {})[0]?.imageinfo?.[0];
      if (!info) continue;
      const m = info.extmetadata || {};
      const limpiar = (v) => (v?.value || '').replace(/<[^>]+>/g, '').trim();
      const licencia = limpiar(m.LicenseShortName);
      if (!permitidas.test(licencia)) continue;
      salida.push({
        origen: 'Wikimedia',
        titulo: s.title.replace('File:', ''),
        url: info.thumburl || info.url,
        autor: limpiar(m.Artist) || 'Autor no identificado',
        licencia,
        licenciaUrl: limpiar(m.LicenseUrl),
        fuente: info.descriptionurl
      });
    }
    return salida;
  } catch (e) {
    console.log(`  (Commons: ${e.message})`);
    return [];
  }
}

console.log(`Buscando "${consulta}" (solo licencias con uso comercial)...\n`);
const resultados = [...(await buscarOpenverse(consulta)), ...(await buscarCommons(consulta))];

if (!resultados.length) {
  console.log('Sin resultados utilizables. Probá con otras palabras o en inglés.');
  process.exit(0);
}

resultados.forEach((r, i) => {
  console.log(`${i + 1}. [${r.origen}] ${r.titulo.slice(0, 70)}`);
  console.log(`   ${r.autor} · ${r.licencia || 'licencia sin detallar'}`);
  console.log(`   ${r.fuente}\n`);
});

if (!elegida) {
  console.log(`Para descargar una: npm run imagen -- "${consulta}" --guardar 1`);
  process.exit(0);
}

const r = resultados[elegida - 1];
if (!r) {
  console.log(`No existe la opción ${elegida}.`);
  process.exit(1);
}

await mkdir(OUT, { recursive: true });
const slug = aSlug(consulta);
const res = await fetch(r.url, { headers: { 'User-Agent': UA } });
const buf = Buffer.from(await res.arrayBuffer());
await sharp(buf).resize(1200, 675, { fit: 'cover' }).jpeg({ quality: 82 }).toFile(`${OUT}/${slug}.jpg`);

let creditos = {};
try {
  creditos = JSON.parse(await readFile('src/data/fotos-creditos.json', 'utf8'));
} catch {}
creditos[`foto:${slug}`] = {
  autor: r.autor, licencia: r.licencia, licenciaUrl: r.licenciaUrl, fuente: r.fuente
};
await writeFile('src/data/fotos-creditos.json', JSON.stringify(creditos, null, 2));

console.log(`\n✓ Guardada en ${OUT}/${slug}.jpg`);
console.log(`  Crédito: ${r.autor} · ${r.licencia}`);
console.log(`\nEn la nota:  cover: "/fotos/${slug}.jpg"`);

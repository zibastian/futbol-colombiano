// Descarga fotos de jugadores desde Wikimedia Commons y guarda su atribución.
// Uso: npm run fotos
//
// Commons aloja fotos de futbolistas bajo licencias Creative Commons que permiten
// uso comercial. La condición es dar crédito al autor y nombrar la licencia:
// por eso el script guarda esos datos y la ficha los muestra al pie de la foto.
// Las imágenes con licencia "no comercial" o sin licencia clara se DESCARTAN.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'FutbolColombiano/1.0 (portal de noticias; contacto via GitHub)';
const OUT = 'public/jugadores';

// Licencias que permiten uso comercial (con atribución)
const PERMITIDAS = /^(cc0|cc[- ]by([- ]sa)?([- ][0-9.]+)?|public domain|pd-)/i;

async function api(params) {
  const url = `${API}?${new URLSearchParams({ ...params, format: 'json', origin: '*' })}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Commons ${res.status}`);
  return res.json();
}

async function buscarArchivo(consulta) {
  const r = await api({
    action: 'query', list: 'search', srsearch: `${consulta} filetype:bitmap`,
    srnamespace: '6', srlimit: '5'
  });
  return (r.query?.search || []).map((s) => s.title);
}

async function datosArchivo(titulo) {
  const r = await api({
    action: 'query', prop: 'imageinfo', titles: titulo,
    iiprop: 'url|extmetadata', iiurlwidth: '900'
  });
  const paginas = r.query?.pages || {};
  const info = Object.values(paginas)[0]?.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata || {};
  const limpiar = (v) => (v?.value || '').replace(/<[^>]+>/g, '').trim();
  return {
    url: info.thumburl || info.url,
    paginaDescripcion: info.descriptionurl,
    autor: limpiar(meta.Artist) || 'Autor no identificado',
    licencia: limpiar(meta.LicenseShortName) || limpiar(meta.License) || '',
    licenciaUrl: limpiar(meta.LicenseUrl) || ''
  };
}

const jugadores = JSON.parse(await readFile('scripts/jugadores-fotos.json', 'utf8'));
await mkdir(OUT, { recursive: true });
const creditos = {};

for (const j of jugadores) {
  console.log(`\n${j.nombre}`);
  let elegido = null;
  const candidatos = j.archivo ? [j.archivo] : await buscarArchivo(j.busqueda || j.nombre);

  for (const titulo of candidatos) {
    const d = await datosArchivo(titulo);
    if (!d) continue;
    if (!PERMITIDAS.test(d.licencia)) {
      console.log(`  ✗ ${titulo} — licencia no apta (${d.licencia || 'desconocida'})`);
      continue;
    }
    elegido = { titulo, ...d };
    break;
  }

  if (!elegido) {
    console.log('  sin foto con licencia utilizable');
    continue;
  }

  try {
    const res = await fetch(elegido.url, { headers: { 'User-Agent': UA } });
    const buf = Buffer.from(await res.arrayBuffer());
    // Retrato cuadrado, recortado hacia arriba (donde suele estar la cara)
    await sharp(buf)
      .resize(600, 600, { fit: 'cover', position: 'top' })
      .jpeg({ quality: 82 })
      .toFile(`${OUT}/${j.slug}.jpg`);
    creditos[j.slug] = {
      autor: elegido.autor,
      licencia: elegido.licencia,
      licenciaUrl: elegido.licenciaUrl,
      fuente: elegido.paginaDescripcion
    };
    console.log(`  ✓ ${elegido.titulo}`);
    console.log(`    ${elegido.autor} · ${elegido.licencia}`);
  } catch (e) {
    console.log(`  error al procesar: ${e.message}`);
  }
}

await writeFile('src/data/fotos-creditos.json', JSON.stringify(creditos, null, 2));
console.log(`\nListo: ${Object.keys(creditos).length} fotos en ${OUT}/`);
console.log('Créditos guardados en src/data/fotos-creditos.json (se muestran en cada ficha).');

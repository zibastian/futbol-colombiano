// Exporta la nómina de columnistas del sitio a JSON, para que la fábrica de
// agentes use exactamente las mismas voces que se publican en las fichas.
//
// Una sola fuente de verdad: src/data/columnistas.ts. Si la ficha dice que una
// firma se pelea con otra, el agente escribe sabiendo eso. Mantener las voces a
// mano en dos repos garantizaba que se desincronizaran.
//
// Uso: npm run columnistas:exportar
//      -> fc-plataforma/fabrica/config/columnistas.generado.json
//
// Si el repo de la plataforma no está al lado, escribe el archivo en el propio
// repo y avisa: se copia a mano y listo.

import { writeFile, mkdir, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const { COLUMNISTAS, EQUIPOS_GRANDES } = await import('../src/data/columnistas.ts');
const { EQUIPOS } = await import('../src/data/equipos.ts');

const nombreEquipo = (slug) => EQUIPOS.find((e) => e.slug === slug)?.nombre ?? null;

const salida = {
  _generado: 'No editar a mano. Sale de futbol-colombiano/src/data/columnistas.ts',
  _fecha: new Date().toISOString().slice(0, 10),
  // Diccionario canónico de clubes, con sus alias. La fábrica lo usa para
  // normalizar los nombres que devuelve el agente de SEO: si escribe "Atlético
  // Santa Fe" en vez de "Independiente Santa Fe", la nota queda sin escudo, sin
  // enlace a la ficha del club y sin columnista, en silencio.
  // Se exportan los datos completos, no solo el nombre: la fábrica se los pasa
  // al redactor como CONTEXTO VERIFICADO. Es la forma honesta de que una nota
  // sea más larga — con datos que salen de nuestra base, no de la memoria del
  // modelo, que es exactamente lo que le tenemos prohibido usar.
  equipos: EQUIPOS.map((e) => ({
    // El apiId va porque la fábrica necesita saber qué clubes son NUESTROS:
    // con eso decide de qué jugadores vale la pena pedir el nombre completo.
    slug: e.slug, apiId: e.apiId ?? null, nombre: e.nombre, alias: e.alias ?? [],
    apodo: e.apodo ?? null, ciudad: e.ciudad, estadio: e.estadio ?? null,
    fundacion: e.fundacion ?? null, division: e.division, descripcion: e.descripcion
  })),
  equiposGrandes: EQUIPOS_GRANDES.map((slug) => ({ slug, nombre: nombreEquipo(slug) })),
  columnistas: COLUMNISTAS.map((c) => ({
    slug: c.slug,
    nombre: c.nombre,
    perfil: c.perfil,
    linea: c.linea,
    // La biografía va en primera persona, así que sirve tal cual como
    // instrucción de voz para el agente: es literalmente cómo se presenta.
    voz: c.bio,
    temas: c.temas,
    equipo: c.equipo ?? null,
    equipoNombre: c.equipo ? nombreEquipo(c.equipo) : null,
    tonoAdaptativo: Boolean(c.tonoAdaptativo)
  }))
};

const destinos = [
  resolve('../fc-plataforma/fabrica/config/columnistas.generado.json'),
  resolve('src/data/columnistas.generado.json')
];

let escrito = null;
for (const destino of destinos) {
  try {
    await access(dirname(destino));
    await writeFile(destino, JSON.stringify(salida, null, 2) + '\n', 'utf8');
    escrito = destino;
    break;
  } catch {
    /* siguiente destino */
  }
}

if (!escrito) {
  await mkdir('src/data', { recursive: true });
  escrito = destinos[1];
  await writeFile(escrito, JSON.stringify(salida, null, 2) + '\n', 'utf8');
}

const porPerfil = salida.columnistas.reduce((acc, c) => {
  acc[c.perfil] = (acc[c.perfil] ?? 0) + 1;
  return acc;
}, {});
console.log(`${salida.columnistas.length} columnistas y ${salida.equipos.length} clubes exportados -> ${escrito}`);
console.log(`  ${Object.entries(porPerfil).map(([k, v]) => `${k}: ${v}`).join(' | ')}`);
if (!escrito.includes('fc-plataforma')) {
  console.log('  (fc-plataforma no está al lado: copiá el archivo a fabrica/config/)');
}

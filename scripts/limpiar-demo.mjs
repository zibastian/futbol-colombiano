// Borra las notas y portadas de ejemplo (las que llevan `demo: true`).
// Uso: npm run demo:limpiar
import { readdir, readFile, rm } from 'node:fs/promises';

const DIR = 'src/content/noticias';
let borradas = 0;

for (const archivo of await readdir(DIR)) {
  if (!archivo.endsWith('.md')) continue;
  const contenido = await readFile(`${DIR}/${archivo}`, 'utf8');
  if (/^demo:\s*true\s*$/m.test(contenido)) {
    await rm(`${DIR}/${archivo}`);
    console.log(`  borrada ${archivo}`);
    borradas++;
  }
}

await rm('public/demo', { recursive: true, force: true });
console.log(`Listo: ${borradas} notas de ejemplo y las portadas de /demo eliminadas.`);

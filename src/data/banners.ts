// Qué secciones tienen banner generado.
//
// POR QUÉ EXISTE
// Los banners se generan con `npm run portadas` desde una lista escrita a mano.
// Al agregar Libertadores y Sudamericana como secciones, la página salió con la
// imagen rota: el <img> apuntaba a un archivo que nadie había generado.
//
// Un banner que falta no debería ensuciar la página. Acá se mira qué hay de
// verdad en disco y la sección decide: si tiene banner lo muestra, y si no,
// muestra su título en texto, que es lo que el banner reemplazaba.
//
// Se lee en tiempo de BUILD, no en el navegador: el sitio sigue siendo estático.

import { readdirSync } from 'node:fs';

let archivos = new Set<string>();
try {
  archivos = new Set(readdirSync('public/banners'));
} catch {
  // Sin carpeta de banners el sitio funciona igual, solo con títulos en texto.
}

export const tieneBanner = (slug: string) => archivos.has(`${slug}.svg`);

/** Secciones sin banner, para avisarlo en la consola del build. */
export function avisarBannersFaltantes(slugs: string[]): void {
  const faltan = slugs.filter((s) => !tieneBanner(s));
  if (!faltan.length) return;
  console.warn(
    `\n[banners] Sin imagen de portada: ${faltan.join(', ')}.\n` +
      '  Se muestra el título en texto. Para generarlos:\n' +
      '    npm run portadas   (agregá la sección a la lista en scripts/portadas.mjs)\n'
  );
}

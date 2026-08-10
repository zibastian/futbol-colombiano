// Node exige la extensión en los imports; Astro y Vite no. Los archivos de
// src/data/ se importan como './equipos', así que para poder correrlos con
// node (scripts fuera del build) hace falta completar la extensión .ts.
export function resolve(especificador, contexto, siguiente) {
  if (especificador.startsWith('.') && !/\.[cm]?[jt]sx?$|\.json$/.test(especificador)) {
    return siguiente(`${especificador}.ts`, contexto);
  }
  return siguiente(especificador, contexto);
}

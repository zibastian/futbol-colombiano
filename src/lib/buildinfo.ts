// Información del build, visible en el pie del sitio.
// Sirve para confirmar de un vistazo qué versión está publicada.
import pkg from '../../package.json';

const env = (typeof process !== 'undefined' ? process.env : {}) as Record<string, string | undefined>;

const commit =
  env.WORKERS_CI_COMMIT_SHA ||
  env.CF_PAGES_COMMIT_SHA ||
  env.GITHUB_SHA ||
  '';

export const BUILD = {
  version: pkg.version as string,
  commit: commit ? commit.slice(0, 7) : 'local',
  fecha: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
  // Señal útil: si no hay key, las tablas y fichas no se generan.
  datos: env.API_FOOTBALL_KEY ? 'API ok' : 'sin API'
};

// Torneos con página dedicada (ficha con tabla de posiciones).
// El id es el de la liga en API-Football; season se ajusta cada año.
//
// IMPORTANTE: el plan Free de API-Football NO da acceso a la temporada actual
// (solo 2022-2024). Con Free las tablas salen vacías. Para ver el diseño con
// datos reales sin pagar, correr en local:
//    SEASON_OVERRIDE=2024 npm run dev
// (no se usa en producción: el sitio publicado nunca muestra datos viejos).
const SEASON =
  Number((typeof process !== 'undefined' ? process.env.SEASON_OVERRIDE : '') || 0) || 2026;

export const TORNEOS = [
  { slug: 'liga-betplay', nombre: 'Liga BetPlay', ligaId: 239, season: SEASON },
  { slug: 'torneo-betplay', nombre: 'Torneo BetPlay', ligaId: 240, season: SEASON },
  { slug: 'copa-betplay', nombre: 'Copa BetPlay', ligaId: 241, season: SEASON },
  // En estas juegan decenas de clubes extranjeros que no están en equipos.ts.
  // La tabla igual funciona: el escudo sale del que manda la API y el nombre
  // queda como ella lo escribe.
  { slug: 'copa-libertadores', nombre: 'Copa Libertadores', ligaId: 13, season: SEASON },
  { slug: 'copa-sudamericana', nombre: 'Copa Sudamericana', ligaId: 11, season: SEASON }
];

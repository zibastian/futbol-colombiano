// Diagnóstico de API-Football: qué devuelve realmente para nuestras ligas.
// Uso:  API_FOOTBALL_KEY=xxxx node scripts/diagnostico-api.mjs
// Consume ~4 requests de la cuota diaria.

const KEY = process.env.API_FOOTBALL_KEY;
if (!KEY) {
  console.error('Falta API_FOOTBALL_KEY');
  process.exit(1);
}

const BASE = 'https://v3.football.api-sports.io';

async function api(path) {
  const res = await fetch(`${BASE}${path}`, { headers: { 'x-apisports-key': KEY } });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, errors: json.errors, results: json.results, response: json.response || [] };
}

console.log('1) Estado de la cuenta');
const st = await api('/status');
const s = st.response;
if (s?.subscription) {
  console.log(`   plan: ${s.subscription.plan} | activo: ${s.subscription.active}`);
  console.log(`   requests hoy: ${s.requests.current}/${s.requests.limit_day}`);
} else {
  console.log('   respuesta:', JSON.stringify(st).slice(0, 300));
}

for (const [id, nombre] of [[239, 'Primera A'], [240, 'Primera B']]) {
  console.log(`\n2) Liga ${id} (${nombre}) — temporadas disponibles`);
  const lg = await api(`/leagues?id=${id}`);
  if (lg.errors && Object.keys(lg.errors).length) console.log('   errores:', lg.errors);
  const info = lg.response[0];
  if (!info) {
    console.log('   sin datos de la liga');
    continue;
  }
  const temporadas = info.seasons || [];
  const conTabla = temporadas.filter((t) => t.coverage?.standings).map((t) => t.year);
  console.log(`   nombre en la API: ${info.league?.name} (${info.country?.name})`);
  console.log(`   temporadas: ${temporadas.map((t) => t.year).join(', ')}`);
  console.log(`   con tabla de posiciones: ${conTabla.join(', ') || 'ninguna'}`);
  const actual = temporadas.find((t) => t.current)?.year || conTabla.at(-1);
  if (actual) {
    const tb = await api(`/standings?league=${id}&season=${actual}`);
    const filas = tb.response[0]?.league?.standings?.flat() || [];
    console.log(`   /standings season=${actual} -> ${filas.length} equipos`);
    if (tb.errors && Object.keys(tb.errors).length) console.log('   errores:', tb.errors);
    if (filas[0]) console.log(`   ejemplo: ${filas[0].rank}. ${filas[0].team.name} (${filas[0].points} pts)`);
  }
}
console.log('\nSi "con tabla" no incluye 2026, hay que ajustar season en src/data/torneos.ts');

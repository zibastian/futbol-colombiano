# FútbolColombiano.com.co — Plantilla etapa 0

Sitio 100% estático (Astro) con cimientos SEO de serie, panel editorial (Sveltia CMS)
y deploy automático a Cloudflare Pages. Base de la plataforma multi-proyecto.

## Qué incluye

- **Astro 5** con colección de noticias tipada (`src/content.config.ts`) — el esquema exacto que usará la fábrica de agentes.
- **SEO de serie**: JSON-LD (`Organization`, `WebSite`, `NewsArticle` con `datePublished`/`dateModified`, `BreadcrumbList`), Open Graph, canonical, sitemap XML, **sitemap de Google News** (últimas 48 h), RSS, robots.txt, fechas de creación y actualización visibles en cada nota.
- **Hubs por tag** (fase 1.5): equipos, torneos y jugadores mencionados en el frontmatter generan páginas hub automáticamente (`/tags/...`).
- **Panel editorial** en repo aparte ([futbol-colombiano-admin](https://github.com/zibastian/futbol-colombiano-admin)): Sveltia CMS escribiendo sobre este repo, con flujo Borradores → En revisión → Listo (el gate humano).
- **Script de escudos** (`npm run escudos`): descarga los escudos de Primera A y B desde API-Football y los normaliza a 256×256 + 64×64 centrados.
- **Deploy automático**: Cloudflare construye y publica con cada push a `main` (config en `wrangler.jsonc`).
- **Nómina de columnistas** (`npm run columnistas:exportar`): exporta las 47 firmas a la fábrica de agentes, para que la voz que usa el agente sea la misma que se publica en la ficha.
- `docs/investigacion.md`: toda la investigación del proyecto, versionada en Git.

## Puesta en marcha (checklist etapa 0)

### 1. Repo
```bash
cd futbol-colombiano
git init && git add -A && git commit -m "Etapa 0: plantilla base"
# Crear repo en GitHub (público = minutos ilimitados de Actions) y hacer push
```

### 2. Prueba local (opcional, requiere Node 20+)
```bash
npm install
npm run dev        # http://localhost:4321
```

### 3. Cloudflare (Workers con assets estáticos)
Cloudflare fusionó Pages dentro de Workers: los proyectos nuevos se crean en
Workers & Pages y el dominio queda como `*.workers.dev`. Mismo plan gratuito,
mismo ancho de banda ilimitado.

**Cloudflare construye directo desde el repo** (no hace falta GitHub Actions ni
API tokens). Por eso las variables del build se cargan EN CLOUDFLARE:

Workers & Pages → `futbol-colombiano` → Settings → **Build → Variables and Secrets**:

| Variable | Valor | Para qué |
|---|---|---|
| `API_FOOTBALL_KEY` | tu key de api-football.com | tablas de posiciones y fichas de equipo |
| `SITE_URL` | `https://futbolcolombiano.net` | canonical, sitemaps y RSS |
| `CF_ANALYTICS_TOKEN` | token de Cloudflare Web Analytics | métricas de audiencia (opcional) |

> Sin `API_FOOTBALL_KEY` el build no genera las fichas de equipo y las tablas
> muestran "disponible próximamente".

`wrangler.jsonc` fija el despliegue como **assets estáticos**. No lo borres: sin
él, el autoconfig de Cloudflare instala el adaptador de Astro y convierte el
sitio a modo servidor (mode: "server"), que es justo lo que este proyecto evita.

### 4. Dominio
Dominio en uso: **futbolcolombiano.net** (ya comprado). Conectarlo en el proyecto →
Custom domains y dejar `SITE_URL` apuntando ahí. `robots.txt`, canonical y sitemaps
se generan solos desde `src/config.ts`.

> Si más adelante se libera `futbolcolombiano.com.co`, se cambia `src/config.ts` y se
> deja una redirección 301 desde el `.net`: así la autoridad SEO acumulada se traslada
> en vez de perderse.

### 4b. Métricas de audiencia (Cloudflare Web Analytics)
Cloudflare → **Analytics & Logs → Web Analytics → Add a site**.

Si el sitio queda en **Automatic setup** (el dominio pasa por el proxy de Cloudflare),
no hay token ni snippet que copiar: Cloudflare inyecta el beacon en el borde. No hay
nada que hacer en el código y la variable `CF_ANALYTICS_TOKEN` se deja sin definir.

El token solo existe en el modo **manual**, que se usa cuando el sitio no pasa por el
proxy de Cloudflare. En ese caso se carga como variable de build `CF_ANALYTICS_TOKEN` y
el layout inyecta el beacon.

No usa cookies, así que no requiere banner de consentimiento.

### 5. Panel editorial
Vive en su propio repo: **[futbol-colombiano-admin](https://github.com/zibastian/futbol-colombiano-admin)**,
desplegado aparte en Cloudflare. Escribe sobre este repo vía la API de GitHub,
así que el contenido sigue versionado acá. Las instrucciones de puesta en marcha
están en el README de ese repo.

> Se separó a propósito: tocar el panel no redespliega el sitio, y publicar una
> nota no toca el panel.


### 6. Escudos
```bash
API_FOOTBALL_KEY=tu_key npm run escudos   # cuenta gratis en api-football.com
git add public/escudos && git commit -m "Escudos Primera A y B" && git push
```

### 7. Analítica
- Activar Cloudflare Web Analytics (dashboard → Analytics → Web Analytics) y pegar el snippet en `src/layouts/Base.astro` (antes de `</head>`).

## Lo que sigue (fuera de la etapa 0)

- AdSense: solicitar cuando haya ~20-30 notas publicadas y dominio propio.
- Fábrica de agentes (orquestador → redactor → editor → diagramador → SEO → publicador).
- Monitor de primicias (X API, Lista de periodistas) + bot de Telegram para aprobar desde el teléfono.
- Fichas de equipo/torneo enriquecidas con datos de API en cada build (activar el cron del workflow).

## Estructura

```
src/
  config.ts               # Marca y URLs (cambiar por proyecto)
  content.config.ts       # Esquema de las notas (contrato con la fábrica)
  content/noticias/       # Las notas (.md) — el CMS del sitio es este folder
  layouts/Base.astro      # Head SEO + header/footer
  pages/                  # Portada, nota, tags, RSS, news-sitemap
public/
  admin/                  # Sveltia CMS
  escudos/                # Generados por npm run escudos
scripts/escudos.mjs       # Descarga y normalización de escudos
docs/investigacion.md     # Investigación del proyecto (versionada)
.github/workflows/        # Build + deploy
```

# FútbolColombiano.com.co — Plantilla etapa 0

Sitio 100% estático (Astro) con cimientos SEO de serie, panel editorial (Sveltia CMS)
y deploy automático a Cloudflare Pages. Base de la plataforma multi-proyecto.

## Qué incluye

- **Astro 5** con colección de noticias tipada (`src/content.config.ts`) — el esquema exacto que usará la fábrica de agentes.
- **SEO de serie**: JSON-LD (`Organization`, `WebSite`, `NewsArticle` con `datePublished`/`dateModified`, `BreadcrumbList`), Open Graph, canonical, sitemap XML, **sitemap de Google News** (últimas 48 h), RSS, robots.txt, fechas de creación y actualización visibles en cada nota.
- **Hubs por tag** (fase 1.5): equipos, torneos y jugadores mencionados en el frontmatter generan páginas hub automáticamente (`/tags/...`).
- **Sveltia CMS** en `/admin`: flujo editorial Borradores → En revisión → Listo (el gate humano).
- **Script de escudos** (`npm run escudos`): descarga los escudos de Primera A y B desde API-Football y los normaliza a 256×256 + 64×64 centrados.
- **Workflow de deploy** (GitHub Actions → Cloudflare Pages) con cron preparado para fase 1.5.
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

### 3. Cloudflare Pages
1. Crear cuenta en Cloudflare (gratis).
2. Crear el proyecto: Workers & Pages → Create → Pages → nombre `futbol-colombiano`.
3. Crear un API Token (perfil → API Tokens → plantilla "Edit Cloudflare Workers"/Pages) y copiar el Account ID (dashboard, barra lateral).
4. En GitHub → Settings → Secrets and variables → Actions:
   - Secret `CLOUDFLARE_API_TOKEN`
   - Secret `CLOUDFLARE_ACCOUNT_ID`
   - Variable `SITE_URL` = `https://futbol-colombiano.pages.dev` (cambiar al conectar dominio)
5. Push a `main` → el workflow construye y despliega. El sitio queda en `https://futbol-colombiano.pages.dev`.

### 4. Dominio (cuando esté confirmado)
- Verificar disponibilidad/recuperación de `futbolcolombiano.com.co`.
- Conectarlo en Pages → Custom domains; actualizar `SITE_URL` (variable de Actions), `src/config.ts` y `public/robots.txt`.

### 5. Panel editorial (Sveltia)
1. Editar `public/admin/config.yml`: cambiar `OWNER/REPO` por tu repo.
2. Autenticación: desplegar [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) (un Worker de Cloudflare, gratis, ~10 min siguiendo su README), crear la GitHub OAuth App que pide, y poner la URL del worker en `base_url`.
3. Entrar a `https://tu-sitio/admin` con tu cuenta de GitHub.

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

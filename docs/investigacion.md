# Investigación — Portal de Fútbol Colombiano

Repositorio de hallazgos con fuentes. Versionado en Git: cada actualización es un commit.
Última actualización: 2 de agosto de 2026 (migrado desde Google Docs v3).

## 1. Redes de anuncios (display)
AdSense: sin mínimo; RPM Colombia ~USD $0,5-2. Ezoic: sin mínimo (Access Now), 2-4x AdSense. Monumetric: desde 10k páginas vistas/mes. Raptive: mínimo bajado a ~25k visitas/mes (oct 2025). Mediavine: por ingresos (~$5.000/año), tiene on-ramp. Fuentes: ppc.land, bloggingexplorer.com, xpay.sh.

## 2. Afiliación de apuestas (Colombia)
~14 operadores licenciados Coljuegos (BetPlay, Wplay, Rushbet, Betsson, Codere, etc.). Stake no confirmado — verificar lista oficial antes de firmar. CPA $30-100/FTD, revshare 20-40% (negative carryover), híbrido; CPA +20-30% en picos. Embudo: 2-4% CTR → 1-3% FTD. +18, juego responsable, DIAN. Fuentes: legalbet.co, track360.io.

## 3. Google y contenido IA
No penaliza IA per se; penaliza baja calidad a escala (E-E-A-T). Updates golpean contenido delgado, titulares exagerados, refritos. SEO técnico: JSON-LD (NewsArticle con datePublished/dateModified, SportsEvent, SportsTeam, BreadcrumbList, Organization), sitemap Google News, Core Web Vitals, fechas visibles de creación y actualización. Fuentes: rankability.com, koanthic.com.

## 4. Cloudflare Pages
Free: ancho de banda ilimitado, comercial permitido, proyectos ilimitados, CDN, SSL, Analytics, Email Routing. Límites: 500 builds/mes, 25 MB/archivo, 20k archivos. Sin lock-in. AWS cobra ~$0.085/GB — caro con tráfico. Fuentes: developers.cloudflare.com/pages.

## 5. X API — DECISIÓN TOMADA
Pay-per-use desde feb 2026, sin capa gratuita: ~$0.005/post leído, $0.015/post creado. Decisión: se paga con estrategia de Lista (15-20 periodistas en una Lista de X, polling cada 2-3 min) ≈ $10-15/mes. Scraping descartado: bloqueado, viola ToS, falla en silencio. Respaldo gratis: RSS Google News por periodista (lag 10-30 min). Flujo manual "nota rápida" como complemento. Fuentes: twitterapi.io, postproxy.dev.

## 6. API-Football — datos elegidos
Cobertura completa FPC (ligas 239/240) + Conmebol + ligas exterior + logos de equipos. Free: 100 req/día, 10/min; exceso → error 429 sin cobros, reinicio 00:00 UTC. Pro $19/mes (7.500/día), Mega $39 (150k). En vivo ~15 s. Builds condicionados a cambios: ~60-80 req/día en jornada, cabe en free. Fuentes: api-football.com.

## 7. Arquitectura decidida
Astro (Hugo plan B) + Cloudflare Pages + GitHub Actions (push + cron 15 min + demanda) + wrangler. CMS git-based Sveltia como gate. Fichas de equipo y torneos regeneradas por build desde API. Fábrica LangGraph: orquestador ingesta (dedupe embeddings + registro historias) → redactor → editor → diagramador → SEO → gate humano → publicador multi-red. Anti-refrito: cluster completo → pieza original con valor agregado; actualizar en vez de re-publicar. Futuro: juegos en vivo (islas + Workers) cuando el sitio madure.

## 8. Periodistas — conclusión
X es la red de la primicia del FPC: medios grandes (Infobae etc.) citan sistemáticamente los reportes en X de Pipe Sierra, Capera y colegas. IG/YouTube = alcance posterior, no primicia. Por eso el monitor pago es de X. Fuentes: infobae.com, pulzo.com, semana.com.

## 9. API de Anthropic (motor de la fábrica)
Prepago por créditos, cobro por token, sin mensualidad. Claude Pro ($20/mes) es chat/apps y NO incluye API — la fábrica necesita API key + créditos aparte. Precios/M tokens: Haiku 4.5 $1/$5 · Sonnet 5 $2/$10 · Opus 5 $5/$25. Batch −50%, prompt caching −90% input repetido. Mix: Haiku rutina, Sonnet editor/opinión. Costo por nota ~$0.03-0.06 → $10-25/mes a 10 notas/día. Velocidad: segundos por agente, 1-2 min la cadena; cuello de botella = gate humano. IMPORTANTE: Anthropic NO genera imágenes. Fuentes: benchlm.ai, finout.io, cloudzero.com.

## 10. Escudos (Primera A y B)
Descarga única desde API-Football (endpoint teams) — implementado en `scripts/escudos.mjs`. Normalización: recorte transparencia, centrado 256×256 + variante 64px, nombrados por ID de API. Uso editorial OK (práctica estándar de prensa, incluye piezas de redes tipo anuncio de partido); no merchandising; moderación con logo de la Liga (texto del torneo = misma función, menos riesgo). Respaldo: TheSportsDB.

## 11. Piezas gráficas — sistema definido
Vía principal: composición programática por plantilla (Sharp/Satori) — $0/pieza, estilo idéntico siempre. Plantillas por tipo: anuncio de partido, marcador final, alineaciones, fichaje (escudo→escudo + "según reporta X"), quote card (declaraciones), stat card (colombianos en el exterior). Vía secundaria: IA generativa solo para opinión/historia. Publicador multi-red: copy por plataforma (Haiku) + APIs X/Meta/Telegram.

## 12. Imagen de apoyo por tipo de nota (cobertura completa)
- Partido (previa/crónica/agenda): plantilla con escudos + datos.
- Fichaje/rumor: plantilla escudo origen → destino + sello del periodista (modelo Fabrizio Romano: marca, no foto).
- Declaraciones/rueda de prensa: quote card con la frase destacada.
- Colombianos en el exterior: stat card (club, bandera, minutos, goles, rating desde API).
- Opinión/columna e historia: ilustración IA editorial con estilo fijo (sin rostros reales ni marcas).
- Anuncios oficiales: embed del post del club (la "foto legal" gratis).
- Hueco restante: fotos de acción → embeds oficiales y, a futuro, fotógrafo local para el nicho.

## 13. WhatsApp Channels sin humano
Meta no ofrece API oficial para Channels (2026). Alternativa no oficial: Whapi.cloud y similares — REST API para los 7 tipos de post, ~$29-49/mes por número, sin aprobación Meta. Riesgo: ban del número → número dedicado exclusivo + volumen razonable (3-5 posts/día). Secuencia: Telegram bot automatizado (oficial, gratis) + WhatsApp manual 2 min/día; migrar a Whapi cuando las métricas muestren que WhatsApp domina. Fuentes: whapi.cloud.

## 14. APIs de generación de imágenes (por imagen, 2026)
GPT Image mini ~$0.005 · Imagen 4 Fast $0.02 / Standard $0.04 · GPT Image 1.5 $0.04 · Flux 2 Pro ~$0.02-0.055 · Ideogram v3 ~$0.07. Batch −50%. Uso: 2-3 ilustraciones/día (opinión/historia) ≈ $1-4/mes. Elección inicial: Imagen 4 Fast o GPT Image mini. Fuentes: buildmvpfast.com, costlayer.ai.

## 15. Costos consolidados fase 1
Dominio ~$1/mes · Créditos Anthropic $10-25 · X API $10-15 · API imágenes $0-5 · Hosting/analítica/newsletter $0 · TOTAL ~$25-45/mes. Editor freelance ($200-400/mes) desde mes 6-9 financiado con afiliación.

## 16. Marca y activos históricos
El sitio existió hace ~10 años como FutbolColombiano.com.co. Pendiente: verificar recuperación del dominio (la antigüedad y backlinks históricos son ventaja SEO) y de las cuentas de redes sociales originales (antigüedad suma).

## 17. CORRECCIÓN — API-Football plan Free no sirve para temporada actual
Verificado el 7/8/2026 con `npm run datos:test`:
- Plan Free: 100 req/día, pero **bloquea las temporadas recientes**. Mensaje literal de la API:
  "Free plans do not have access to this season, try from 2022 to 2024."
- Consecuencias: tablas de posiciones, fichas de equipo y crónicas con goles/eventos
  NO funcionan con el plan gratuito (devuelven 0 resultados sin error HTTP).
- Opciones: (a) plan Pro USD $19/mes (7.500 req/día, temporada actual);
  (b) posponer las secciones de datos y arrancar solo con noticias;
  (c) evaluar proveedores alternativos (Sportmonks cobra por liga; TheSportsDB
  gratuito no es confiable para tablas en vivo).
- Mientras tanto: `SEASON_OVERRIDE=2024 npm run dev` permite previsualizar el
  diseño con datos reales de 2024 en local, sin publicar datos viejos.
- Esto corrige el supuesto de los planes v5/v6 ("API-Football free suficiente al inicio").

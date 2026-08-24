# Roadmap — FútbolColombiano.net

Backlog vivo del proyecto. Existe para que las decisiones no vivan en el chat:
lo que está acá se puede retomar meses después sin releer una conversación.

Tres repos:

| Repo | Qué es | Visibilidad |
|---|---|---|
| `futbol-colombiano` | El sitio público (Astro estático en Cloudflare Workers) | público |
| `fc-plataforma` | La fábrica de contenido (agentes LangGraph) | privado |
| `admin-futbol-colombiano` | Panel Sveltia CMS para el gate humano | privado |

---

## Fase 1 — para salir a producción

### Módulos de redes sociales
Todavía no hay nada en el sitio que lleve a las redes ni que permita compartir
una nota. Falta: enlaces en el pie y el encabezado, botones de compartir en la
nota (WhatsApp pesa más que Twitter en Colombia), y las metaetiquetas Open Graph
verificadas con el validador de cada red.

### La fábrica debe generar la portada de cada nota
`publicar.py` nunca escribe el campo `cover`. Hoy las portadas se generan aparte
con `scripts/portadas.mjs`, así que una nota recién publicada sale sin imagen
propia. El generador ya existe y es determinístico; falta que la fábrica lo
invoque al publicar, con el título y el tipo de nota.

### Nombre del torneo visible y torneo anterior
La temporada colombiana tiene **dos torneos** —Apertura y Clausura— y el sitio ya
elige bien el vigente (ver "Dos torneos por año", abajo), pero no dice cuál está
mostrando. Falta el rótulo y un acceso al torneo anterior, que la gente sigue
consultando después de que termina.

---

## Fase 2 — después del lanzamiento

### Parrilla de TV y calendario de la fecha
Lo más valioso que le falta al usuario: dónde ver cada partido. Además le da a la
fábrica material duro para las previas, que hoy son la clase de nota más pobre
porque no hay nada verificado que contar antes del pitazo.

### Tabla de la Liga Femenina
**API-Football no tiene tabla de posiciones ni goleadoras de la Liga Femenina
BetPlay** (verificado con `./fabrica.sh cobertura`: la competición es la 712 y
`standings`, `top_scorers` y `top_assists` vienen en `false`). Decisión tomada:
la sección se publica **sin tabla**, con noticias y crónicas, y un aviso que
explica que los datos no están disponibles. Antes que una tabla inventada, nada.

Pendiente evaluar para fase 2:

1. Volver a correr `cobertura` cada tanto: la cobertura de una competición cambia
   de temporada a temporada, puede aparecer sola.
2. Scrapear una fuente pública (Dimayor, Soccerway) si sigue sin haber API.
   Si se va por ahí, el dato scrapeado se marca como tal y **no** entra al
   contexto verificado de los agentes hasta que se pueda confiar en él.
3. Cargar la tabla a mano desde el panel del CMS, si el torneo lo amerita.

### Predictor
API-Football trae `predictions` para la Liga BetPlay. Es material para una
sección propia, no para meterlo dentro de una nota.

### Migrar a `.com.co`
El dominio bueno está tomado. Si se libera, se compra y se migra con 301 desde
`futbolcolombiano.net`, que queda redirigiendo para no perder el histórico.

---

## Decisiones tomadas (para no rediscutirlas)

**Dos torneos por año.** API-Football devuelve el Apertura y el Clausura como dos
"grupos" de la misma temporada. El cliente los aplanaba en una sola tabla de 40
filas con cada club repetido y los puntos mezclados. Corregido: se separan y el
vigente es **el último torneo que ya tenga partidos jugados**. Sale de los datos,
así que no hay que mover ninguna constante a mitad de año.

**Goleadores por torneo, no por temporada.** `/players/topscorers` solo recibe
liga y temporada, y la temporada colombiana tiene dos campeonatos: devolvía a
Rodallega con 13 goles en 27 partidos mientras el Clausura llevaba 5 fechas.
Como las rondas vienen etiquetadas (`"Clausura - 5"`), los goleadores se
reconstruyen gol por gol desde los eventos de los partidos del torneo vigente.
Cuesta una llamada por partido jugado —unas 50 a mitad de torneo— y todas las
respuestas se cachean dentro del build. Si algún día el torneo recién arranca y
no hay goles reconstruidos, **no** se cae al total de la temporada: se muestra
vacío, porque el número del año sería otra vez el equivocado.

Efecto colateral: al reconstruir por eventos no se sabe cuántos partidos jugó
cada uno —la API dice quién marcó, no quién estuvo en cancha—, así que la
columna PJ de la ficha del jugador muestra un guion.

**Nombres de club desde la API.** Se resuelven por `apiId`, nunca por texto: la
API escribe "Junior" y "Atletico Nacional", y buscar por nombre dejaba al club
sin escudo y sin enlace a su ficha, en silencio.

**Crónicas en dos pasadas.** Se publican automáticamente con los datos de
API-Football apenas termina el partido —ahí se gana la ventana de 30 minutos— y
después se enriquecen con las demás fuentes pasando por el gate humano.

**Sin tope de columnas por historia.** Cuando un equipo juega, escriben todas sus
firmas. El único freno es `max_columnas_por_corrida`, que es control de costo, no
regla editorial.

**Modelos.** Se arranca barato (Haiku redactor / Sonnet editor y columnista /
Haiku SEO) y se mide antes de subir. El costo por corrida se imprime siempre,
incluso cuando la corrida falla.

**Sin disclaimer legal** en las fichas de columnistas por ahora.

**El scheduler de la fábrica sigue apagado** a propósito. Se activa cuando el
gate humano esté rodado.

---

## Verificado contra la API (temporada 2026)

| Competición | id | Tabla | Goleadores | Eventos del partido |
|---|---|---|---|---|
| Liga BetPlay | 239 | sí | sí | sí |
| Torneo BetPlay (B) | 240 | sí | sí | sí |
| Copa Colombia | 241 | sí | sí | sí |
| Liga Femenina | 712 | **no** | **no** | parcial |
| Superliga | 713 | — | — | — |

Para volver a comprobarlo:

```bash
./fabrica.sh cobertura                # todas las competiciones de interés
./fabrica.sh cobertura --pais Colombia  # ids reales de un país
./fabrica.sh cobertura --tabla 239      # cómo llegan los grupos de una tabla
```

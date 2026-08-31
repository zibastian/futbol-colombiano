# Cómo funciona cada torneo, y qué implica para los datos

Referencia para no tener que redescubrir esto en producción. Lo importante no es
el reglamento en abstracto sino **qué decisión de código depende de cada regla**.

Fuente de los nombres de fase: el registro real de la fábrica
(`registro/eventos.json`), no la documentación. Es lo que la API devuelve de
verdad para 2026.

---

## La regla que manda sobre todas

> **El formato del torneo NO se puede escribir a mano en el código.**

En 2026 pasó exactamente lo que hace falta para romper cualquier constante:

- La **Liga BetPlay 2026-I** se jugó con **playoffs** (cuartos, semis, final a
  eliminación directa), para terminar antes del Mundial que arrancó el 11 de
  junio.
- La **Liga BetPlay 2026-II** volvió a **cuadrangulares**, tras una asamblea del
  19 de agosto: 17 clubes a favor, 3 en contra. El argumento fue la plata que
  dejan los cuadrangulares.
- El **Torneo BetPlay (B) 2026-I**, en el MISMO semestre, se jugó con
  **cuadrangulares**, no con playoffs.

O sea: el formato cambia de semestre a semestre y **es distinto entre divisiones
al mismo tiempo**. Cualquier `FASE_ACTUAL` escrita a mano queda mal sola.

---

## Nombres de fase reales de la API (temporada 2026)

| Competición | Fases que devolvió la API | Partidos |
|---|---|---|
| Liga BetPlay | `Apertura` | 190 |
| | `Apertura - Quarter-finals` | 8 |
| | `Apertura - Semi-finals` | 4 |
| | `Apertura - Final` | 2 |
| | `Clausura` | 52 y contando |
| Torneo BetPlay | `Apertura` | 120 |
| | `Apertura Quadrangular` | 24 |
| | `Apertura - Final` | 2 |
| | `Clausura` | 40 |
| Copa BetPlay | `Group Stage` | 40 |
| | `Play-offs` | 15 |

La fase en curso se deduce de esos nombres: hoy la Copa figura en `playoffs`
habiendo jugado `grupos`, y la Liga en `todos-contra-todos`. El sitio lo lee de
ahí, no de una constante.

**Ojo con la puntuación**, porque de eso depende que los goles se sumen bien:
`Apertura - Quarter-finals` lleva guion, `Apertura Quadrangular` **no**. Son dos
convenciones distintas en la misma API. Por eso el código corta por guion *y*
además reconoce sufijos de fase.

---

## Regla de goleadores, competición por competición

### Liga BetPlay y Torneo BetPlay — se acumula POR TORNEO

Hay dos campeonatos por año y son independientes: el goleador del Clausura
arranca de cero. Sumarlos daba a Rodallega con 13 goles en un torneo de 5 fechas.

**Las fases finales SÍ cuentan.** Los cuadrangulares, los playoffs y la final son
continuación del mismo campeonato, no un torneo aparte. Un gol en la final del
Apertura es un gol del goleador del Apertura.

En el código: `acumula: "torneo"`, y `familia()` colapsa
`Apertura Quadrangular` → `Apertura`.

### Copa BetPlay — se acumula POR TEMPORADA

Es un certamen solo, aunque tenga fase de grupos y play-offs. El goleador de la
Copa incluye todo: no se reinicia al pasar de instancia.

En el código: `acumula: "temporada"`.

**Estructura normal:** fase de grupos y, a partir de ahí, **llaves de ida y
vuelta** hasta el campeón.

**Excepción 2026** (cambió sobre la marcha, después del sismo que obligó a
reprogramar): octavos y cuartos a **partido único**; semifinal y final siguen a
ida y vuelta. Es un buen recordatorio de que hasta el formato de una copa se
puede mover a mitad de camino. Cuando un equipo de la B enfrenta a uno de la A, **la B es local**.
Entre dos equipos de la A, manda la reclasificación del primer semestre.

### Libertadores y Sudamericana — se acumula POR TEMPORADA

**Los goles de las fases previas SÍ cuentan** para la tabla de goleadores. Un
jugador que marcó en la segunda fase clasificatoria llega a la fase de grupos con
esos goles encima.

Es lo que más se presta a error, porque el equipo que entra directo a grupos
juega menos partidos que el que vino desde la fase 1. Si algún día el goleador se
ve raro, ése es el primer lugar donde mirar.

En el código: `acumula: "temporada"`.

### Liga Femenina BetPlay

Se juega a una vuelta con fecha de clásicos y clasifican los ocho primeros.
Pero **API-Football no da tabla ni goleadoras** de esta competición (verificado
con `./fabrica.sh cobertura`), así que hoy la sección va sin datos. Ver
`roadmap.md`.

---

## Qué mirar cuando algo se ve raro

**Goleador con demasiados goles para las fechas jugadas.** Se están sumando dos
torneos. Revisar `acumula` y qué devuelve `torneo_de_los_partidos()`.

**Goleadores en cero.** El nombre del torneo no está emparejando. Pasó con la B
y la Copa: la tabla dice `Primera B: Clausura` y los partidos dicen
`Clausura - 5`. Los goles salen de los partidos, así que el torneo también.

**El goleador se reinicia al llegar a los cuadrangulares.** Apareció una fase con
un nombre que `familia()` no reconoce. Agregar el sufijo a `SUFIJOS_DE_FASE`.

Para ver los nombres reales que está devolviendo la API:

```bash
python3 -c "
import json, collections, re
d = json.load(open('fabrica/registro/eventos.json'))
for slug, comp in d['competiciones'].items():
    fases = collections.Counter(
        re.sub(r'\s*-\s*\d+$', '', p['ronda']) for p in comp['partidos'].values())
    print(slug, dict(fases))
"
```

---

## Fuentes

- [Dimayor confirma formato de Liga BetPlay 2026: no habrá cuadrangulares en el primer semestre — Futbolred](https://www.futbolred.com/futbol-colombiano/liga-betplay/dimayor-confirma-formato-de-liga-betplay-2026-no-habra-cuadrangulares-en-el-primer-semestre-259843)
- [Dimayor no modificará el formato de la Liga Betplay; la Copa Betplay sí tuvo cambios — El Colombiano](https://www.elcolombiano.com/deportes/futbol/liga-betplay-2026-formato-cuadrangulares-copa-betplay-octavos-GM40088187)
- [Dimayor tomó decisión sobre cambios en el sistema de la Liga BetPlay para el segundo semestre — Infobae](https://www.infobae.com/colombia/deportes/2026/08/19/dimayor-no-aprobo-cambios-en-el-sistema-de-la-liga-betplay-para-el-segundo-semestre-de-2026/)
- [Oficial: la Dimayor definió un nuevo formato para los octavos de final de la Copa BetPlay — El Espectador](https://www.elespectador.com/deportes/futbol-colombiano/oficial-la-dimayor-definio-un-nuevo-formato-para-los-octavos-de-final-de-la-copa-betplay/)
- [Así se jugarán los octavos de final a partido único de la Copa BetPlay — Win Sports](https://www.winsports.co/futbol-colombiano/noticias/asi-se-jugaran-los-octavos-de-final-a-partido-unico-de-la-copa-betplay-455737)

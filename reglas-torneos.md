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

**Ya están conectadas** (`libertadores` id 13, `sudamericana` id 11).

**Los goles de las fases previas SÍ cuentan** para la tabla de goleadores. Un
jugador que marcó en la segunda fase clasificatoria llega a la fase de grupos con
esos goles encima.

Es lo que más se presta a error, porque el equipo que entra directo a grupos
juega menos partidos que el que vino desde la fase 1. Si algún día el goleador se
ve raro, ése es el primer lugar donde mirar.

En el código: `acumula: "temporada"`.

**Los clubes extranjeros no están en `equipos.ts` y no hace falta que estén.**
Son decenas y cambian cada año. La tabla usa el escudo que manda la API y el
nombre como ella lo escribe. Solo los clubes colombianos tienen ficha, escudo
propio y enlace.

### La tabla se calcula, no se copia

**`/standings` no está mal: llega tarde.** Y para nosotros es lo mismo.

**Medido con cronómetro** el 6 de septiembre de 2026, Tigres FC vs Patriotas
(Torneo BetPlay, pitazo final ~22:09 Colombia), consultando cada cinco minutos:

| Minutos del pitazo | `/fixtures` | `/standings` |
|---|---|---|
| 0 | terminado, 6 PJ | 5 PJ — sin el partido |
| 5 | igual | sin el partido |
| 10 | igual | sin el partido |
| **15** | igual | **sin el partido** |
| 20 | igual | sin el partido |
| **45** | igual | sin el partido |

El mismo día, con Millonarios 1-1 Pereira, seguía atrasada **una hora** después
del pitazo, y estaba al día a la mañana siguiente.

Dos observaciones y las dos apuntan a lo mismo: **el resultado del partido está
en `/fixtures` de inmediato, y la tabla tarda bastante más que nuestra ventana
de publicación.** A los 45 minutos todavía no había llegado, lo que hace pensar
que no es un refresco continuo sino uno programado cada varias horas.

**Por qué eso decide.** El vigía corre a los ~15 minutos del pitazo y ahí
publica. En ese preciso momento, medido, la tabla de la API todavía no tenía el
partido. Copiarla habría sacado el sitio con la tabla vieja al lado de una
crónica que cuenta ese mismo partido. La contradicción la ve el hincha, no el
proveedor.

Para volver a medirlo: `./fabrica.sh cobertura --latencia 240` compara, tabla
por tabla, los partidos terminados de `/fixtures` contra los que dice
`/standings`.

Los goles ya se cuentan partido por partido. La tabla sale de los mismos
partidos, así que se calcula igual: se actualiza en el mismo instante que todo
lo demás. Comprobado contra la tabla de la API: 19 de 20 filas idénticas, y la
única diferencia era justo el partido que faltaba.

**Solo aplica a las competiciones que acumulan por torneo.** En una copa la
tabla va por grupos y los partidos no dicen quién está en cuál, así que ahí se
sigue usando la de la API.

**Lo que no sabe: las sanciones.** Si la Dimayor le descuenta puntos a un club,
eso no está en ningún partido. Por eso cada corrida compara las dos tablas y
avisa cuando un equipo tiene los mismos partidos jugados y distintos puntos.

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

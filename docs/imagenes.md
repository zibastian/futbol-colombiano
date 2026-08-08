# Imágenes del portal: de dónde sale cada una

## 1. Plantillas propias (base del sistema)
`npm run portadas` genera portadas y banners con la identidad del sitio y los
escudos reales. Costo cero, estilo consistente, sin riesgo legal. Es la fuente
por defecto de toda portada.

## 2. Wikimedia Commons — retratos e histórico
`npm run fotos` descarga las fotos de las leyendas verificando que la licencia
permita uso comercial, y guarda autor + licencia. El crédito se muestra en la ficha.

## 3. Openverse + Commons — banco general
`npm run imagen -- "estadio el campin" --guardar 1`
Para estadios, hinchada, ambiente, actos oficiales y notas de historia: material
que se reutiliza muchas veces y conviene tener local. Solo licencias comerciales.

## 4. Getty Images (embed) — la foto del partido
Campo `getty` en el frontmatter de la nota. Gratis para uso editorial, incluso en
sitios con AdSense. Limitaciones: no se descarga ni se edita, no sirve como portada
ni para redes, y Getty puede retirarla. Solo dentro del cuerpo de la nota.

## 5. Embeds oficiales de clubes y jugadores
Publicaciones de Instagram/X de los clubes: gratis, legal y con inmediatez.

## 6. Logos de torneos (marcas registradas)
Los logos de Liga/Torneo/Copa BetPlay son marca de Dimayor. Su uso para identificar
la competición dentro de una nota es práctica editorial estándar, pero NO es material
libre. Reglas de la casa:

- Nunca en la cabecera del sitio ni junto a nuestro logo (parecería sitio oficial).
- Solo en contexto informativo: banners de sección y piezas de partido.
- Ojo con la marca BetPlay: es una casa de apuestas y su publicidad está regulada
  en Colombia. No dar prominencia que parezca promoción.
- Vía limpia: pedir autorización de uso editorial a Dimayor por escrito y su kit
  de prensa. Un correo suele bastar y además da acceso a material en alta.

Para activarlo: guardar el archivo en `public/torneos/{slug}.png`
(ej. `liga-betplay.png`) y correr `npm run portadas`. Si el archivo existe, el
banner lo incorpora automáticamente; si no, usa el balón tricolor de la marca.

## 7. A futuro: fotógrafo propio
Acreditación de Dimayor + freelance local (~USD 50-150 por partido). Fotos propias,
exclusivas y sin límites de uso. Es la única forma de diferenciarse de verdad.

### Preparar un logo de torneo

1. Guardar la imagen original (aunque tenga fondo blanco) en
   `public/torneos/originales/liga-betplay.png`
2. `npm run logos` — quita el fondo blanco, recorta y normaliza a 600px
3. `npm run portadas` — regenera los banners con el logo incorporado

Slugs válidos: `liga-betplay`, `torneo-betplay`, `copa-betplay`.

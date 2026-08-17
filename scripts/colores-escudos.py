"""Extrae los colores dominantes de cada escudo.

Por qué no están escritos a mano: los colores de un club son un dato con
matices (¿el rojo del América es el mismo que el de Santa Fe?) y a ojo se
inventan mal. El escudo oficial ya los tiene, así que se leen de ahí.

Salida: src/data/colores-equipos.json  ->  { "1137": ["#00A650", "#FFFFFF"], ... }
La clave es el apiId, que es como se nombran los PNG en public/escudos/.

Uso:  python3 scripts/colores-escudos.py

Se corre una sola vez, o cuando se actualicen los escudos (npm run escudos).
El resultado se versiona: el generador de portadas no depende de Python.
"""
from __future__ import annotations

import colorsys
import json
from collections import Counter
from pathlib import Path

from PIL import Image

ESCUDOS = Path("public/escudos")
SALIDA = Path("src/data/colores-equipos.json")

# Un escudo tiene mucho blanco de fondo y mucho gris de bordes y sombras.
# Nos interesan los colores con los que la gente identifica al club, así que
# se descartan los casi blancos, los casi negros y los desaturados.
SATURACION_MINIMA = 0.28
LUMINOSIDAD_MINIMA = 0.16
LUMINOSIDAD_MAXIMA = 0.88

# Dos colores se consideran el mismo si su tono está a menos de esto. Evita
# devolver "rojo" y "rojo un poco más oscuro" como si fueran dos colores.
DISTANCIA_TONO = 0.07


def dominantes(ruta: Path, cuantos: int = 2) -> list[str]:
    img = Image.open(ruta).convert("RGBA").resize((96, 96))
    conteo: Counter[tuple[int, int, int]] = Counter()

    for r, g, b, a in img.getdata():
        if a < 200:
            continue
        h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
        if s < SATURACION_MINIMA or not (LUMINOSIDAD_MINIMA < l < LUMINOSIDAD_MAXIMA):
            continue
        # Se agrupa en cubos para que los degradados del escudo no cuenten
        # como cientos de colores distintos.
        conteo[(r // 24, g // 24, b // 24)] += 1

    elegidos: list[tuple[float, tuple[int, int, int]]] = []
    for cubo, _ in conteo.most_common(40):
        r, g, b = (c * 24 + 12 for c in cubo)
        h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
        if any(min(abs(h - hp), 1 - abs(h - hp)) < DISTANCIA_TONO for hp, _ in elegidos):
            continue
        elegidos.append((h, (r, g, b)))
        if len(elegidos) == cuantos:
            break

    colores = [f"#{r:02X}{g:02X}{b:02X}" for _, (r, g, b) in elegidos]
    # Si el escudo es casi todo blanco y negro (Once Caldas, Chicó) no queda
    # ningún color saturado: se cae a la identidad del sitio antes que a nada.
    while len(colores) < cuantos:
        colores.append("#1B2A44" if not colores else "#F2C200")
    return colores


def main() -> None:
    salida: dict[str, list[str]] = {}
    for png in sorted(ESCUDOS.glob("*.png")):
        salida[png.stem] = dominantes(png)
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(salida, indent=2) + "\n", encoding="utf-8")
    print(f"{len(salida)} escudos procesados -> {SALIDA}")


if __name__ == "__main__":
    main()

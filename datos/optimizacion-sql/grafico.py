"""Genera grafico.svg a partir de resultados.csv (solo biblioteca estándar)."""

import csv
import math
from pathlib import Path

CARPETA = Path(__file__).resolve().parent
LIMITE = 120.0
NOMBRES = {"1": "Historial de un cliente", "2": "Ventas de un mes", "3": "Clientes sin compras recientes",
           "4": "Buscar un cliente por CUIT", "5": "Página 25.001 del listado", "6": "Productos más vendidos del mes"}

ANCHO, IZQ, DER = 900, 300, 120
ARRIBA, FILA, BARRA = 96, 62, 16
MIN_S, MAX_S = 0.0001, LIMITE       # eje logarítmico de 0,1 ms a 120 s

COLOR_ANTES = "#eb6834"
COLOR_DESPUES = "#2a78d6"
TEXTO, TEXTO_2, GRILLA, FONDO = "#0b0b0b", "#52514e", "#e4e3df", "#fcfcfb"


def x(segundos):
    s = min(max(segundos, MIN_S), MAX_S)
    frac = (math.log10(s) - math.log10(MIN_S)) / (math.log10(MAX_S) - math.log10(MIN_S))
    return IZQ + frac * (ANCHO - IZQ - DER)


def formato(s):
    if s is None:
        return "más de 2 min"
    if s >= 1:
        return f"{s:.1f} s".replace(".", ",")
    if s >= 0.01:
        return f"{s * 1000:.0f} ms"
    return f"{s * 1000:.1f} ms".replace(".", ",")


def barra(y, segundos, color):
    fin = x(LIMITE if segundos is None else segundos)
    r = 4
    ancho = max(fin - IZQ, r)
    d = (f"M{IZQ},{y} h{ancho - r} a{r},{r} 0 0 1 {r},{r} v{BARRA - 2 * r} "
         f"a{r},{r} 0 0 1 {-r},{r} h{-(ancho - r)} z")
    partes = [f'<path d="{d}" fill="{color}"><title>{formato(segundos)}</title></path>']
    if segundos is None:   # corte: la consulta se canceló al llegar al límite
        partes.append(f'<path d="M{fin - 10},{y - 2} l6,{BARRA + 4} M{fin - 4},{y - 2} l6,{BARRA + 4}" '
                      f'stroke="{FONDO}" stroke-width="3"/>')
    partes.append(f'<text x="{fin + 8}" y="{y + BARRA - 3}" class="valor">{formato(segundos)}</text>')
    return "\n".join(partes)


def main():
    filas = list(csv.DictReader(open(CARPETA / "resultados.csv", encoding="utf-8")))
    alto = ARRIBA + FILA * len(filas) + 50
    leer = lambda v: None if v in ("", "None") else float(v)

    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ANCHO} {alto}" width="{ANCHO}" '
           f'font-family="Segoe UI, Helvetica, Arial, sans-serif">',
           f'<style>.t{{font-size:20px;font-weight:600;fill:{TEXTO}}} .s{{font-size:14px;fill:{TEXTO_2}}} '
           f'.caso{{font-size:14px;fill:{TEXTO}}} .valor{{font-size:13px;fill:{TEXTO}}} '
           f'.eje{{font-size:12px;fill:{TEXTO_2}}}</style>',
           f'<rect width="100%" height="100%" fill="{FONDO}"/>',
           f'<text x="24" y="34" class="t">Tiempo de cada consulta, antes y después de optimizar</text>',
           f'<text x="24" y="56" class="s">1.000.000 de pedidos · escala logarítmica: cada línea es 10 veces más</text>',
           f'<rect x="{IZQ}" y="66" width="12" height="12" rx="3" fill="{COLOR_ANTES}"/>'
           f'<text x="{IZQ + 18}" y="77" class="s">Original, sin índices</text>',
           f'<rect x="{IZQ + 190}" y="66" width="12" height="12" rx="3" fill="{COLOR_DESPUES}"/>'
           f'<text x="{IZQ + 208}" y="77" class="s">Optimizada</text>']

    base_eje = ARRIBA + FILA * len(filas)
    for s, etiqueta in [(0.0001, "0,1 ms"), (0.001, "1 ms"), (0.01, "10 ms"), (0.1, "100 ms"), (1, "1 s"), (10, "10 s"), (100, "100 s")]:
        svg.append(f'<line x1="{x(s):.1f}" y1="{ARRIBA - 4}" x2="{x(s):.1f}" y2="{base_eje}" stroke="{GRILLA}"/>')
        svg.append(f'<text x="{x(s):.1f}" y="{base_eje + 18}" text-anchor="middle" class="eje">{etiqueta}</text>')

    for i, f in enumerate(filas):
        y = ARRIBA + i * FILA + 8
        svg.append(f'<text x="24" y="{y + BARRA + 2}" class="caso">{f["caso"]}. {NOMBRES.get(f["caso"], f["consulta"])}</text>')
        svg.append(barra(y, leer(f["original_sin_indices_s"]), COLOR_ANTES))
        svg.append(barra(y + BARRA + 2, leer(f["reescrita_con_indices_s"]), COLOR_DESPUES))

    svg.append(f'<line x1="{IZQ}" y1="{ARRIBA - 4}" x2="{IZQ}" y2="{base_eje}" stroke="{TEXTO_2}"/>')
    svg.append("</svg>")
    (CARPETA / "grafico.svg").write_text("\n".join(svg), encoding="utf-8")
    print("grafico.svg listo")


if __name__ == "__main__":
    main()

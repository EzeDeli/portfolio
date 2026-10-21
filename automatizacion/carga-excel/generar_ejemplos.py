"""Crea Excel de ejemplo como los que mandaría cada sucursal, con los errores de siempre.

Cada sucursal arma la planilla a su manera: encabezados distintos, fechas en varios formatos,
importes escritos como texto, códigos que no existen, ventas repetidas y filas vacías.
Uso:  python generar_ejemplos.py
"""

import datetime as dt
import random
from pathlib import Path

from openpyxl import Workbook

CARPETA = Path(__file__).resolve().parent
ENTRADA = CARPETA / "entrada"
FECHA = dt.date(2026, 10, 20)

PRODUCTOS = [
    ("A100", "Yerba 1 kg", 4200), ("A101", "Azúcar 1 kg", 1350), ("A102", "Aceite girasol 1,5 l", 3900),
    ("B200", "Agua 2 l", 1100), ("B201", "Gaseosa cola 2,25 l", 2800), ("C300", "Lavandina 2 l", 1700),
    ("C301", "Detergente 750 ml", 1900), ("D400", "Jabón en polvo 3 kg", 9800),
]

# Cada sucursal usa sus propios encabezados (como pasa en la realidad)
SUCURSALES = {
    "centro": ["Nro venta", "Fecha", "Código", "Cantidad", "Precio unitario"],
    "norte": ["ID", "fecha venta", "Cod. producto", "Cant.", "Precio"],
    "oeste": ["N° de venta", "Día", "Producto", "Unidades", "P. unit."],
}


def filas_de(sucursal, desde, cantidad, rnd):
    filas = []
    for i in range(cantidad):
        codigo, _, precio = rnd.choice(PRODUCTOS)
        filas.append([f"{sucursal[0].upper()}-{desde + i}", FECHA, codigo, rnd.randint(1, 6), precio])
    return filas


def main():
    rnd = random.Random(42)                       # siempre los mismos datos
    ENTRADA.mkdir(exist_ok=True)

    with open(CARPETA / "productos.csv", "w", encoding="utf-8") as f:
        f.write("codigo;nombre;precio_lista\n")
        for codigo, nombre, precio in PRODUCTOS:
            f.write(f"{codigo};{nombre};{precio}\n")

    for n, (sucursal, encabezados) in enumerate(SUCURSALES.items()):
        filas = filas_de(sucursal, 1001 + n * 500, 40, rnd)

        if sucursal == "centro":
            filas[3][1] = "20/10/2026"                       # fecha como texto
            filas[7][4] = "$ 4.200,00"                       # importe como texto, formato argentino
            filas[12][2] = "Z999"                            # producto que no existe
            filas[18][3] = -2                                # cantidad negativa
            filas.insert(25, [None] * 5)                     # fila vacía en el medio
            filas.append(list(filas[5]))                     # la misma venta copiada dos veces
        elif sucursal == "norte":
            filas[2][1] = "2026-10-20"                       # otro formato de fecha
            filas[9][2] = " a101 "                           # código en minúscula y con espacios
            filas[14][1] = "ayer"                            # fecha imposible de interpretar
            filas[21][4] = "3900.5"                          # decimal con punto
            filas[30][2] = None                              # sin código
        else:
            filas[4][1] = "20-10-26"                         # año con dos dígitos
            filas[11][3] = "dos"                             # cantidad escrita en letras
            filas[16][4] = "1.900"                           # miles con punto
            filas[27][0] = None                              # venta sin número

        libro = Workbook()
        hoja = libro.active
        hoja.title = "Ventas"
        hoja.append(encabezados)
        for fila in filas:
            hoja.append(fila)
        for celda in hoja["B"][1:]:
            if isinstance(celda.value, dt.date):
                celda.number_format = "DD/MM/YYYY"
        libro.save(ENTRADA / f"ventas_{sucursal}_{FECHA:%Y-%m-%d}.xlsx")

    print(f"Listo: 3 planillas en {ENTRADA.name}/ y el catálogo en productos.csv")


if __name__ == "__main__":
    main()

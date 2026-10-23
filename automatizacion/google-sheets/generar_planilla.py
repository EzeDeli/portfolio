"""Arma planilla-ejemplo.xlsx a partir de los CSV de datos/, lista para importar en Google Sheets.

Uso:  python generar_planilla.py   (requiere openpyxl)
"""

import csv
import datetime as dt
import re
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill

CARPETA = Path(__file__).parent
HOJAS = [("Pedidos", "pedidos.csv", [11, 12, 24, 10, 10, 12, 44]),
         ("Productos", "productos.csv", [10, 28, 8, 13, 15, 28]),
         ("Configuración", "configuracion.csv", [20, 40])]


def como_en_sheets(texto):
    """Números como número y fechas válidas como fecha; lo demás queda como texto (así se ven los errores)."""
    if re.fullmatch(r"-?\d+(\.\d+)?", texto):
        return float(texto) if "." in texto else int(texto)
    m = re.fullmatch(r"(\d{2})/(\d{2})/(\d{4})", texto)
    if m:
        try:
            return dt.date(int(m[3]), int(m[2]), int(m[1]))
        except ValueError:
            pass
    return texto


def main():
    libro = Workbook()
    libro.remove(libro.active)
    for nombre, archivo, anchos in HOJAS:
        hoja = libro.create_sheet(nombre)
        with open(CARPETA / "datos" / archivo, encoding="utf-8", newline="") as f:
            for i, fila in enumerate(csv.reader(f)):
                hoja.append(fila if i == 0 else [como_en_sheets(c) for c in fila])
        for celda in hoja[1]:
            celda.font = Font(bold=True, color="FFFFFF")
            celda.fill = PatternFill("solid", fgColor="188038")
        for fila in hoja.iter_rows(min_row=2):
            for celda in fila:
                if isinstance(celda.value, dt.date):
                    celda.number_format = "DD/MM/YYYY"
        for letra, ancho in zip("ABCDEFG", anchos):
            hoja.column_dimensions[letra].width = ancho
        hoja.freeze_panes = "A2"
    libro.save(CARPETA / "planilla-ejemplo.xlsx")
    print("Listo: planilla-ejemplo.xlsx")


if __name__ == "__main__":
    main()

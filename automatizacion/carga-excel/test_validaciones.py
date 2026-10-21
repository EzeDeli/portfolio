"""Pruebas de las reglas de limpieza.  Uso:  python -m unittest"""

import datetime as dt
import unittest

from validaciones import (ErrorDeFila, limpiar_cantidad, limpiar_fecha, limpiar_importe,
                          limpiar_producto, mapear_encabezados)

CATALOGO = {"A100", "A101"}


class TestValidaciones(unittest.TestCase):
    def test_encabezados_de_cada_sucursal(self):
        for encabezados in (["Nro venta", "Fecha", "Código", "Cantidad", "Precio unitario"],
                            ["ID", "fecha venta", "Cod. producto", "Cant.", "Precio"],
                            ["N° de venta", "Día", "Producto", "Unidades", "P. unit."]):
            self.assertEqual(set(mapear_encabezados(encabezados)),
                             {"id_venta", "fecha", "producto", "cantidad", "precio"})

    def test_falta_una_columna(self):
        with self.assertRaises(ValueError):
            mapear_encabezados(["Fecha", "Código", "Cantidad"])

    def test_fechas(self):
        esperada = dt.date(2026, 10, 20)
        for valor in (esperada, dt.datetime(2026, 10, 20, 9, 30), "20/10/2026", "2026-10-20", "20-10-26"):
            self.assertEqual(limpiar_fecha(valor), esperada)
        with self.assertRaises(ErrorDeFila):
            limpiar_fecha("ayer")

    def test_importes(self):
        self.assertEqual(limpiar_importe(4200), 4200)
        self.assertEqual(limpiar_importe("$ 4.200,50"), 4200.5)
        self.assertEqual(limpiar_importe("3900.5"), 3900.5)
        self.assertEqual(limpiar_importe("1.900"), 1900)
        for malo in ("", "gratis", -10, 0):
            with self.assertRaises(ErrorDeFila):
                limpiar_importe(malo)

    def test_cantidades(self):
        self.assertEqual(limpiar_cantidad(3), 3)
        self.assertEqual(limpiar_cantidad("4"), 4)
        for malo in (-2, 0, 1.5, "dos", None):
            with self.assertRaises(ErrorDeFila):
                limpiar_cantidad(malo)

    def test_productos(self):
        self.assertEqual(limpiar_producto(" a101 ", CATALOGO), "A101")
        for malo in ("Z999", None, ""):
            with self.assertRaises(ErrorDeFila):
                limpiar_producto(malo, CATALOGO)


if __name__ == "__main__":
    unittest.main()

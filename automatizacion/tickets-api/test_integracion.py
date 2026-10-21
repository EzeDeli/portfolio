"""Pruebas de los triggers, el worker y la API.  Uso:  python -m unittest"""

import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import mesa_de_ayuda
import simular
import worker

PUERTO = 8766


def base_de_prueba():
    base = sqlite3.connect(":memory:")
    base.executescript((simular.CARPETA / "esquema.sql").read_text(encoding="utf-8"))
    simular.preparar(base)
    simular.un_dia_de_trabajo(base)
    return base


class TestIntegracion(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.mesa, cls.servidor = mesa_de_ayuda.iniciar_en_segundo_plano(puerto=PUERTO)
        cls.url = mock.patch.object(worker, "API_URL", f"http://127.0.0.1:{PUERTO}/api/v1")
        cls.url.start()
        worker.ESPERA_BASE = 0.01

    @classmethod
    def tearDownClass(cls):
        cls.url.stop()
        cls.servidor.shutdown()
        cls.servidor.server_close()

    def setUp(self):
        self.mesa.tickets.clear()
        self.mesa.por_clave.clear()
        self.mesa.fallas = 0
        self.salida = Path(tempfile.mkdtemp())

    def test_los_triggers_anotan_solo_lo_importante(self):
        base = base_de_prueba()
        tipos = [t for (t,) in base.execute("SELECT tipo FROM eventos ORDER BY id")]
        # 3 productos cruzan el mínimo (una venta más debajo del mínimo no repite el aviso),
        # el pedido marcado dos veces como demorado avisa una sola vez, y entra un reclamo.
        self.assertEqual(tipos.count("stock_bajo"), 3)
        self.assertEqual(tipos.count("pedido_demorado"), 1)
        self.assertEqual(tipos.count("reclamo"), 1)

    def test_crea_un_ticket_por_evento_y_avisa(self):
        base = base_de_prueba()
        resumen = worker.procesar_pendientes(base, self.salida)
        self.assertEqual(resumen, {"enviados": 5, "con_error": 0})
        self.assertEqual(len(self.mesa.tickets), 5)
        self.assertEqual(len(list((self.salida / "mails").glob("*.eml"))), 5)
        sin_ticket = base.execute("SELECT COUNT(*) FROM eventos WHERE ticket_id IS NULL").fetchone()[0]
        self.assertEqual(sin_ticket, 0)

    def test_no_duplica_si_se_corre_dos_veces(self):
        base = base_de_prueba()
        worker.procesar_pendientes(base, self.salida)
        self.assertEqual(worker.procesar_pendientes(base, self.salida)["enviados"], 0)
        self.assertEqual(len(self.mesa.tickets), 5)

    def test_idempotency_key_evita_tickets_repetidos(self):
        datos = {"titulo": "Prueba", "prioridad": "media"}
        primero = worker.crear_ticket(datos, "evento-99")
        segundo = worker.crear_ticket(datos, "evento-99")
        self.assertEqual(primero["id"], segundo["id"])
        self.assertEqual(len(self.mesa.tickets), 1)

    def test_reintenta_cuando_la_api_falla(self):
        respuestas = [worker.ErrorTemporal("HTTP 503"), worker.ErrorTemporal("HTTP 503"), {"id": 1}]

        def falla_dos_veces(*_):
            r = respuestas.pop(0)
            if isinstance(r, Exception):
                raise r
            return r

        with mock.patch.object(worker, "crear_ticket", side_effect=falla_dos_veces) as llamada:
            self.assertEqual(worker.crear_con_reintentos({}, "x"), {"id": 1})
            self.assertEqual(llamada.call_count, 3)

    def test_api_caida_deja_el_evento_para_la_proxima(self):
        base = base_de_prueba()
        with mock.patch.object(worker, "API_URL", "http://127.0.0.1:9/api/v1"):   # puerto sin nadie
            resumen = worker.procesar_pendientes(base, self.salida)
        self.assertEqual(resumen["con_error"], 5)
        self.assertEqual(base.execute("SELECT MIN(intentos) FROM eventos").fetchone()[0], 1)
        self.assertEqual(worker.procesar_pendientes(base, self.salida)["enviados"], 5)

    def test_error_del_pedido_no_se_reintenta(self):
        base = base_de_prueba()
        with base:
            base.execute("DELETE FROM responsables WHERE tipo = 'reclamo'")
        resumen = worker.procesar_pendientes(base, self.salida)
        self.assertEqual(resumen, {"enviados": 4, "con_error": 1})
        estado, intentos = base.execute("SELECT estado, intentos FROM eventos WHERE tipo = 'reclamo'").fetchone()
        self.assertEqual((estado, intentos), ("error", worker.MAX_INTENTOS))

    def test_la_api_exige_token(self):
        with mock.patch.object(worker, "API_TOKEN", "otro"):
            with self.assertRaises(worker.ErrorDefinitivo):
                worker.crear_ticket({"titulo": "x"}, "y")


if __name__ == "__main__":
    unittest.main()

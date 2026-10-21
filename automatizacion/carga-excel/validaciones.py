"""Reglas para limpiar y validar cada fila. Cada función devuelve el valor limpio o lanza ErrorDeFila."""

import datetime as dt
import re
import unicodedata


class ErrorDeFila(ValueError):
    """Motivo por el que una fila no se puede cargar. El mensaje va tal cual al reporte."""


# Nombres que usa cada sucursal para la misma columna
SINONIMOS = {
    "id_venta": {"nro venta", "id", "n de venta", "numero de venta", "venta", "id venta"},
    "fecha": {"fecha", "fecha venta", "dia"},
    "producto": {"codigo", "cod producto", "producto", "cod"},
    "cantidad": {"cantidad", "cant", "unidades"},
    "precio": {"precio unitario", "precio", "p unit", "precio unit"},
}


def normalizar(texto):
    """'Cód. producto' -> 'cod producto': sin tildes, sin signos, en minúscula."""
    texto = unicodedata.normalize("NFKD", str(texto)).encode("ascii", "ignore").decode()
    texto = re.sub(r"[^a-z0-9 ]", " ", texto.lower())
    return " ".join(texto.split())


def mapear_encabezados(encabezados):
    """Devuelve {campo: número de columna}. Falla si falta alguna columna obligatoria."""
    columnas = {}
    for i, nombre in enumerate(encabezados):
        clave = normalizar(nombre or "")
        for campo, opciones in SINONIMOS.items():
            if clave in opciones:
                columnas[campo] = i
    faltan = set(SINONIMOS) - set(columnas)
    if faltan:
        raise ValueError(f"No encontré las columnas: {', '.join(sorted(faltan))}")
    return columnas


def limpiar_id(valor):
    if valor is None or not str(valor).strip():
        raise ErrorDeFila("Falta el número de venta")
    return str(valor).strip().upper()


def limpiar_fecha(valor):
    if isinstance(valor, dt.datetime):
        return valor.date()
    if isinstance(valor, dt.date):
        return valor
    texto = str(valor or "").strip()
    for formato in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%y", "%d-%m-%y"):
        try:
            return dt.datetime.strptime(texto, formato).date()
        except ValueError:
            pass
    raise ErrorDeFila(f"Fecha inválida: '{texto}'")


def limpiar_importe(valor):
    """Acepta 4200, 3900.5, '3900.5', '$ 4.200,00' o '1.900' (miles con punto)."""
    if isinstance(valor, (int, float)):
        numero = float(valor)
    else:
        texto = str(valor or "").replace("$", "").replace(" ", "").strip()
        if not texto:
            raise ErrorDeFila("Falta el precio")
        if "," in texto:                                  # formato argentino: 4.200,50
            texto = texto.replace(".", "").replace(",", ".")
        elif re.fullmatch(r"\d{1,3}(\.\d{3})+", texto):   # 1.900 son mil novecientos
            texto = texto.replace(".", "")
        try:
            numero = float(texto)
        except ValueError:
            raise ErrorDeFila(f"Precio inválido: '{valor}'") from None
    if numero <= 0:
        raise ErrorDeFila(f"Precio inválido: {valor}")
    return round(numero, 2)


def limpiar_cantidad(valor):
    try:
        cantidad = float(str(valor).strip())
    except (TypeError, ValueError):
        raise ErrorDeFila(f"Cantidad inválida: '{valor}'") from None
    if cantidad <= 0 or cantidad != int(cantidad):
        raise ErrorDeFila(f"Cantidad inválida: {valor}")
    return int(cantidad)


def limpiar_producto(valor, catalogo):
    codigo = str(valor or "").strip().upper()
    if not codigo:
        raise ErrorDeFila("Falta el código de producto")
    if codigo not in catalogo:
        raise ErrorDeFila(f"Producto que no está en el catálogo: {codigo}")
    return codigo


def limpiar_fila(fila, columnas, catalogo):
    """Convierte una fila del Excel en un dict listo para la base."""
    venta = {
        "id_venta": limpiar_id(fila[columnas["id_venta"]]),
        "fecha": limpiar_fecha(fila[columnas["fecha"]]),
        "producto": limpiar_producto(fila[columnas["producto"]], catalogo),
        "cantidad": limpiar_cantidad(fila[columnas["cantidad"]]),
        "precio": limpiar_importe(fila[columnas["precio"]]),
    }
    venta["total"] = round(venta["cantidad"] * venta["precio"], 2)
    return venta

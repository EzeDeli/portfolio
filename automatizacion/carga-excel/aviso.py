"""Arma el mail con el resumen de la carga y lo manda por SMTP.

Si no hay servidor configurado (modo demo), guarda el mail en salida/mails/ como .eml
(se abre con Outlook o Thunderbird) y como .html para verlo en el navegador.

Configuración por variables de entorno (ver .env.example):
  SMTP_HOST, SMTP_PORT, SMTP_USUARIO, SMTP_CLAVE, MAIL_DE, MAIL_PARA
"""

import datetime as dt
import html
import os
import smtplib
from email.message import EmailMessage


def pesos(valor):
    return "$ " + f"{valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def armar_html(resumenes, rechazos, motivos):
    total_cargadas = sum(r["cargadas"] for r in resumenes)
    total_rechazadas = sum(r["rechazadas"] for r in resumenes)
    total_vendido = sum(r["total"] for r in resumenes)
    hay_problemas = total_rechazadas or any(r["estado"] != "ok" for r in resumenes)
    color, titulo = ("#b54708", "Carga con observaciones") if hay_problemas else ("#067647", "Carga sin errores")

    filas = "".join(
        f"<tr><td>{html.escape(r['sucursal'].title())}</td><td style='text-align:right'>{r['cargadas']}</td>"
        f"<td style='text-align:right'>{r['rechazadas']}</td><td style='text-align:right'>{pesos(r['total'])}</td>"
        f"<td>{'✔' if r['estado'] == 'ok' else '⚠ ' + html.escape(r['estado'])}</td></tr>"
        for r in resumenes)
    lista_motivos = "".join(f"<li>{html.escape(m)}: <b>{n}</b></li>" for m, n in motivos.most_common())
    detalle = "".join(
        f"<tr><td>{html.escape(r['archivo'])}</td><td style='text-align:right'>{r['fila']}</td>"
        f"<td>{html.escape(r['motivo'])}</td></tr>" for r in rechazos[:15])

    estilo_tabla = "border-collapse:collapse;width:100%;font-size:14px"
    celda = "th,td{border-bottom:1px solid #e4e3df;padding:7px 10px;text-align:left}"
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{celda}</style></head>
<body style="margin:0;background:#f4f4f2;font-family:Segoe UI,Arial,sans-serif;color:#1b1b1b">
<div style="max-width:640px;margin:24px auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e4e3df">
  <div style="background:{color};color:#fff;padding:18px 24px">
    <div style="font-size:13px;opacity:.9">Carga automática de ventas · {dt.datetime.now():%d/%m/%Y %H:%M}</div>
    <div style="font-size:22px;font-weight:600">{titulo}</div>
  </div>
  <div style="padding:20px 24px">
    <table style="width:100%;margin-bottom:18px"><tr>
      <td style="border:0"><div style="font-size:13px;color:#52514e">Ventas cargadas</div><div style="font-size:26px;font-weight:600">{total_cargadas}</div></td>
      <td style="border:0"><div style="font-size:13px;color:#52514e">Filas con errores</div><div style="font-size:26px;font-weight:600">{total_rechazadas}</div></td>
      <td style="border:0"><div style="font-size:13px;color:#52514e">Total vendido</div><div style="font-size:26px;font-weight:600">{pesos(total_vendido)}</div></td>
    </tr></table>
    <h3 style="font-size:16px;margin:8px 0">Por sucursal</h3>
    <table style="{estilo_tabla}"><tr><th>Sucursal</th><th style="text-align:right">Cargadas</th>
      <th style="text-align:right">Con errores</th><th style="text-align:right">Total</th><th>Estado</th></tr>{filas}</table>
    {f'<h3 style="font-size:16px;margin:20px 0 8px">Errores más frecuentes</h3><ul style="margin:0;padding-left:20px;font-size:14px">{lista_motivos}</ul>' if motivos else ''}
    {f'<h3 style="font-size:16px;margin:20px 0 8px">Filas a corregir</h3><table style="{estilo_tabla}"><tr><th>Archivo</th><th style="text-align:right">Fila</th><th>Motivo</th></tr>{detalle}</table>' if rechazos else ''}
    {f'<p style="font-size:13px;color:#52514e;margin-top:12px">El detalle completo va adjunto en un CSV que se abre con Excel.</p>' if rechazos else ''}
  </div>
</div></body></html>"""


def enviar_resumen(resumenes, rechazos, motivos, archivo_rechazos, carpeta_salida):
    mensaje = EmailMessage()
    errores = sum(r["rechazadas"] for r in resumenes)
    mensaje["Subject"] = (f"Carga de ventas: {sum(r['cargadas'] for r in resumenes)} cargadas"
                          + (f", {errores} filas para revisar" if errores else ", sin errores"))
    mensaje["From"] = os.environ.get("MAIL_DE", "carga-automatica@empresa.com")
    mensaje["To"] = os.environ.get("MAIL_PARA", "administracion@empresa.com")
    texto = "\n".join(f"{r['sucursal']}: {r['cargadas']} cargadas, {r['rechazadas']} con errores" for r in resumenes)
    mensaje.set_content(texto)
    cuerpo = armar_html(resumenes, rechazos, motivos)
    mensaje.add_alternative(cuerpo, subtype="html")
    if archivo_rechazos:
        mensaje.add_attachment(archivo_rechazos.read_bytes(), maintype="text", subtype="csv",
                               filename=archivo_rechazos.name)

    servidor = os.environ.get("SMTP_HOST")
    if servidor:
        with smtplib.SMTP(servidor, int(os.environ.get("SMTP_PORT", 587)), timeout=30) as smtp:
            smtp.starttls()
            smtp.login(os.environ["SMTP_USUARIO"], os.environ["SMTP_CLAVE"])
            smtp.send_message(mensaje)
        return "enviado"

    mails = carpeta_salida / "mails"
    mails.mkdir(exist_ok=True)
    nombre = f"resumen_{dt.datetime.now():%Y-%m-%d_%H%M%S}"
    (mails / f"{nombre}.eml").write_bytes(bytes(mensaje))
    (mails / f"{nombre}.html").write_text(cuerpo, encoding="utf-8")
    return "guardado en salida/mails (modo demo)"

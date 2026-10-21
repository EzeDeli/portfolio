"""Mail al área responsable cada vez que se crea un ticket.

Con SMTP_HOST configurado lo manda de verdad; si no (modo demo), lo guarda en salida/mails/
como .eml (se abre con Outlook o Thunderbird) y como .html para verlo en el navegador.
Variables: SMTP_HOST, SMTP_PORT, SMTP_USUARIO, SMTP_CLAVE, MAIL_DE.
"""

import html
import os
import smtplib
from email.message import EmailMessage

COLORES = {"urgente": "#b42318", "alta": "#b54708", "media": "#175cd3", "baja": "#067647"}


def armar_html(evento, ticket, responsable):
    color = COLORES.get(ticket["prioridad"], "#175cd3")
    filas = [("Área", responsable["area"]), ("Prioridad", ticket["prioridad"].capitalize()),
             ("Estado", ticket["estado"].capitalize()), ("Detectado", evento["creado_en"]),
             ("Ticket creado", ticket["creado"].replace("T", " "))]
    tabla = "".join(f"<tr><td style='color:#52514e;padding:6px 0;width:130px'>{k}</td>"
                    f"<td style='padding:6px 0'><b>{html.escape(str(v))}</b></td></tr>" for k, v in filas)
    return f"""<!doctype html><html><head><meta charset="utf-8"></head>
<body style="margin:0;background:#f4f4f2;font-family:Segoe UI,Arial,sans-serif;color:#1b1b1b">
<div style="max-width:600px;margin:24px auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e4e3df">
  <div style="background:{color};color:#fff;padding:18px 24px">
    <div style="font-size:13px;opacity:.9">Mesa de ayuda · ticket automático</div>
    <div style="font-size:22px;font-weight:600">#{ticket['id']} · {html.escape(ticket['titulo'])}</div>
  </div>
  <div style="padding:20px 24px;font-size:15px">
    <p style="margin:0 0 16px;line-height:1.5">{html.escape(evento['detalle'])}</p>
    <table style="border-collapse:collapse;font-size:14px">{tabla}</table>
    <p style="font-size:13px;color:#52514e;margin-top:18px">Este aviso lo generó el sistema al detectar el evento. No hace falta cargar nada a mano.</p>
  </div>
</div></body></html>"""


def avisar_ticket(evento, ticket, responsable, carpeta_salida):
    mensaje = EmailMessage()
    mensaje["Subject"] = f"[Ticket #{ticket['id']}] {ticket['titulo']}"
    mensaje["From"] = os.environ.get("MAIL_DE", "mesa-de-ayuda@empresa.com")
    mensaje["To"] = responsable["email"]
    mensaje.set_content(f"{evento['detalle']}\n\nTicket #{ticket['id']} · prioridad {ticket['prioridad']}")
    cuerpo = armar_html(evento, ticket, responsable)
    mensaje.add_alternative(cuerpo, subtype="html")

    if os.environ.get("SMTP_HOST"):
        with smtplib.SMTP(os.environ["SMTP_HOST"], int(os.environ.get("SMTP_PORT", 587)), timeout=30) as smtp:
            smtp.starttls()
            smtp.login(os.environ["SMTP_USUARIO"], os.environ["SMTP_CLAVE"])
            smtp.send_message(mensaje)
        return

    mails = carpeta_salida / "mails"
    mails.mkdir(parents=True, exist_ok=True)
    nombre = f"ticket_{ticket['id']}"
    (mails / f"{nombre}.eml").write_bytes(bytes(mensaje))
    (mails / f"{nombre}.html").write_text(cuerpo, encoding="utf-8")

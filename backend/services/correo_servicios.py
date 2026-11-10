import smtplib
from email.message import EmailMessage
from html import escape
from config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM


#Envía un correo HTML. Si no hay SMTP configurado (desarrollo local), lo imprime en consola
def enviar_correo(destinatario: str, asunto: str, cuerpo_html: str):
    if not SMTP_USER or not SMTP_PASSWORD:
        #flush=True: dentro de Docker la salida queda en buffer y no aparece en los logs
        print(f"[correo] SMTP no configurado. Para: {destinatario} | Asunto: {asunto}\n{cuerpo_html}", flush=True)
        return

    mensaje = EmailMessage()
    mensaje["From"] = SMTP_FROM
    mensaje["To"] = destinatario
    mensaje["Subject"] = asunto
    mensaje.set_content("Abre este correo en un cliente que soporte HTML.")
    mensaje.add_alternative(cuerpo_html, subtype="html")

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as servidor:
            servidor.starttls()
            servidor.login(SMTP_USER, SMTP_PASSWORD)
            servidor.send_message(mensaje)
    except Exception as error:
        #Se corre en segundo plano: no se puede devolver error al cliente, solo se registra
        print(f"[correo] Error enviando correo a {destinatario}: {error}", flush=True)


def plantilla_recuperacion(link: str, nombre: str, minutos: int) -> str:
    return f"""
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #000;">
    <h1>Recuperación de contraseña</h1>
    <p>Hola {escape(nombre)},</p>
    <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente botón para continuar:</p>
    <p>
        <a href="{link}" style="background:#efb60e;color:#000;padding:10px 18px;text-decoration:none;border-radius:6px;font-weight:bold;">
            Restablecer contraseña
        </a>
    </p>
    <p>Este enlace vence en {minutos} minutos y solo se puede usar una vez.</p>
    <p>Si no solicitaste este cambio, ignora este correo; tu contraseña no cambiará.</p>
</body>
</html>
"""

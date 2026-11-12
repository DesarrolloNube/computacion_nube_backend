import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.environ.get("SECRET_KEY", "your_secret_key")
REFRESH_SECRET_KEY = os.environ.get("REFRESH_SECRET_KEY", "your_refresh_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 30

#Recuperación de contraseña
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
RESET_TOKEN_EXPIRE_MINUTES = 30

#Correo (SMTP). Si SMTP_USER no está definido, el link de recuperación se imprime en consola
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")
SMTP_FROM = os.environ.get("SMTP_FROM", SMTP_USER)
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from fastapi import HTTPException, Request, Depends
from passlib.context import CryptContext
from database.db_mysql import get_db
from models.usuarios_modelo import Usuario, RefrescarToken, CreacionUsuario, TokenRecuperacion
from config import SECRET_KEY, REFRESH_SECRET_KEY, ALGORITHM, REFRESH_TOKEN_EXPIRE_DAYS, ACCESS_TOKEN_EXPIRE_MINUTES, FRONTEND_URL, RESET_TOKEN_EXPIRE_MINUTES
from services.correo_servicios import plantilla_recuperacion
from datetime import timedelta
from security import (
    crear_access_token,
    crear_refresh_token,
    hash_refresh_token,
    utc_now,
)

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

TIPO_USUARIO_CLIENTE = 2

#Busca usuario por nombre de la cuenta
def obtener_usuario_por_nombre(db: Session, username: str):
    return db.query(Usuario).filter(Usuario.usuario == username).first()

#Busca usuario por correo
def obtener_usuario_por_correo(db: Session, correo: str):
    return db.query(Usuario).filter(Usuario.correo == correo).first()

#Función para crear usuario. El registro público siempre crea clientes;
#los administradores se crean directamente en la BD
def crear_usuario(db: Session, usuario: CreacionUsuario):
    contrasena_hasheada = pwd_context.hash(usuario.contrasena)
    db_usuario = Usuario(
        primer_nombre= usuario.primer_nombre,
        apellido=usuario.apellido,
        usuario=usuario.usuario,
        correo=usuario.correo,
        contrasena_hash=contrasena_hasheada,
        id_tipo_usuario=TIPO_USUARIO_CLIENTE
    )
    db.add(db_usuario)
    db.commit() # Sin darle commit, ningún dato se salvara en la bd
    db.refresh(db_usuario)
    return db_usuario

#Inicio de sesión
def iniciar_sesion_usuario(
        db: Session,
        usuario: str,
        contrasena: str
):
    usuario_db = (
        db.query(Usuario)
        .filter(Usuario.usuario == usuario)
        .first()
    )

    if not usuario_db:
        return None
    if not pwd_context.verify(
        contrasena,
        usuario_db.contrasena_hash
    ):
        return None
    return usuario_db

#Crear tokens de seguridad para el usuario
def crear_tokens_usuario(db: Session, usuario: Usuario):
    #Elimina tokens preexistentes del usuario
    db.query(RefrescarToken).filter(
        RefrescarToken.user_id == usuario.id
    ).delete(synchronize_session=False)

    access_token = crear_access_token({
        "sub": str(usuario.id),
        "username": usuario.usuario,
        "email": usuario.correo,
        "tipo_usuario": usuario.id_tipo_usuario,
    })

    refresh_token = crear_refresh_token()

    db_refresh = RefrescarToken(
        user_id=usuario.id,
        token=hash_refresh_token(refresh_token),
        expires_at=utc_now() + timedelta(
            days=REFRESH_TOKEN_EXPIRE_DAYS
        ),
    )

    db.add(db_refresh)
    db.commit()

    return access_token, refresh_token

#Genera un token de recuperación y devuelve (correo, asunto, cuerpo) para enviar.
#Devuelve None si el correo no existe; la ruta responde igual en ambos casos para no revelar cuentas
def solicitar_recuperacion(db: Session, correo: str):
    usuario_db = obtener_usuario_por_correo(db, correo)
    if not usuario_db:
        return None

    #Invalida tokens anteriores sin usar, solo el último link enviado sirve
    db.query(TokenRecuperacion).filter(
        TokenRecuperacion.user_id == usuario_db.id,
        TokenRecuperacion.used_at.is_(None),
    ).delete(synchronize_session=False)

    token = crear_refresh_token()
    db.add(TokenRecuperacion(
        user_id=usuario_db.id,
        token_hash=hash_refresh_token(token),
        expires_at=utc_now() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES),
    ))
    db.commit()

    link = f"{FRONTEND_URL}/restablecer-contrasena?token={token}"
    cuerpo = plantilla_recuperacion(link, usuario_db.primer_nombre, RESET_TOKEN_EXPIRE_MINUTES)
    return usuario_db.correo, "Recuperación de contraseña", cuerpo

#Cambia la contraseña si el token es válido. Devuelve False si el token no existe, venció o ya se usó
def restablecer_contrasena(db: Session, token: str, nueva_contrasena: str) -> bool:
    db_token = db.query(TokenRecuperacion).filter(
        TokenRecuperacion.token_hash == hash_refresh_token(token)
    ).first()

    if not db_token or db_token.used_at is not None or db_token.expires_at < utc_now():
        return False

    usuario_db = db.query(Usuario).filter(Usuario.id == db_token.user_id).first()
    if not usuario_db:
        return False

    usuario_db.contrasena_hash = pwd_context.hash(nueva_contrasena)
    db_token.used_at = utc_now()

    #Cierra todas las sesiones abiertas del usuario
    db.query(RefrescarToken).filter(
        RefrescarToken.user_id == usuario_db.id
    ).delete(synchronize_session=False)

    db.commit()
    return True

def cerrar_sesion(db: Session, refresh_token: str | None):
    if not refresh_token:
        return
    #En la BD se guarda el hash del refresh token, no el token en sí
    db_token = db.query(RefrescarToken).filter(
        RefrescarToken.token == hash_refresh_token(refresh_token)
    ).first()
    if db_token:
        db.delete(db_token)
        db.commit()



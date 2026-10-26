from sqlalchemy.orm import Session
from jose import jwt, JWTError
from fastapi import HTTPException, Request, Depends
from passlib.context import CryptContext
from database.db_mysql import get_db
from models.usuarios_modelo import Usuario, RefrescarToken, CreacionUsuario
from config import SECRET_KEY, REFRESH_SECRET_KEY, ALGORITHM, REFRESH_TOKEN_EXPIRE_DAYS, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
from security import (
    crear_access_token,
    crear_refresh_token,
    hash_refresh_token,
    utc_now,
)

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

#Busca usuario por nombre de la cuenta
def obtener_usuario_por_nombre(db: Session, username: str):
    return db.query(Usuario).filter(Usuario.usuario == username).first()

#Función para crear usuario
def crear_usuario(db: Session, usuario: CreacionUsuario):
    contrasena_hasheada = pwd_context.hash(usuario.contrasena)
    db_usuario = Usuario(
        primer_nombre= usuario.primer_nombre,
        apellido=usuario.apellido,
        usuario=usuario.usuario,
        correo=usuario.correo,
        contrasena_hash=contrasena_hasheada,
        id_tipo_usuario=usuario.id_tipo_usuario
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

def cerrar_sesion(db: Session, refresh_token: str | None):
    if refresh_token:
        db_token = db.query(RefrescarToken).filter(RefrescarToken.token == refresh_token).first()
    if (db_token):
        db.delete(db_token)
        db.commit



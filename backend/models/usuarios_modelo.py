from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from database.db_mysql import Base
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from datetime import datetime, timezone

def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

# SQLAlchemy
class Usuario(Base):
    __tablename__="usuarios"

    id=Column(Integer, primary_key=True, index=True)
    primer_nombre=Column(String(100), nullable=False)
    apellido=Column(String(100), nullable=False)
    usuario=Column(String(100), nullable=False, unique=True)
    correo=Column(String(100), nullable=False, unique=True)
    contrasena_hash=Column(String(255), nullable=False)

    id_tipo_usuario=Column(
        Integer,
        ForeignKey("tipos_usuario.id"),
        nullable=False
    )

    created_at=Column(
        DateTime,
        default=utc_now,
        nullable=False
    )

class RefrescarToken(Base):
    __tablename__="refresh_tokens"
 
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    token = Column(String(500), unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)

class TokenRecuperacion(Base):
    __tablename__="password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    token_hash = Column(String(64), unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

class TipoUsuario(Base):
    __tablename__ = "tipos_usuario"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, unique=True)

#Pydantic classes
class CreacionUsuario(BaseModel):
    primer_nombre: str = Field(min_length=1, max_length=100)
    apellido: str = Field(min_length=1, max_length=100)
    usuario: str = Field(min_length=1, max_length=100)
    correo: EmailStr = Field(max_length=100)
    contrasena: str = Field(min_length=8, max_length=128)

#Respuesta del registro: nunca incluye contrasena_hash
class UsuarioRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    primer_nombre: str
    apellido: str
    usuario: str
    correo: str
    id_tipo_usuario: int

class LoginRequest(BaseModel):
    usuario: str
    contrasena: str

class SolicitudRecuperacion(BaseModel):
    correo: EmailStr

class RestablecerContrasena(BaseModel):
    token: str = Field(min_length=1, max_length=500)
    nueva_contrasena: str = Field(min_length=8, max_length=128)
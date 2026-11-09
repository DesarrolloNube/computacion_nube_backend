from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database.db_mysql import Base
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from decimal import Decimal
from security import utc_now

#SQLAlchemy
class Categoria(Base):
    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, index=True)
    nombre_categoria = Column(String(100), nullable=False, unique=True)

    productos = relationship("Producto", back_populates="categoria")

class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True)
    nombre_producto = Column(String(150), nullable=False, index=True)
    descripcion_producto = Column(Text, nullable=True)
    precio_producto = Column(Numeric(12, 2), nullable=False)
    stock_producto = Column(Integer, nullable=False, default=0)
    imagen_producto = Column(String(500), nullable=True)

    id_categoria = Column(
        Integer,
        ForeignKey("categorias.id", ondelete="SET NULL"),
        nullable=True
    )

    activo = Column(Boolean, nullable=False, default=True)

    created_at = Column(
        DateTime,
        default=utc_now,
        nullable=False
    )
    updated_at = Column(
        DateTime,
        default=utc_now,
        onupdate=utc_now,
        nullable=False
    )

    categoria = relationship("Categoria", back_populates="productos")

#Pydantic
class CreacionCategoria(BaseModel):
    nombre_categoria: str = Field(min_length=1, max_length=100)

class CategoriaRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre_categoria: str

class CreacionProducto(BaseModel):
    nombre_producto: str = Field(min_length=1, max_length=150)
    descripcion_producto: str | None = None
    precio_producto: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    stock_producto: int = Field(default=0, ge=0)
    imagen_producto: str | None = Field(default=None, max_length=500)
    id_categoria: int | None = None

class ActualizacionProducto(BaseModel):
    nombre_producto: str | None = Field(default=None, min_length=1, max_length=150)
    descripcion_producto: str | None = None
    precio_producto: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    stock_producto: int | None = Field(default=None, ge=0)
    imagen_producto: str | None = Field(default=None, max_length=500)
    id_categoria: int | None = None
    activo: bool | None = None

class ProductoRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre_producto: str
    descripcion_producto: str | None
    precio_producto: float
    stock_producto: int
    imagen_producto: str | None
    id_categoria: int | None
    categoria: CategoriaRespuesta | None
    activo: bool
    created_at: datetime
    updated_at: datetime

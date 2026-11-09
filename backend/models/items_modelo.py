from sqlalchemy import Column, Integer, String, Text, Numeric, ForeignKey, Table
from sqlalchemy.orm import relationship
from database.db_mysql import Base
from pydantic import BaseModel, ConfigDict, Field
from decimal import Decimal

#SQLAlchemy
producto_tag = Table(
    "producto_tag",
    Base.metadata,
    Column("id_producto", Integer, ForeignKey("producto.id"), primary_key=True),
    Column("id_tag", Integer, ForeignKey("tags.id"), primary_key=True),
)

class Categoria(Base):
    __tablename__ = "categoria"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, unique=True)
    descripcion = Column(Text, nullable=True)

    subcategorias = relationship("Subcategoria", back_populates="categoria")

class Subcategoria(Base):
    __tablename__ = "subcategoria"

    id = Column(Integer, primary_key=True, index=True)
    id_categoria = Column(Integer, ForeignKey("categoria.id"), nullable=False)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)

    categoria = relationship("Categoria", back_populates="subcategorias")
    productos = relationship("Producto", back_populates="subcategoria")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, unique=True)

class Producto(Base):
    __tablename__ = "producto"

    id = Column(Integer, primary_key=True, index=True)
    id_subcategoria = Column(Integer, ForeignKey("subcategoria.id"), nullable=False)
    imagen_producto = Column(String(255), nullable=True)
    nombre_producto = Column(String(255), nullable=False)
    descripcion_producto = Column(Text, nullable=True)
    cantidad_producto = Column(Integer, nullable=False, default=0)
    precio_producto = Column(Numeric(10, 2), nullable=False)

    subcategoria = relationship("Subcategoria", back_populates="productos")
    tags = relationship("Tag", secondary=producto_tag)

#Pydantic
class TagRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str

class CategoriaSimple(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str

class SubcategoriaSimple(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str

class SubcategoriaRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    id_categoria: int
    nombre: str
    descripcion: str | None
    categoria: CategoriaSimple

class CategoriaRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    descripcion: str | None
    subcategorias: list[SubcategoriaSimple]

class CreacionProducto(BaseModel):
    id_subcategoria: int
    nombre_producto: str = Field(min_length=1, max_length=255)
    descripcion_producto: str | None = None
    imagen_producto: str | None = Field(default=None, max_length=255)
    cantidad_producto: int = Field(default=0, ge=0)
    precio_producto: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    tags: list[int] = []

class ActualizacionProducto(BaseModel):
    id_subcategoria: int | None = None
    nombre_producto: str | None = Field(default=None, min_length=1, max_length=255)
    descripcion_producto: str | None = None
    imagen_producto: str | None = Field(default=None, max_length=255)
    cantidad_producto: int | None = Field(default=None, ge=0)
    precio_producto: Decimal | None = Field(default=None, gt=0, max_digits=10, decimal_places=2)
    tags: list[int] | None = None

class ProductoRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    id_subcategoria: int
    nombre_producto: str
    descripcion_producto: str | None
    imagen_producto: str | None
    cantidad_producto: int
    precio_producto: float
    subcategoria: SubcategoriaRespuesta
    tags: list[TagRespuesta]

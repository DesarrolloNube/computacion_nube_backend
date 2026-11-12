from sqlalchemy import Column, Integer, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from database.db_mysql import Base
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from models.items_modelo import Producto
from models.usuarios_modelo import Usuario
from pydantic import BaseModel, Field

class Carrito(Base):
    __tablename__ = "carrito"

    id = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey(Usuario.id))
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    usuario = relationship("Usuario")

class CarritoItem(Base):
    __tablename__ = "carrito_item"

    id_carrito = Column(Integer, ForeignKey("carrito.id"), primary_key=True)
    id_producto = Column(Integer, ForeignKey(Producto.id), primary_key=True)
    cantidad = Column(Integer)

    producto = relationship("Producto")

class AgregarCarritoItem(BaseModel):
    id_producto: int
    cantidad: int = Field(ge=1)

class ActualizarCarritoItem(BaseModel):
    cantidad: int = Field(ge=1) # evita que se elimine numeros negativos o 0


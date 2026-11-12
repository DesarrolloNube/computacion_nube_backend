from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict
from sqlalchemy import (
    Column,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    TIMESTAMP,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.orm import relationship

from database.db_mysql import Base


class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False,
    )
    codigo_retiro = Column(
        String(20),
        unique=True,
        nullable=False,
    )
    fecha = Column(
        TIMESTAMP,
        server_default=func.current_timestamp(),
    )
    estado = Column(
        Enum("pendiente", "confirmado"),
        server_default=text("'pendiente'"),
    )
    total = Column(Numeric(10, 2), nullable=False)

    detalles = relationship(
        "DetallePedido",
        back_populates="pedido",
    )


class DetallePedido(Base):
    __tablename__ = "detalle_pedido"

    id = Column(Integer, primary_key=True, autoincrement=True)
    id_pedido = Column(
        Integer,
        ForeignKey("pedidos.id"),
        nullable=False,
    )
    id_producto = Column(
        Integer,
        ForeignKey("producto.id"),
        nullable=False,
    )
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric(10, 2), nullable=False)

    __table_args__ = (
        UniqueConstraint("id_pedido", "id_producto"),
    )

    pedido = relationship(
        "Pedido",
        back_populates="detalles",
    )


class DetallePedidoRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    id_producto: int
    cantidad: int
    precio_unitario: Decimal


class PedidoRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    id_usuario: int
    codigo_retiro: str
    fecha: datetime
    estado: Literal["pendiente", "confirmado"]
    total: Decimal
    detalles: list[DetallePedidoRespuesta]

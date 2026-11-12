import logging
import secrets
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from models.carrito_modelo import Carrito, CarritoItem
from models.items_modelo import Producto
from models.pedidos_modelo import (
    DetallePedido,
    DetallePedidoRespuesta,
    Pedido,
    PedidoRespuesta,
)
from models.usuarios_modelo import Usuario


logger = logging.getLogger(__name__)

MAX_TOTAL = Decimal("99999999.99")
MAX_INT_MYSQL = 2147483647
MAX_INTENTOS_CODIGO = 3


def _es_clave_duplicada(error: IntegrityError) -> bool:
    argumentos = getattr(error.orig, "args", ())
    return bool(argumentos) and argumentos[0] == 1062


def _insertar_pedido(
    db: Session,
    id_usuario: int,
    total: Decimal,
) -> Pedido:
    for _ in range(MAX_INTENTOS_CODIGO):
        try:
            # El savepoint permite reintentar una colisión del código
            # sin deshacer la transacción completa.
            with db.begin_nested():
                pedido = Pedido(
                    id_usuario=id_usuario,
                    codigo_retiro=secrets.token_hex(10).upper(),
                    estado="pendiente",
                    total=total,
                )
                db.add(pedido)
                db.flush()

            return pedido

        except IntegrityError as error:
            # En este INSERT no enviamos id; según el esquema existente,
            # la única clave única susceptible de colisión es codigo_retiro.
            if not _es_clave_duplicada(error):
                raise

    raise HTTPException(
        status_code=503,
        detail="No se pudo generar el código de retiro. Inténtalo de nuevo.",
    )


def crear_pedido_desde_carrito(
    db: Session,
    id_usuario: int,
) -> PedidoRespuesta:
    try:
        with db.begin():
            # Serializa las compras de este usuario que utilicen
            # este servicio, incluso cuando su carrito ya fue eliminado.
            usuario = (
                db.query(Usuario)
                .filter(Usuario.id == id_usuario)
                .with_for_update()
                .first()
            )

            if usuario is None:
                raise HTTPException(
                    status_code=401,
                    detail="El usuario de la sesión no existe.",
                )

            # Consultamos todos para detectar datos inconsistentes
            # en lugar de comprar silenciosamente uno de varios carritos.
            carritos = (
                db.query(Carrito)
                .filter(Carrito.id_usuario == id_usuario)
                .order_by(Carrito.id)
                .with_for_update()
                .all()
            )

            if not carritos:
                raise HTTPException(
                    status_code=409,
                    detail="El carrito está vacío.",
                )

            if len(carritos) > 1:
                raise HTTPException(
                    status_code=409,
                    detail="El usuario tiene varios carritos. "
                    "No se puede completar la compra.",
                )

            carrito = carritos[0]

            items = (
                db.query(CarritoItem)
                .filter(CarritoItem.id_carrito == carrito.id)
                .order_by(CarritoItem.id_producto)
                .with_for_update()
                .all()
            )

            if not items:
                raise HTTPException(
                    status_code=409,
                    detail="El carrito está vacío.",
                )

            ids_productos = [item.id_producto for item in items]

            productos = (
                db.query(Producto)
                .filter(Producto.id.in_(ids_productos))
                .order_by(Producto.id)
                .with_for_update()
                .all()
            )

            productos_por_id = {
                producto.id: producto
                for producto in productos
            }

            total = Decimal("0.00")
            lineas = []

            for item in items:
                producto = productos_por_id.get(item.id_producto)

                if producto is None:
                    raise HTTPException(
                        status_code=409,
                        detail="Un producto del carrito ya no existe.",
                    )

                if (
                    not isinstance(item.cantidad, int)
                    or item.cantidad < 1
                    or item.cantidad > MAX_INT_MYSQL
                ):
                    raise HTTPException(
                        status_code=409,
                        detail="El carrito contiene una cantidad inválida.",
                    )

                if producto.precio_producto is None:
                    raise HTTPException(
                        status_code=409,
                        detail="Un producto del carrito no tiene precio.",
                    )

                precio = Decimal(str(producto.precio_producto))

                if not precio.is_finite() or precio <= 0:
                    raise HTTPException(
                        status_code=409,
                        detail="Un producto del carrito tiene un precio inválido.",
                    )

                total += precio * item.cantidad
                lineas.append(
                    (item.id_producto, item.cantidad, precio)
                )

            if total > MAX_TOTAL:
                raise HTTPException(
                    status_code=409,
                    detail="El total supera el máximo permitido.",
                )

            pedido = _insertar_pedido(db, id_usuario, total)

            detalles = [
                DetallePedido(
                    id_pedido=pedido.id,
                    id_producto=id_producto,
                    cantidad=cantidad,
                    precio_unitario=precio,
                )
                for id_producto, cantidad, precio in lineas
            ]

            db.add_all(detalles)

            # Verifica la inserción de todos los detalles antes de vaciar.
            # Todavía no hay commit.
            db.flush()
            db.refresh(pedido)

            # Elimina exactamente los ítems procesados.
            for item in items:
                db.delete(item)

            # Respeta el orden de las claves foráneas.
            db.flush()

            db.delete(carrito)
            db.flush()

            # Construimos una respuesta independiente de la sesión.
            # Si su validación falla, también se revierte la transacción.
            respuesta = PedidoRespuesta(
                id=pedido.id,
                id_usuario=pedido.id_usuario,
                codigo_retiro=pedido.codigo_retiro,
                fecha=pedido.fecha,
                estado=pedido.estado,
                total=pedido.total,
                detalles=[
                    DetallePedidoRespuesta.model_validate(detalle)
                    for detalle in detalles
                ],
            )

        # Solo llegamos aquí si el commit de db.begin() fue satisfactorio.
        return respuesta

    except HTTPException:
        raise

    except SQLAlchemyError as error:
        logger.exception("Error al crear el pedido desde el carrito")
        raise HTTPException(
            status_code=500,
            detail="No se pudo completar la compra. "
            "Inténtalo de nuevo.",
        ) from error

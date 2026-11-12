from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.db_mysql import get_db
from models.pedidos_modelo import PedidoRespuesta
from routers.usuarios_route import quien_es
from services.pedidos_servicios import crear_pedido_desde_carrito


router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


@router.post(
    "",
    response_model=PedidoRespuesta,
    status_code=status.HTTP_201_CREATED,
)
def completar_compra(
    usuario=Depends(quien_es),
    db: Session = Depends(get_db),
):
    return crear_pedido_desde_carrito(
        db=db,
        id_usuario=int(usuario["user_id"]),
    )

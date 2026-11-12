from routers.usuarios_route import quien_es
from services.carrito_servicios import obtener_carrito_por_id
from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from database.db_mysql import get_db
from models.carrito_modelo import AgregarCarritoItem, ActualizarCarritoItem
from services.carrito_servicios import agregar_item_carrito, actualizar_item_carrito, eliminar_item
from decimal import Decimal

router = APIRouter(prefix="/carrito")

@router.get("/")
def ver_carrito(usuario = Depends(quien_es), db: Session = Depends(get_db)):
    """
    Consigue los datos del carrillo dependiendo del usuario

    **Valores necesarios:**

    """
    id_usuario = int(usuario["user_id"])
    resultado = obtener_carrito_por_id(db, id_usuario)

    if resultado is None:
        return {"items": [], "total": 0}

    carrito, items = resultado

    lista = []
    total = Decimal("0")
    for i in items:
        subtotal = i.cantidad * i.producto.precio_producto  # use your real price attribute
        total += subtotal
        lista.append({
            "id_producto": i.id_producto,
            "nombre": i.producto.nombre_producto,
            "precio": i.producto.precio_producto,
            "cantidad": i.cantidad,
            "subtotal": subtotal,
        })
    
    return {
        "id": carrito.id,
        "fecha_creacion": carrito.fecha_creacion,
        "items": lista,
        "total": total,
    }

@router.post("/items")
def agregar_item(
    datos: AgregarCarritoItem,
    usuario=Depends(quien_es),
    db: Session = Depends(get_db),
):
    """
    Agrega un producto al carrito del usuario autenticado

    **Valores necesarios:**

    -- ```id_producto```

    -- ```cantidad``` **(mínimo 1)**
    """
    id_usuario = int(usuario["user_id"])
    item = agregar_item_carrito(db, id_usuario, datos)
    return {"id_producto": item.id_producto, "cantidad": item.cantidad}

@router.patch("/items/{id_producto}")
def actualizar_item(
    id_producto: int,
    datos: ActualizarCarritoItem,
    usuario=Depends(quien_es),
    db: Session = Depends(get_db),
):
    """
    Cambia la cantidad de un producto en el carrito

    **Valores necesarios:**

    -- ```id_producto``` **(en la URL)**

    -- ```cantidad``` **(mínimo 1, reemplaza la cantidad actual)**
    """
    id_usuario = int(usuario["user_id"])
    item = actualizar_item_carrito(db, id_usuario, id_producto, datos)
    return {"id_producto": item.id_producto, "cantidad": item.cantidad}

@router.delete("/items/{id_producto}")
def eliminar_item_carrito(
    id_producto: int,
    usuario=Depends(quien_es),
    db: Session = Depends(get_db),
):
    """
    Elimina el producto del catálogo

    """
    id_usuario = int(usuario["user_id"])
    eliminar_item(db, id_usuario, id_producto)
    return {"message": "Ítem eliminado del carrito"}
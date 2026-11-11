from models.carrito_modelo import Carrito, CarritoItem, AgregarCarritoItem, ActualizarCarritoItem
from sqlalchemy.orm import Session
from database.db_mysql import get_db
from fastapi import HTTPException

from models.items_modelo import Producto  

#buscar carrito por usuario
def obtener_carrito_por_id(db: Session, user_id: int):
    carrito = db.query(Carrito).filter(Carrito.id_usuario == user_id).first() # Busca por id

    if not carrito:
        return None # Si no hay carrito existente, no regresa nada

    items = db.query(CarritoItem).filter(CarritoItem.id_carrito == carrito.id).all() #bisca todos los ítems 

    return carrito, items


def agregar_item_carrito(db: Session, id_usuario: int, datos: AgregarCarritoItem):
    producto = db.query(Producto).filter(Producto.id == datos.id_producto).first() #busca si el item existe
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no existe")
    
    carrito = db.query(Carrito).filter(Carrito.id_usuario == id_usuario).first() #Obtiene o usa el caretillo existente
    if not carrito:
        carrito = Carrito(id_usuario=id_usuario)
        db.add(carrito)
        db.flush()  #Asigna carrito.id sin hacer commit todavía

    #Si el producto ya está en el carrito, sumar cantidad; si no, insertar
    item = (
        db.query(CarritoItem)
        .filter(
            CarritoItem.id_carrito == carrito.id,
            CarritoItem.id_producto == datos.id_producto,
        )
        .first()
    )

    if item:
        item.cantidad += datos.cantidad # Suma la cantidad basado en requests 
    else:
        item = CarritoItem(
            id_carrito=carrito.id,
            id_producto=datos.id_producto,
            cantidad=datos.cantidad,
        )
        db.add(item)

    db.commit()
    db.refresh(item)
    return item

#Actualiza cantidad del item en el carillo
def actualizar_item_carrito(
    db: Session, id_usuario: int, id_producto: int, datos: ActualizarCarritoItem
):
    carrito = db.query(Carrito).filter(Carrito.id_usuario == id_usuario).first() #Busca el caretillo del usuario
    if not carrito:
        raise HTTPException(status_code=404, detail="El usuario no tiene carrito")

    item = (
        db.query(CarritoItem)
        .filter(
            CarritoItem.id_carrito == carrito.id,
            CarritoItem.id_producto == id_producto,
        )
        .first() #busca el item por el carrito y el producto
    )

    #Si no existe
    if not item:
        raise HTTPException(status_code=404, detail="Producto no está en el carrito")

    item.cantidad = datos.cantidad
    db.commit()
    db.refresh(item)
    return item


def eliminar_item(
        db: Session,
        id_usuario: int,
        id_producto: int
):
    carrito = db.query(Carrito).filter(Carrito.id_usuario == id_usuario).first()

    if not carrito:
        raise HTTPException(status_code=404, detail="El usuario no tiene carrito")

    item = (
        db.query(CarritoItem)
        .filter(
            CarritoItem.id_carrito == carrito.id,
            CarritoItem.id_producto == id_producto
        )
        .first()
    )

    if not item:
        raise HTTPException(status_code=404, detail="Ítem no encontrado")
    db.delete(item) #elimina el producto
    db.flush()
    
    quedan = db.query(CarritoItem).filter(CarritoItem.id_carrito == carrito.id).count()
    if quedan == 0:
        db.delete(carrito)

    db.commit()
from sqlalchemy import text
from sqlalchemy.orm import Session, joinedload, selectinload
from models.items_modelo import (
    Categoria,
    Subcategoria,
    Tag,
    Producto,
    CreacionProducto,
    ActualizacionProducto,
)

def obtener_categorias(db: Session):
    return (
        db.query(Categoria)
        .options(selectinload(Categoria.subcategorias))
        .order_by(Categoria.nombre)
        .all()
    )

def obtener_subcategorias(db: Session, id_categoria: int | None = None):
    consulta = db.query(Subcategoria).options(joinedload(Subcategoria.categoria))
    if id_categoria is not None:
        consulta = consulta.filter(Subcategoria.id_categoria == id_categoria)
    return consulta.order_by(Subcategoria.nombre).all()

def obtener_subcategoria_por_id(db: Session, id_subcategoria: int):
    return db.query(Subcategoria).filter(Subcategoria.id == id_subcategoria).first()

def obtener_tags(db: Session):
    return db.query(Tag).order_by(Tag.nombre).all()

def obtener_tags_por_ids(db: Session, ids_tags: list[int]):
    return db.query(Tag).filter(Tag.id.in_(ids_tags)).all()

def obtener_productos(
        db: Session,
        id_categoria: int | None = None,
        id_subcategoria: int | None = None,
        id_tag: int | None = None,
        buscar: str | None = None,
        skip: int = 0,
        limit: int = 50,
):
    consulta = db.query(Producto).options(
        joinedload(Producto.subcategoria).joinedload(Subcategoria.categoria),
        selectinload(Producto.tags),
    )

    if id_categoria is not None:
        consulta = consulta.join(Producto.subcategoria).filter(Subcategoria.id_categoria == id_categoria)
    if id_subcategoria is not None:
        consulta = consulta.filter(Producto.id_subcategoria == id_subcategoria)
    if id_tag is not None:
        consulta = consulta.filter(Producto.tags.any(Tag.id == id_tag))
    if buscar:
        consulta = consulta.filter(Producto.nombre_producto.ilike(f"%{buscar}%"))

    return consulta.order_by(Producto.id).offset(skip).limit(limit).all()

def obtener_producto_por_id(db: Session, id_producto: int):
    return (
        db.query(Producto)
        .options(
            joinedload(Producto.subcategoria).joinedload(Subcategoria.categoria),
            selectinload(Producto.tags),
        )
        .filter(Producto.id == id_producto)
        .first()
    )

def crear_producto(db: Session, producto: CreacionProducto, tags: list[Tag]):
    db_producto = Producto(**producto.model_dump(exclude={"tags"}))
    db_producto.tags = tags
    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    return db_producto

def actualizar_producto(db: Session, db_producto: Producto, producto: ActualizacionProducto, tags: list[Tag] | None):
    for campo, valor in producto.model_dump(exclude_unset=True, exclude={"tags"}).items():
        setattr(db_producto, campo, valor)
    if tags is not None:
        db_producto.tags = tags
    db.commit()
    db.refresh(db_producto)
    return db_producto

def producto_tiene_pedidos(db: Session, id_producto: int):
    return db.execute(
        text("SELECT 1 FROM detalle_pedido WHERE id_producto = :id LIMIT 1"),
        {"id": id_producto},
    ).first() is not None

#Se saca de los carritos antes de borrarlo
def eliminar_producto(db: Session, db_producto: Producto):
    db.execute(text("DELETE FROM carrito_item WHERE id_producto = :id"), {"id": db_producto.id})
    db_producto.tags = []
    db.delete(db_producto)
    db.commit()

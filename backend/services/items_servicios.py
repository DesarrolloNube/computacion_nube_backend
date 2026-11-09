from sqlalchemy.orm import Session, joinedload
from models.items_modelo import (
    Categoria,
    Producto,
    CreacionCategoria,
    CreacionProducto,
    ActualizacionProducto,
)

def obtener_categorias(db: Session):
    return db.query(Categoria).order_by(Categoria.nombre_categoria).all()

def obtener_categoria_por_id(db: Session, id_categoria: int):
    return db.query(Categoria).filter(Categoria.id == id_categoria).first()

def obtener_categoria_por_nombre(db: Session, nombre_categoria: str):
    return db.query(Categoria).filter(Categoria.nombre_categoria == nombre_categoria).first()

def crear_categoria(db: Session, categoria: CreacionCategoria):
    db_categoria = Categoria(nombre_categoria=categoria.nombre_categoria)
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria

def obtener_productos(
        db: Session,
        id_categoria: int | None = None,
        buscar: str | None = None,
        skip: int = 0,
        limit: int = 50,
        incluir_inactivos: bool = False
):
    consulta = db.query(Producto).options(joinedload(Producto.categoria))

    if not incluir_inactivos:
        consulta = consulta.filter(Producto.activo == True)
    if id_categoria is not None:
        consulta = consulta.filter(Producto.id_categoria == id_categoria)
    if buscar:
        consulta = consulta.filter(Producto.nombre_producto.ilike(f"%{buscar}%"))

    return consulta.order_by(Producto.id).offset(skip).limit(limit).all()

def obtener_producto_por_id(db: Session, id_producto: int, incluir_inactivos: bool = False):
    consulta = (
        db.query(Producto)
        .options(joinedload(Producto.categoria))
        .filter(Producto.id == id_producto)
    )
    if not incluir_inactivos:
        consulta = consulta.filter(Producto.activo == True)
    return consulta.first()

def crear_producto(db: Session, producto: CreacionProducto):
    db_producto = Producto(**producto.model_dump())
    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    return db_producto

def actualizar_producto(db: Session, db_producto: Producto, producto: ActualizacionProducto):
    for campo, valor in producto.model_dump(exclude_unset=True).items():
        setattr(db_producto, campo, valor)
    db.commit()
    db.refresh(db_producto)
    return db_producto

#Borrado lógico
def desactivar_producto(db: Session, db_producto: Producto):
    db_producto.activo = False
    db.commit()
    db.refresh(db_producto)
    return db_producto

from os import getenv
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from database.db_mysql import get_db
from models.items_modelo import (
    CategoriaRespuesta,
    SubcategoriaRespuesta,
    TagRespuesta,
    CreacionProducto,
    ActualizacionProducto,
    ProductoRespuesta,
)
from services.items_servicios import (
    obtener_categorias,
    obtener_subcategorias,
    obtener_subcategoria_por_id,
    obtener_tags,
    obtener_tags_por_ids,
    obtener_productos,
    obtener_producto_por_id,
    crear_producto,
    actualizar_producto,
    producto_tiene_pedidos,
    eliminar_producto,
)
from config import SECRET_KEY, ALGORITHM

ID_TIPO_USUARIO_ADMIN = int(getenv("ID_TIPO_USUARIO_ADMIN", "1"))

router = APIRouter()

def requiere_admin(request: Request):
    access_token = request.cookies.get("access_token")

    if not access_token:
        raise HTTPException(status_code=401, detail="No hay cookie token de acceso")

    try:
        payload = jwt.decode(
            access_token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido expirado")

    if payload.get("tipo_usuario") != ID_TIPO_USUARIO_ADMIN:
        raise HTTPException(status_code=403, detail="Se requieren permisos de administrador")

    return payload

def validar_subcategoria(db: Session, id_subcategoria: int):
    if not obtener_subcategoria_por_id(db, id_subcategoria):
        raise HTTPException(status_code=400, detail="La subcategoría no existe")

def validar_tags(db: Session, ids_tags: list[int]):
    ids_unicos = set(ids_tags)
    tags = obtener_tags_por_ids(db, list(ids_unicos))
    if len(tags) != len(ids_unicos):
        raise HTTPException(status_code=400, detail="Uno o más tags no existen")
    return tags

@router.get("/categorias", response_model=list[CategoriaRespuesta])
def listar_categorias(db: Session = Depends(get_db)):
    """
    Lista de categorías con sus subcategorías

    **Valores necesarios:**

    - **Ninguno**
    """
    return obtener_categorias(db)

@router.get("/subcategorias", response_model=list[SubcategoriaRespuesta])
def listar_subcategorias(id_categoria: int | None = None, db: Session = Depends(get_db)):
    """
    Lista de subcategorías

    **Valores necesarios:**

    - **Ninguno**

    **Valores opcionales (query):**

    -- ```id_categoria```
    """
    return obtener_subcategorias(db, id_categoria=id_categoria)

@router.get("/tags", response_model=list[TagRespuesta])
def listar_tags(db: Session = Depends(get_db)):
    """
    Lista de tags

    **Valores necesarios:**

    - **Ninguno**
    """
    return obtener_tags(db)

@router.get("/productos", response_model=list[ProductoRespuesta])
def listar_productos(
    id_categoria: int | None = None,
    id_subcategoria: int | None = None,
    id_tag: int | None = None,
    buscar: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Lista de productos

    **Valores necesarios:**

    - **Ninguno**

    **Valores opcionales (query):**

    -- ```id_categoria```

    -- ```id_subcategoria```

    -- ```id_tag```

    -- ```buscar``` **(Busca por nombre del producto)**

    -- ```skip``` **(Por defecto ```0```)**

    -- ```limit``` **(Entre ```1``` y ```100```, por defecto ```50```)**
    """
    return obtener_productos(
        db,
        id_categoria=id_categoria,
        id_subcategoria=id_subcategoria,
        id_tag=id_tag,
        buscar=buscar,
        skip=skip,
        limit=limit,
    )

@router.get("/productos/{id_producto}", response_model=ProductoRespuesta)
def ver_producto(id_producto: int, db: Session = Depends(get_db)):
    """
    Detalle de un producto

    **Valores necesarios:**

    -- ```id_producto``` **(En la ruta)**
    """
    db_producto = obtener_producto_por_id(db, id_producto)
    if not db_producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return db_producto

@router.post("/productos", response_model=ProductoRespuesta, status_code=201)
def registrar_producto(
    producto: CreacionProducto,
    db: Session = Depends(get_db),
    admin: dict = Depends(requiere_admin),
):
    """
    Creación de producto **(Solo administrador)**

    **Valores necesarios:**

    -- ```id_subcategoria```

    -- ```nombre_producto```

    -- ```precio_producto``` **(Mayor a ```0```)**

    **Valores opcionales:**

    -- ```descripcion_producto```

    -- ```imagen_producto```

    -- ```cantidad_producto``` **(Mayor o igual a ```0```, por defecto ```0```)**

    -- ```tags``` **(Lista de ids de tags)**
    """
    validar_subcategoria(db, producto.id_subcategoria)
    tags = validar_tags(db, producto.tags)
    return crear_producto(db=db, producto=producto, tags=tags)

@router.patch("/productos/{id_producto}", response_model=ProductoRespuesta)
def editar_producto(
    id_producto: int,
    producto: ActualizacionProducto,
    db: Session = Depends(get_db),
    admin: dict = Depends(requiere_admin),
):
    """
    Actualización de producto **(Solo administrador)**

    **Valores necesarios:**

    -- ```id_producto``` **(En la ruta)**

    **Valores opcionales (solo se actualizan los que se envíen):**

    -- ```id_subcategoria```

    -- ```nombre_producto```

    -- ```descripcion_producto```

    -- ```imagen_producto```

    -- ```cantidad_producto```

    -- ```precio_producto```

    -- ```tags``` **(Reemplaza la lista completa, ```[]``` los quita todos)**
    """
    db_producto = obtener_producto_por_id(db, id_producto)
    if not db_producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    datos = producto.model_dump(exclude_unset=True)
    for campo in ("id_subcategoria", "nombre_producto", "cantidad_producto", "precio_producto"):
        if campo in datos and datos[campo] is None:
            raise HTTPException(status_code=400, detail=f"El campo {campo} no puede ser nulo")

    if "id_subcategoria" in datos:
        validar_subcategoria(db, datos["id_subcategoria"])
    tags = validar_tags(db, producto.tags) if producto.tags is not None else None

    return actualizar_producto(db=db, db_producto=db_producto, producto=producto, tags=tags)

@router.delete("/productos/{id_producto}")
def borrar_producto(
    id_producto: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(requiere_admin),
):
    """
    Eliminación de producto **(Solo administrador)**

    No se puede eliminar un producto que ya tiene pedidos.

    **Valores necesarios:**

    -- ```id_producto``` **(En la ruta)**
    """
    db_producto = obtener_producto_por_id(db, id_producto)
    if not db_producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if producto_tiene_pedidos(db, id_producto):
        raise HTTPException(status_code=409, detail="El producto tiene pedidos y no se puede eliminar")
    eliminar_producto(db=db, db_producto=db_producto)
    return {"message": "Producto eliminado exitosamente"}

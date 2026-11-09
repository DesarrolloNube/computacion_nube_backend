from os import getenv
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from database.db_mysql import get_db
from models.items_modelo import (
    CreacionCategoria,
    CategoriaRespuesta,
    CreacionProducto,
    ActualizacionProducto,
    ProductoRespuesta,
)
from services.items_servicios import (
    obtener_categorias,
    obtener_categoria_por_id,
    obtener_categoria_por_nombre,
    crear_categoria,
    obtener_productos,
    obtener_producto_por_id,
    crear_producto,
    actualizar_producto,
    desactivar_producto,
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

@router.get("/categorias", response_model=list[CategoriaRespuesta])
def listar_categorias(db: Session = Depends(get_db)):
    """
    Lista de categorías

    **Valores necesarios:**

    - **Ninguno**
    """
    return obtener_categorias(db)

@router.post("/categorias", response_model=CategoriaRespuesta)
def registrar_categoria(
    categoria: CreacionCategoria,
    db: Session = Depends(get_db),
    admin: dict = Depends(requiere_admin),
):
    """
    Creación de categoría **(Solo administrador)**

    **Valores necesarios:**

    -- ```nombre_categoria```
    """
    if obtener_categoria_por_nombre(db, categoria.nombre_categoria):
        raise HTTPException(status_code=400, detail="La categoría ya existe")
    return crear_categoria(db=db, categoria=categoria)

@router.get("/productos", response_model=list[ProductoRespuesta])
def listar_productos(
    id_categoria: int | None = None,
    buscar: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Lista de productos activos

    **Valores necesarios:**

    - **Ninguno**

    **Valores opcionales (query):**

    -- ```id_categoria```

    -- ```buscar``` **(Busca por nombre del producto)**

    -- ```skip``` **(Por defecto ```0```)**

    -- ```limit``` **(Entre ```1``` y ```100```, por defecto ```50```)**
    """
    return obtener_productos(
        db,
        id_categoria=id_categoria,
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

    -- ```nombre_producto```

    -- ```precio_producto``` **(Mayor a ```0```)**

    **Valores opcionales:**

    -- ```descripcion_producto```

    -- ```stock_producto``` **(Mayor o igual a ```0```, por defecto ```0```)**

    -- ```imagen_producto```

    -- ```id_categoria```
    """
    if producto.id_categoria is not None and not obtener_categoria_por_id(db, producto.id_categoria):
        raise HTTPException(status_code=400, detail="La categoría no existe")
    return crear_producto(db=db, producto=producto)

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

    -- ```nombre_producto```

    -- ```descripcion_producto```

    -- ```precio_producto```

    -- ```stock_producto```

    -- ```imagen_producto```

    -- ```id_categoria```

    -- ```activo``` **(```true``` para reactivar un producto)**
    """
    db_producto = obtener_producto_por_id(db, id_producto, incluir_inactivos=True)
    if not db_producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    datos = producto.model_dump(exclude_unset=True)
    for campo in ("nombre_producto", "precio_producto", "stock_producto", "activo"):
        if campo in datos and datos[campo] is None:
            raise HTTPException(status_code=400, detail=f"El campo {campo} no puede ser nulo")

    if datos.get("id_categoria") is not None and not obtener_categoria_por_id(db, datos["id_categoria"]):
        raise HTTPException(status_code=400, detail="La categoría no existe")

    return actualizar_producto(db=db, db_producto=db_producto, producto=producto)

@router.delete("/productos/{id_producto}")
def eliminar_producto(
    id_producto: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(requiere_admin),
):
    """
    Desactivación de producto **(Solo administrador)**

    **Valores necesarios:**

    -- ```id_producto``` **(En la ruta)**
    """
    db_producto = obtener_producto_por_id(db, id_producto)
    if not db_producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    desactivar_producto(db=db, db_producto=db_producto)
    return {"message": "Producto desactivado exitosamente"}

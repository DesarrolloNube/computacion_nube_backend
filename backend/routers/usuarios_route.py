from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session

from database.db_mysql import get_db
from models.usuarios_modelo import ( CreacionUsuario, LoginRequest )
from services.usuarios_servicios import (
    obtener_usuario_por_nombre,
    crear_usuario,
    iniciar_sesion_usuario as autenticar_usuario,
    crear_tokens_usuario,
    cerrar_sesion,
    refrescar_tokens
)
from config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
)
from jose import jwt, JWTError
from config import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/usuarios")



def poner_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # True en producción (HTTPS)
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # True en producción (HTTPS)
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/",
    )

@router.post("/registrar")
def registrar_usuario(usuario: CreacionUsuario, db: Session = Depends(get_db)):
    """
    Creación de usuario

    **Valores necesarios:**

    -- ```primer_nombre```

    -- ```apellido```

    -- ```usuario```

    -- ```correo```

    -- ```contrasena```

    -- ```id_tipo_usario``` **(Solo puede ser ```1``` o ```2```)**
    """
    db_usuario= obtener_usuario_por_nombre(db, username=usuario.usuario)
    #Si el usuario existe
    if (db_usuario):
        raise HTTPException(status_code=400, detail="Usuario o correo ya existe")
    return crear_usuario(db=db, usuario=usuario)

@router.post("/login")
def login( credentials: LoginRequest, response: Response, db: Session = Depends(get_db) ):
    """
    Inicio de sesión de usuario de usuario

    **Valores necesarios:**

    -- ```usuario```

    -- ```contraseña```

    Para mandarlo via postman, usar
    ```
    {
        "usuario": "string",
        "contrasena": "string"
    }
    """
    usuario_db = autenticar_usuario(
        db,
        usuario=credentials.usuario,
        contrasena=credentials.contrasena,
    )

    if usuario_db is None:
        raise HTTPException(
            status_code=401,
            detail="Usuario o contraseña incorrectos",
        )

    access_token, refresh_token = crear_tokens_usuario(
        db, usuario_db
    )

    poner_cookies(response, access_token, refresh_token)

    return {"message": "Inicio de sesión exitoso"}

@router.get("/quien_es")
def quien_es(request: Request):
    """
    Verificación de cookie response

    **Valores necesarios:**

    - **Ninguno**
    """
    access_token = request.cookies.get("access_token")

    if not access_token:
        raise HTTPException(status_code=401, detail="No hay cookie token de acceso")

    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    if payload.get("sub") is None:
        raise HTTPException(status_code=401, detail="Token inválido")

    return {
        "user_id": payload.get("sub"),
        "username": payload.get("username"),
        "email": payload.get("email"),
        "tipo_usuario": payload.get("tipo_usuario"),
    }

@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    """
    Cierre de sesión de usuario

    **Valores necesarios:**

    - **Ninguno**
    """
    refresh_token = request.cookies.get("refresh_token")
    cerrar_sesion(db, refresh_token)

    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token", path="/")

    return { "message": "Sesión cerrada exitosamente"}

@router.post("/refresh")
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    """
    Renueva los tokens usando la cookie refresh_token

    **Valores necesarios:**

    - **Ninguno**
    """
    refresh_token = request.cookies.get("refresh_token")
    access_token, nuevo_refresh = refrescar_tokens(db, refresh_token)
    poner_cookies(response, access_token, nuevo_refresh)
    return {"message": "Tokens renovados"}
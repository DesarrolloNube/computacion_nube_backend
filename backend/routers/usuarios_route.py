from fastapi import APIRouter, Depends, HTTPException, Response, Request, BackgroundTasks
from sqlalchemy.orm import Session

from database.db_mysql import get_db
from models.usuarios_modelo import ( CreacionUsuario, UsuarioRespuesta, LoginRequest, SolicitudRecuperacion, RestablecerContrasena )
from services.usuarios_servicios import (
    obtener_usuario_por_nombre,
    obtener_usuario_por_correo,
    crear_usuario,
    iniciar_sesion_usuario as autenticar_usuario,
    crear_tokens_usuario,
    cerrar_sesion,
    solicitar_recuperacion,
    restablecer_contrasena,
)
from services.correo_servicios import enviar_correo
from config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
)
from jose import jwt, JWTError
from config import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/usuarios")

@router.post("/registrar", response_model=UsuarioRespuesta)
def registrar_usuario(usuario: CreacionUsuario, db: Session = Depends(get_db)):
    """
    Creación de usuario (siempre se crea como cliente, ```id_tipo_usuario = 2```)

    **Valores necesarios:**

    -- ```primer_nombre```

    -- ```apellido```

    -- ```usuario```

    -- ```correo``` **(correo válido)**

    -- ```contrasena``` **(mínimo 8 caracteres)**
    """
    #Si el usuario o el correo ya existen
    if obtener_usuario_por_nombre(db, username=usuario.usuario) or obtener_usuario_por_correo(db, usuario.correo):
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

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # Local HTTP development only
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Set True in HTTPS production
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/",
    )

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
        payload = jwt.decode(
            access_token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido expirado")

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

@router.post("/recuperar-contrasena")
def recuperar_contrasena(datos: SolicitudRecuperacion, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Solicitud de recuperación de contraseña. Envía un link al correo si existe una cuenta asociada

    **Valores necesarios:**

    -- ```correo```

    La respuesta es siempre la misma para no revelar qué correos están registrados
    """
    envio = solicitar_recuperacion(db, datos.correo.strip().lower())
    if envio:
        background_tasks.add_task(enviar_correo, *envio)

    return {"message": "Si existe una cuenta asociada a este correo, recibirás un enlace para restablecer tu contraseña."}

@router.post("/restablecer-contrasena")
def restablecer(datos: RestablecerContrasena, db: Session = Depends(get_db)):
    """
    Restablece la contraseña usando el token recibido por correo

    **Valores necesarios:**

    -- ```token```

    -- ```nueva_contrasena``` **(mínimo 8 caracteres)**
    """
    if not restablecer_contrasena(db, datos.token, datos.nueva_contrasena):
        raise HTTPException(status_code=400, detail="El enlace es inválido o ya venció. Solicita uno nuevo.")

    return {"message": "Contraseña restablecida exitosamente"}

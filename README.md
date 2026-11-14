# Super Ferre — Tienda en línea

 El proyecto basicamente es una tienda en línea para una ferretería: la gente puede ver el catálogo, buscar y filtrar productos, registrarse, agregar cosas al carrito y hacer una compra simulada que genera un código de retiro. También tiene recuperación de contraseña por correo.

El repo tiene dos partes:

- **backend/**: API en FastAPI (Python) que se conecta a una base de datos MySQL en **Google Cloud SQL**.
- **frontend/**: app en React + Vite con Tailwind y DaisyUI.

Las dos corren en contenedores de **Docker** y se levantan juntas con `docker compose`.

---

## Tecnologías

| Parte | Qué usamos |
|---|---|
| Backend | Python 3.14, FastAPI, SQLAlchemy, PyMySQL, python-jose (JWT), passlib + argon2 |
| Base de datos | MySQL en Google Cloud SQL (base `superFerrDB`) |
| Frontend | React 19, Vite, React Router, Axios, Tailwind CSS 4, DaisyUI, lucide-react |
| Imágenes | Bucket de Google Cloud Storage (`se-ferre-bucket`) |
| Infra local | Docker + Docker Compose, Dev Containers de VS Code |
| CI | GitHub Actions (lint y build del frontend) |

---

## Estructura del proyecto

```
.
├── docker-compose.yml          # Levanta frontend y backend 
├── .devcontainer/              # Configuración para abrir el proyecto en Dev Containers
├── .github/workflows/          # CI del frontend
├── backend/
│   ├── main.py                 # Punto de entrada de FastAPI, CORS y routers
│   ├── config.py               # Variables de configuración (tokens, SMTP, etc.)
│   ├── security.py             # Creación de JWT y hash de tokens
│   ├── database/
│   │   ├── db_mysql.py         # Conexión a Cloud SQL
│   │   └── scripts/            # Scripts SQL para crear tablas nuevas
│   ├── models/                 # Modelos de SQLAlchemy y esquemas de Pydantic
│   ├── routers/                # Endpoints (usuarios, productos, carrito, pedidos)
│   ├── services/               # Lógica de negocio y consultas a la BD
│   ├── freeze_script.py        # Actualiza requirements.txt desde el contenedor
│   └── .env.example            # Plantilla de variables de entorno
└── frontend/
    └── src/
        ├── pages/              # Home, productos, carrito, login, registro, recuperar contraseña...
        ├── assets/components/  # Navbar, footer, tarjetas de producto, componentes del home
        ├── context/            # AuthContext (sesión del usuario y contador del carrito)
        └── services/           # Llamadas a la API con Axios
```

---

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y **abierto** (si no está corriendo, `docker compose` no va a funcionar).
- Git.
- Acceso a la instancia de Cloud SQL (host, usuario y contraseña). Esos datos los tiene el equipo, **no están en el repo**.

No hace falta instalar Python ni Node en la máquina, todo corre dentro de los contenedores.

---

## Cómo correr el proyecto

### 1. Clonar el repo

```bash
git clone https://github.com/DesarrolloNube/computacion_nube_backend.git
cd computacion_nube_backend
```

### 2. Crear el archivo `.env` del backend

Copia la plantilla y llena los valores:

```bash
cp backend/.env.example backend/.env
```

| Variable | Para qué sirve |
|---|---|
| `FRONTEND_URL` | URL del frontend. Se usa para CORS y para armar el link de recuperación de contraseña. En local es `http://localhost:5173` |
| `MYSQL_HOST` | IP pública de la instancia de Cloud SQL |
| `MYSQL_PORT` | Normalmente `3306` |
| `MYSQL_DATABASE` | `superFerrDB` |
| `MYSQL_USER` / `MYSQL_PASSWORD` | Usuario de la base de datos |
| `SECRET_KEY` | Llave para firmar los JWT. Cualquier texto largo y aleatorio |
| `REFRESH_SECRET_KEY` | Otra llave aleatoria (opcional, tiene un valor por defecto) |
| `SMTP_*` | Datos del correo para enviar la recuperación de contraseña. Si se dejan vacíos, el link sale en los logs del backend (ver más abajo) |
| `ID_TIPO_USUARIO_ADMIN` | Opcional. Id del tipo de usuario administrador, por defecto `1` |

Para sacar un `SECRET_KEY` rápido:

```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

> **Ojo:** el `.env` está en el `.gitignore`. Nunca se sube al repo.

### 3. Permitir IP en Cloud SQL

El backend se conecta a Cloud SQL por IP pública. Si la base no responde (el backend se queda colgado o tira `Can't connect to MySQL server`), lo más probable es que la IP no esté autorizada.

En la consola de Google Cloud: **SQL → la instancia → Conexiones → Redes → Agregar una red** y se pone la IP pública. Si se cambia de red (casa, U, datos del celular) hay que volver a agregarla.

### 4. Levantar todo con Docker

```bash
docker compose up --build
```

La primera vez tarda un rato porque instala todo. Cuando termine:

| Qué | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:8000 |
| Documentación de la API (Swagger) | http://localhost:8000/docs |

Los dos contenedores tienen *hot reload*: si se cambia código en `backend/` o en `frontend/src/`, se recarga solo, no hay que reiniciar nada.

Para apagar todo:

```bash
docker compose down
```

---

## Comandos útiles

```bash
# Ver los logs del backend (aquí sale el link de recuperación si no hay SMTP)
docker compose logs -f backend

# Correr solo un servicio
docker compose up backend

# Reconstruir después de cambiar requirements.txt o package.json
docker compose up --build -V
```

El `-V` es importante cuando se agregan dependencias nuevas al frontend: `node_modules` vive en un volumen aparte y sin ese flag Docker reutiliza el viejo.

### Agregar una librería de Python

Instalar dentro del contenedor y después actualiza el `requirements.txt` con el script que ya está hecho:

```bash
docker compose exec backend pip install nombre-libreria
docker compose exec backend python freeze_script.py
```

El script no corre fuera de Docker a propósito, para no meter en el `requirements.txt` las librerías de la compu.

### Agregar una librería al frontend

```bash
docker compose exec frontend npm install nombre-libreria
```

Eso actualiza `package.json` y `package-lock.json` en la carpeta local.

---

## Base de datos

La base vive en Cloud SQL, **no hay base local**. Todos los que corren el proyecto se conectan a la misma, así que cuidado con borrar datos.

Las tablas que usa el backend son:

- **Usuarios:** `tipos_usuario`, `usuarios`, `refresh_tokens`, `password_reset_tokens`
- **Catálogo:** `categoria`, `subcategoria`, `tags`, `producto`, `producto_tag`
- **Compras:** `carrito`, `carrito_item`, `pedidos`, `detalle_pedido`

El backend **no crea tablas solo**: tienen que existir en la base. Cuando alguien agrega una tabla nueva, deja el script en `backend/database/scripts/` y hay que correrlo en Cloud SQL (desde Cloud SQL Studio en la consola, MySQL Workbench o la terminal).

Sobre los tipos de usuario:

- `1` = administrador. Puede crear, editar y borrar productos.
- `2` = cliente. Todo el que se registra desde la página queda como cliente.

Los administradores se crean o se cambian directamente en la base, no hay pantalla para eso.

---

## Endpoints principales

Todas las rutas van con el prefijo `/api`. El detalle completo y para probarlas está en http://localhost:8000/docs.

**Usuarios** (`/api/usuarios`)
- `POST /registrar`: crear cuenta
- `POST /login`: iniciar sesión (deja las cookies `access_token` y `refresh_token`)
- `GET /quien_es`: datos del usuario de la sesión actual
- `POST /refresh`: renovar los tokens
- `POST /logout`: cerrar sesión
- `POST /recuperar-contrasena`: pedir el link de recuperación
- `POST /restablecer-contrasena`: cambiar la contraseña con el token del link

**Catálogo**
- `GET /api/categorias`, `GET /api/subcategorias`, `GET /api/tags`
- `GET /api/productos`: acepta filtros `id_categoria`, `id_subcategoria`, `id_tag`, `buscar`, `skip` y `limit`
- `GET /api/productos/{id}`
- `POST`, `PATCH` y `DELETE /api/productos/{id}`: solo administradores

**Carrito** (`/api/carrito`, hay que estar logueado)
- `GET /`: ver el carrito
- `POST /items`: agregar un producto
- `PATCH /items/{id_producto}`: cambiar la cantidad
- `DELETE /items/{id_producto}`: quitar un producto

**Pedidos** (hay que estar logueado)
- `POST /api/pedidos`: convierte el carrito en un pedido, devuelve el código de retiro y vacía el carrito

### Cómo funciona la sesión

El login no devuelve el token en el body, lo guarda en cookies `httponly`. El frontend manda las cookies solo (Axios está configurado con `withCredentials: true`). El access token dura 30 minutos y el refresh token 30 días.

Si se prueba la API con Postman, se hace primero el login y Postman guarda las cookies para las siguientes peticiones.

### Recuperación de contraseña en local

Si no se configuró el correo (`SMTP_USER` vacío), cuando alguien pide recuperar la contraseña el correo **no se envía**: se imprime en los logs del backend. Para ver el link:

```bash
docker compose logs -f backend
```

Buscas la línea que empieza con `[correo]`, copias el link y lo abres en el navegador. El link vence a los 30 minutos y sirve una sola vez.

Si quieres que llegue el correo de verdad con Gmail, hay que usar una [contraseña de aplicación](https://myaccount.google.com/apppasswords), no la contraseña normal de la cuenta.

---

## Dev Containers (opcional)

Si usas VS Code con la extensión **Dev Containers**, puedes abrir el proyecto directamente dentro del contenedor del backend o del frontend (`.devcontainer/backend` o `.devcontainer/frontend`). Ya trae las extensiones de Python o de ESLint/Tailwind según cuál abras, y levanta los demás servicios solo.

---

## CI

Cada push o pull request a `main` corre un workflow de GitHub Actions que instala las dependencias del frontend, corre `npm run lint` y hace el `npm run build`. Si el lint falla, el check queda en rojo, así que conviene correrlo antes de subir:

```bash
docker compose exec frontend npm run lint
```

---

## Problemas comunes

**`failed to connect to the docker API` / `cannot find the file specified`**
Docker Desktop no está abierto. Ábrelo, espera que diga que está corriendo y vuelve a intentar.

**El backend no conecta a la base**
Revisa que el `.env` tenga bien los datos y que tu IP esté autorizada en Cloud SQL (paso 3).

**Errores de CORS en el navegador**
`FRONTEND_URL` en el `.env` tiene que ser exactamente la URL desde donde abres el frontend (`http://localhost:5173`, sin `/` al final).

**El frontend no encuentra una librería que alguien más instaló**
Haz `docker compose up --build -V` para que se reinstalen las dependencias.

**Al cambiar contraseña o pedir el link no pasa nada**
Revisa que exista la tabla `password_reset_tokens` en la base. El script está en `backend/database/scripts/password_reset_tokens.sql`.

**El servicio `db` (Postgres) en el docker-compose**
Es un sobrante de cuando el proyecto usaba Postgres local. El backend ya no lo usa, pero sigue esperando a que arranque antes de levantar. No afecta en nada, solo ocupa el puerto `5433`.

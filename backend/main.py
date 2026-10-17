
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from os import getenv
# from routers import item_routes_postgres

load_dotenv()
app = FastAPI()

FRONTEND_URL = getenv("FRONTEND_URL")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ruta raíz, solo para confirmar que el server está corriendo
@app.get("/")
def read_root():
    return {"message": "Server is running"}
# app.include_router(item_routes_postgres.router, prefix="/api") # Se llama los CRUD via el router desde aquí
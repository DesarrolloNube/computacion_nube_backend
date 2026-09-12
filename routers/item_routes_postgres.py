from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
#from database.db_postgres import get_db # # Dependencia que entrega una sesión de BD por cada request
from models.item_model_postgres import Item, ItemInsert # Se reusa los modelos otra vez
from services.item_services_postgres import create_item

router = APIRouter() # El equivalente al module.exports = router; de NodeJS

@router.post("/items")
def addItem(data: ItemInsert, db: Session = Depends(get_db)): # La función de agregar items usa lo que se manda via el payload y el ItemInsert, y que se necesita una conexión a la BD para funcionar
    return create_item(db, data) # retorna el registro creado, incluyendo el id generado
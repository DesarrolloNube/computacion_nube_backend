from sqlalchemy import Column, String, Integer
# from database.db_postgre import Base # # Clase base para que Item se mapee como tabla
from pydantic import BaseModel
from typing import Optional

class Item(Base):
    __tablename__ = "item"

    id = Column(Integer, primary_key=True)
    name= Column(String)
    description = Column(String)

# Pydantic se encarga de manejar los modelos CRUD
class ItemInsert(BaseModel):
    name: str
    description: str


class ItemPatch(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
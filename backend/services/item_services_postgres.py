# from models.item_model_postgres import Item, ItemInsert
# from sqlalchemy.orm import Session

# # db es la sesión de la BD que se usa para insertar el nuevo registro
# def create_item(db: Session, data: ItemInsert):
#     # crea nueva instancia de modelo de SQLAlchemy (en memoria, no en la bd)
#     new_entry = Item(
#         name= data.name,
#         description = data.description
#     )

#     db.add(new_entry) # Inicia el proceso de inserción
#     db.commit() # Escribe la información a la BD
#     # Refresca el valor new_entry para que agarre 
#     # los valores generados por el servidor, 
#     # como autoincrement ID
#     db.refresh(new_entry) 
#     return new_entry # regresa el nuevo row en la BD
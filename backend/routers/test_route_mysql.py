from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.db_mysql import get_db

router = APIRouter()

@router.get("/test")
def get_test(db: Session = Depends(get_db)):
    # Return get all test items
    return db.query(Item).all()
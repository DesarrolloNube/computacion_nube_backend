from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from database.db_mysql import Base
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class Test(Base):
    __tablename__ = "users"

    id=Column(Integer, primary_key=True, index=True)
    username=Column(String(50), unique=True, nullable=False, index=True)
    first_name=Column(String(50), nullable=False)
    last_name=Column(String(50), nullable=True)
    dob=Column(DateTime(timezone=True), nullable=False)

class CreateTest(BaseModel):
    username: str
    first_name: str
    last_name: str
    dob: datetime    
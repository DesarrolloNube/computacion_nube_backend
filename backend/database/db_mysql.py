import pymysql.cursors
from os import getenv

from dotenv import load_dotenv
from sqlalchemy import URL, create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DB_HOST = getenv("MYSQL_HOST", "localhost")
DB_PORT = int(getenv("MYSQL_PORT", "3306"))
DB_NAME = getenv("MYSQL_DATABASE", "db")
DB_USER = getenv("MYSQL_USER", "user")
DB_PASSWORD = getenv("MYSQL_PASSWORD", "passwd")

DATABASE_URL = URL.create(
    drivername="mysql+pymysql",
    username=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT,
    database=DB_NAME,
    query={"charset": "utf8mb4"},
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=1800,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
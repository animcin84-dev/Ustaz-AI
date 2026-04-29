from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./ustaz.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Integer, default=1)
    preferences = Column(Text, default='{"theme": "dark", "language": "ru", "notifications": true}')

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    class_name = Column(String)
    teacher_id = Column(Integer) # Link to User

class Grade(Base):
    __tablename__ = "grades"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer)
    subject = Column(String)
    sor1 = Column(Integer, default=0)
    sor2 = Column(Integer, default=0)
    soch = Column(Integer, default=0)
    term = Column(Integer)
    year = Column(String)

class ArchiveEntry(Base):
    __tablename__ = "archive"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer) # Link to User
    content = Column(Text)
    metadata_json = Column(Text) # For "vector" simulation
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

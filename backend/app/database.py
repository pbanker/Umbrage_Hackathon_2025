from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.config import settings

# Create SQLAlchemy engine
engine = create_engine(settings.DATABASE_URI)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for database models
Base = declarative_base()

# Initialize pgvector extension
def init_db():
    from sqlalchemy import text
    with engine.connect() as conn:
        # Create the pgvector extension if it doesn't exist
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.commit()

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
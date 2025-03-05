from sqlalchemy import JSON, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from pgvector.sqlalchemy import Vector

from app.database import Base

class SlideMetadata(Base):
    __tablename__ = "slide_metadata"
    
    id = Column(Integer, primary_key=True, index=True)
    presentation_id = Column(Integer, ForeignKey("presentations.id"))
    title = Column(String)
    category = Column(String) # i.e. "timelines"
    slide_type = Column(String) #i.e. "gantt-chart"
    purpose = Column(String) # i.e. "to show the timeline of the project"
    tags = Column(JSON)  # Array of strings
    audience = Column(String) # i.e. "engineering team"
    sales_stage = Column(String) # i.e. "discovery"
    embedding = Column(Vector(1536))  # OpenAI embedding for semantic search
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    content_mapping = Column(JSON)  # Defines structure for content replacement

    presentation = relationship("PresentationMetadata", back_populates="slides")

class PresentationMetadata(Base):
    __tablename__ = "presentations"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    storage_path = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    slides = relationship("SlideMetadata", back_populates="presentation", cascade="all, delete-orphan")
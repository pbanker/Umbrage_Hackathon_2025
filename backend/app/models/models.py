from sqlalchemy import JSON, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from pgvector.sqlalchemy import Vector

from app.database import Base

class SlideTemplate(Base):
    __tablename__ = "slide_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    slide_id = Column(String, unique=True, index=True)  # Original PowerPoint slide ID if available
    title = Column(String)
    content_data = Column(JSON)  # Stores the actual slide content/structure
    content_embedding = Column(Vector(1536))  # OpenAI embeddings dimension
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    slide_metadata = relationship("SlideMetadata", back_populates="slide", uselist=False, cascade="all, delete-orphan")
    presentations = relationship("PresentationSlide", back_populates="slide_template")

class SlideMetadata(Base):
    __tablename__ = "slide_metadata"
    
    id = Column(Integer, primary_key=True, index=True)
    slide_id = Column(Integer, ForeignKey("slide_templates.id"), unique=True)
    category = Column(String) # i.e. "timelines"
    slide_type = Column(String) #i.e. "gantt-chart"
    purpose = Column(String) # i.e. "to show the timeline of the project"
    tags = Column(JSON)  # Array of strings
    audience = Column(String) # i.e. "engineering team"
    sales_stage = Column(String) # i.e. "discovery"
    content_schema = Column(JSON)  # Defines structure for content replacement
    purpose_embedding = Column(Vector(1536))  # OpenAI embeddings dimension
    
    slide = relationship("SlideTemplate", back_populates="slide_metadata")

class Presentation(Base):
    __tablename__ = "presentations"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    client_name = Column(String)
    industry = Column(String) # i.e. "Oil and Gas"
    outline = Column(JSON)  # Stores the generated outline
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    slides = relationship("PresentationSlide", back_populates="presentation", cascade="all, delete-orphan")

class PresentationSlide(Base):
    __tablename__ = "presentation_slides"
    
    id = Column(Integer, primary_key=True, index=True)
    presentation_id = Column(Integer, ForeignKey("presentations.id"))
    slide_template_id = Column(Integer, ForeignKey("slide_templates.id"))
    section = Column(String)  # Which outline section this belongs to (i.e. "Introduction", "Body", "Conclusion")
    position = Column(Integer)  # Position in the presentation (i.e. 1, 2, 3, etc.)
    content_data = Column(JSON)  # The populated content
    
    presentation = relationship("Presentation", back_populates="slides")
    slide_template = relationship("SlideTemplate", back_populates="presentations")
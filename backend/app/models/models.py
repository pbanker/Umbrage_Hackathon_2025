from sqlalchemy import JSON, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from pgvector.sqlalchemy import Vector

from app.database import Base

class SlideMetadata(Base):
    __tablename__ = "slide_metadata"
    
    id = Column(Integer, primary_key=True, index=True)
    slide_number = Column(Integer)
    presentation_id = Column(Integer, ForeignKey("presentations.id"))
    title = Column(String)
    category = Column(String) # i.e. "timelines"
    slide_type = Column(String) #i.e. "gantt-chart"
    purpose = Column(String) # i.e. "to show the timeline of the project"
    tags = Column(JSON)  # Array of strings
    audience = Column(String) # i.e. "engineering team"
    sales_stage = Column(String) # i.e. "discovery"
    embedding = Column(Vector(1536))  # OpenAI embedding for semantic search
    image_path = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    content_mapping = Column(JSON)  # Defines structure for content replacement

    presentation = relationship("PresentationMetadata", back_populates="slides")
    shapes = relationship("SlideShape", back_populates="slide_metadata", cascade="all, delete-orphan")  

class PresentationMetadata(Base):
    __tablename__ = "presentations"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    storage_path = Column(String)
    number_of_slides = Column(Integer)
    image_path = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    slides = relationship("SlideMetadata", back_populates="presentation", cascade="all, delete-orphan")


class SlideShape(Base):
    __tablename__ = "slide_shapes"

    id = Column(Integer, primary_key=True, index=True)
    slide_metadata_id = Column(Integer, ForeignKey("slide_metadata.id"), nullable=False)  # Link to SlideMetadata
    shape_index = Column(Integer, nullable=False)  # Shape index within slide
    shape_type = Column(String, nullable=False)  # TEXT_BOX, AUTO_SHAPE, PICTURE, etc.
    text_content = Column(String, nullable=True)  # Extracted text from the shape

    slide_metadata = relationship("SlideMetadata", back_populates="shapes")  
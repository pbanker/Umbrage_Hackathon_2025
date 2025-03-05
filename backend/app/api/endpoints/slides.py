from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas import schemas
from app.database import get_db
from app.models.models import PresentationMetadata, SlideMetadata
from app.utils.openai import get_embedding
import json

router = APIRouter()

@router.get("/slides/{presentation_id}", response_model=List[schemas.SlideMetadata])
async def get_slides(
    presentation_id: int,
    db: Session = Depends(get_db)
):
    """Get all slide metadata for a presentation"""
    presentation = db.query(PresentationMetadata).filter(PresentationMetadata.id == presentation_id).first()
    return presentation.slides



@router.put("/slides/metadata/{slide_metadata_id}")
async def update_slide_metadata(
    slide_metadata_id: int,
    metadata: schemas.SlideMetadataUpdate,
    db: Session = Depends(get_db)
):
    """Update metadata for the specific slide"""
    slide = db.query(SlideMetadata).filter(SlideMetadata.id == slide_metadata_id).first()
    for field, value in metadata.model_dump().items():
        setattr(slide, field, value)
    
    # Update the embedding with the new metadata
    semantic_content = {
        "title": slide.title,
        "purpose": slide.purpose,
        "category": slide.category,
        "tags": slide.tags,
        "audience": slide.audience,
        "sales_stage": slide.sales_stage
    }
    stringified_metadata = json.dumps(semantic_content)
    slide.embedding = get_embedding(stringified_metadata)
    db.commit()
    return slide
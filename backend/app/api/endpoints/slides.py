from fastapi import APIRouter, Form, UploadFile, File, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas import schemas
from app.database import get_db
from app.utils.pptx_parsing import process_powerpoint_repository
from app.models.models import PresentationMetadata, SlideMetadata
from app.utils.openai import get_embedding
import json

router = APIRouter()

@router.post("/slides/repository/upload")
async def upload_slide_repository(
    file: UploadFile = File(...),
    title: str | None = Form(None),
    db: Session = Depends(get_db)
):
    """Upload a PowerPoint file to create/update the slide repository and presentation metadata as well as the slide metadata, embedding of metadata, and content schema"""

    storage_path, slide_metadata_objects = await process_powerpoint_repository(
        file.file, 
        db, 
        source_type="upload"
    )

    # Create presentation metadata
    presentation_title = title or "Untitled Slide Repository"
    presentation = PresentationMetadata(storage_path=storage_path, title=presentation_title)
    db.add(presentation)
    db.flush()
    
    # Associate slides with presentation and add to database
    for metadata in slide_metadata_objects:
        metadata.presentation_id = presentation.id
        db.add(metadata)
    
    db.commit()
    
    return {
        "message": f"Successfully processed {len(slide_metadata_objects)} slides",
        "storage_path": storage_path,
        "presentation_id": presentation.id
    }



@router.get("/slides/metadata/{presentation_id}", response_model=List[schemas.SlideMetadata])
async def get_slides(
    presentation_id: int,
    db: Session = Depends(get_db)
):
    """Get all slide metadata for a presentation"""
    presentation = db.query(PresentationMetadata).filter(PresentationMetadata.id == presentation_id).first()
    return presentation.slides



@router.put("/slides/metadata/{id}")
async def update_slide_metadata(
    id: int,
    metadata: schemas.SlideMetadataUpdate,
    db: Session = Depends(get_db)
):
    """Update metadata for the specific slide"""
    slide = db.query(SlideMetadata).filter(SlideMetadata.id == id).first()
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



# @router.post("/slides/repository/sync")
# async def sync_slide_repository(
#     file_id: str,
#     db: Session = Depends(get_db)
# ):
#     """Sync with the PowerPoint file in Microsoft 365"""
    # result = await utils.slide_repository.sync_repository(file_id, db)
    # return result
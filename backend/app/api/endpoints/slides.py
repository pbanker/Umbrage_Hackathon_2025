from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas import schemas
from app.database import get_db

router = APIRouter()

# Slide Repository Management
@router.post("/slides/repository/upload")
async def upload_slide_repository(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a PowerPoint file to create/update the slide repository"""
    # result = await utils.slide_repository.process_repository_upload(file, db)
    # return result

@router.post("/slides/repository/sync")
async def sync_slide_repository(
    file_id: str,
    db: Session = Depends(get_db)
):
    """Sync with the PowerPoint file in Microsoft 365"""
    # result = await utils.slide_repository.sync_repository(file_id, db)
    # return result

@router.get("/slides", response_model=List[schemas.SlideTemplate])
async def get_slides(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """Get all slide templates"""
    # return utils.slide_repository.get_slides(db, skip, limit)

@router.put("/slides/{slide_id}/metadata")
async def update_slide_metadata(
    slide_id: int,
    metadata: schemas.SlideMetadataUpdate,
    db: Session = Depends(get_db)
):
    """Update metadata for a specific slide"""
    # return await utils.slide_repository.update_metadata(slide_id, metadata, db)
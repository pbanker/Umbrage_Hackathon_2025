from fastapi import APIRouter, Form, UploadFile, File, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas import schemas
from app.database import get_db
from app.utils.pptx_parsing import process_powerpoint_repository, retrieve_shape_and_content
from app.models.models import PresentationMetadata

router = APIRouter()

@router.post("/repository/upload")
async def upload_repository(
    file: UploadFile = File(...),
    title: str | None = Form(None),
    db: Session = Depends(get_db)
):
    """Upload a PowerPoint file to create/update the slide repository and presentation metadata as well as the slide metadata, embedding of metadata, and content schema"""

    storage_path, slide_metadata_objects, image_paths = await process_powerpoint_repository(
        file.file, 
        db, 
        source_type="upload"
    )

    # Create presentation metadata
    presentation_title = title or "Untitled Slide Repository"
    presentation = PresentationMetadata(
        storage_path=storage_path,
        title=presentation_title,
        number_of_slides=len(slide_metadata_objects),
        image_path=image_paths[0] if image_paths else None  # Use first slide's image
    )
    db.add(presentation)
    db.flush()
    
    # Associate slides with presentation and add to database
    for metadata in slide_metadata_objects:
        metadata.presentation_id = presentation.id
        db.add(metadata)

    shapes_and_content = retrieve_shape_and_content(storage_path)
    db.add_all(shapes_and_content)
    db.flush()
    
    db.commit()


    
    return {
        "message": f"{len(slide_metadata_objects)} slides processed successfully",
        "storage_path": storage_path,
        "presentation_id": presentation.id
    }



@router.get("/repositories", response_model=List[schemas.PresentationMetadata])
async def get_repositories(
    db: Session = Depends(get_db)
):
    """Get all presentation metadata"""
    presentations = db.query(PresentationMetadata).all()
    return presentations



# @router.get("/repository/metadata/{presentation_id}", response_model=schemas.PresentationMetadata)
# async def get_repository_metadata(
#     presentation_id: int,
#     db: Session = Depends(get_db)
# ):
#     """Get presentation metadata"""
#     presentation = db.query(PresentationMetadata).filter(PresentationMetadata.id == presentation_id).first()
#     return presentation



# @router.post("/repository/sync")
# async def sync_slide_repository(
#     file_id: str,
#     db: Session = Depends(get_db)
# ):
#     """Sync with the PowerPoint file in Microsoft 365"""
    # result = await utils.slide_repository.sync_repository(file_id, db)
    # return result
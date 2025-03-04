from app.schemas import schemas
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database  import get_db


router = APIRouter()

@router.post("/completions/generate-outline", response_model=schemas.PresentationOutline)
async def generate_outline(
    input_data: schemas.PresentationInput,
    db: Session = Depends(get_db)
):
    """Generate presentation outline from user input"""
    # outline = await presentation_generator.generate_outline(input_data)
    # return outline

@router.post("/completions/generate-slides", response_model=schemas.PresentationWithSlides)
async def generate_slides(
    outline_data: schemas.PresentationOutline,
    db: Session = Depends(get_db)
):
    """Select slides and generate content based on outline"""
    # slides = await presentation_generator.generate_slides(outline_data, db)
    # return slides
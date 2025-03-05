from app.schemas import schemas
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.database  import get_db
from app.models.models import PresentationMetadata
from app.utils.pptx_construction import construct_presentation, generate_presentation_outline, find_matching_slides, generate_slide_content, modify_ppt_text
from pathlib import Path
from datetime import datetime
import logging
import json
import shutil
import os

# Set up logging
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

# Create a logger for this module
logger = logging.getLogger("presentation_generation")
logger.setLevel(logging.DEBUG)

# Create handlers
file_handler = logging.FileHandler(log_dir / "presentation_generation.log")
file_handler.setLevel(logging.DEBUG)

# Create formatters and add it to handlers
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)

# Add handlers to the logger
logger.addHandler(file_handler)

router = APIRouter()

@router.post("/completions/generate-presentation", response_model=schemas.PresentationWithSlides)
async def generate_presentation(
    input_data: schemas.PresentationInput,
    db: Session = Depends(get_db)
):
    """Generate a complete presentation based on input requirements"""
    
    logger.info(f"Starting presentation generation for {input_data.title}")
    logger.debug(f"Input data: {json.dumps(input_data.model_dump(), indent=2)}")
    
    try:
        # 1. Generate presentation outline
        logger.info("Generating presentation outline...")
        outline = await generate_presentation_outline(input_data)
        logger.debug(f"Generated outline: {json.dumps([o.model_dump() for o in outline], indent=2)}")
        
        # 2. Find matching slides from repository
        logger.info("Finding matching slides...")
        matched_slides = await find_matching_slides(outline, db)
        logger.debug(f"Found {len(matched_slides)} matching slides")
        logger.debug(f"Matched slides: {[{'id': s.id, 'title': s.title, 'type': s.slide_type} for s in matched_slides]}")
        
        # 3. Generate content for selected slides
        logger.info("Generating slide content...")
        slide_content = await generate_slide_content(matched_slides, outline, input_data)
        logger.debug(f"Generated content: {json.dumps(slide_content, indent=2)}")
        
        # 4. Create output directory if it doesn't exist
        output_dir = Path("presentation_output")
        output_dir.mkdir(exist_ok=True)
        
        # 5. Generate output path
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = output_dir / f"presentation_{timestamp}.pptx"
        logger.info(f"Will save presentation to: {output_path}")
        
        # 6. Get template path from first slide's presentation
        template_presentation = db.query(PresentationMetadata).filter(
            PresentationMetadata.id == matched_slides[0].presentation_id
        ).first()
        logger.debug(f"Using template from: {template_presentation.storage_path}")
        
        # 7. Construct the final presentation
        logger.info("Constructing final presentation...")
        construct_presentation(
            template_path=template_presentation.storage_path,
            output_path=str(output_path),
            slide_data=slide_content
        )
        logger.info("Presentation construction complete")
        
        # 8. Create and return presentation object
        response = {
            "id": 0,  # You might want to save this to the database and get a real ID
            "title": input_data.title,
            "client_name": input_data.client_name,
            "industry": input_data.industry,
            "outline": {"sections": [s.dict() for s in outline]},
            "created_at": datetime.now(),
            "slides": slide_content
        }
        logger.info("Presentation generation completed successfully")
        return response
        
    except Exception as e:
        logger.error(f"Error generating presentation: {str(e)}", exc_info=True)
        raise
    
@router.post("/completions/modify_pptx_slide")
async def modify_ppt(
    file: UploadFile = File(...),
    replacements: str = Form(...),
    output_path: str = Form(...)
):
    """
    API Endpoint to modify PowerPoint text.
    Requires a file upload and JSON-formatted replacements.
    """
    if not file.filename.endswith(".pptx"):
        raise HTTPException(status_code=400, detail="Only PPTX files are supported.")
    
    UPLOAD_DIR = "uploads"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    result = None

    try:
        replacements_dict = json.loads(replacements)
        result = modify_ppt_text(file_path, replacements_dict, output_path)

    except Exception as e:
         HTTPException(status_code=500, detail=str(e))

    finally:
        os.remove(file_path)
        try:
            os.rmdir(UPLOAD_DIR) 
        except OSError:
            pass 

    return result
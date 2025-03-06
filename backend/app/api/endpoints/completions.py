import os
import shutil
from app.schemas import schemas
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.database  import get_db
from app.models.models import PresentationMetadata, SlideShape
from app.utils.pptx_construction import generate_presentation_outline, modify_ppt_text, getOriginals, generate_slide_content_remix, construct_presentation_remix, find_matching_slides_remix
from pathlib import Path
from datetime import datetime
import logging
import json
from fastapi.responses import FileResponse

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

@router.post("/completions/generate-presentation")
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

        matched_slides_n_ids = await find_matching_slides_remix(outline, db)
        matched_slides = [matched_slide for matched_slide, _ in matched_slides_n_ids] #Just the slides (SlideMetadata objects)
        
        original_project = db.query(PresentationMetadata).filter(PresentationMetadata.id == matched_slides[0].presentation_id).first()
        path_of_original_project = original_project.storage_path

        slide_metadata_ids = [slide.id for slide in matched_slides]  # Extract all slide IDs

        if slide_metadata_ids: 
            original_slides_content = (
            db.query(SlideShape.slide_metadata_id, SlideShape.shape_type, SlideShape.text_content)
            .filter(SlideShape.slide_metadata_id.in_(slide_metadata_ids))
            .all()
)
        else:
            original_slides_content = []  # Return an empty list if no matches


        logger.debug(f"Found {len(matched_slides)} matching slides")
        logger.debug(f"Matched slides: {[{'id': s.id, 'title': s.title, 'type': s.slide_type} for s in matched_slides]}")
        
        # 3. Generate content for selected slides
        logger.info("Generating slide content...")
        slide_content = await generate_slide_content_remix(matched_slides, outline, input_data, original_slides_content)
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
        result = construct_presentation_remix(
            path_of_original_project,
            output_path=str(output_path),
            slide_data=slide_content
        )
        logger.info(f"Presentation result {result}")
        
        # return the file with appropriate headers
        return FileResponse(
            path=str(output_path),
            filename=f"{input_data.title.replace(' ', '_')}.pptx",
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
        )
        
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
         return HTTPException(status_code=500, detail=str(e))
         
    finally:
        os.remove(file_path)
        try:
            os.rmdir(UPLOAD_DIR) 
        except OSError:
            pass 

    return result


@router.post("/duplicate-pptx/")
async def process_pptx():
    """
    Process a PPTX file to create a new PPTX with duplicated slides.
    Uses hardcoded paths and settings:
    - Input path: backend/slides_repository
    - Output directory: presentation_output
    - Duplication interval: 2 (every other slide); **Could add any logic to this step i.e. content swap
    
    Returns:
        FileResponse: The processed PPTX file
    """
    # Hardcoded values with correct path
    file_path = Path("slides_repository")  # Relative to backend directory
    duplication_interval = 2
    try:
        # Find the first PPTX file in the source directory
        source_files = list(file_path.glob("*.pptx"))
        if not source_files:
            raise HTTPException(status_code=404, detail=f"No PPTX files found in {file_path}")
        
        source_file = source_files[0]
        logger.info(f"Processing file: {source_file}")
        
        output_dir = Path("presentation_output")
        output_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"duplicated_{timestamp}.pptx"
        output_path = output_dir / output_filename
        
        # First, copy the entire file
        shutil.copy2(source_file, output_path)
        
        # Then open the copied file and modify it
        prs = Presentation(output_path)
        
        # Create list of slide indices to keep (only every other slide)
        slides_to_keep = list(range(0, len(prs.slides), duplication_interval))
        logger.info(f"Keeping slides at indices: {slides_to_keep}")
        
        # Remove slides that aren't in our keep list
        # We need to remove from end to start to avoid index shifting
        for i in range(len(prs.slides) - 1, -1, -1):
            if i not in slides_to_keep:
                xml_slides = prs.slides._sldIdLst
                xml_slides.remove(xml_slides[i])
        
        prs.save(output_path)
        
        return FileResponse(
            path=str(output_path),
            filename=output_filename,
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
        )
    
    except Exception as e:
        logger.error(f"Error processing PPTX: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing PPTX: {str(e)}")
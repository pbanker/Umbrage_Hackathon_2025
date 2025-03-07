from datetime import datetime
import time
from http.client import HTTPException
import os
import shutil
from typing import List, Tuple
from pptx import Presentation
from copy import deepcopy
from pptx.enum.shapes import MSO_SHAPE_TYPE, PP_PLACEHOLDER, MSO_SHAPE_TYPE, MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.util import Pt
from pptx.shapes.placeholder import SlidePlaceholder
from app.schemas import schemas
from app.models.models import SlideMetadata
from app.utils.openai import get_completion, get_formatted_completion, get_embedding
from sqlalchemy.orm import Session
import json
import numpy as np
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

async def generate_presentation_outline(input_data: schemas.PresentationInput) -> List[schemas.SlideOutline]:
    """Generate a structured outline based on presentation input"""
    system_prompt = """You are an expert presentation designer. Generate a presentation outline in a structured format.
    The response should be a JSON object with a 'slides' array containing the outline sections.
    
    Example output for a presentation with "Number of Slides: 5":
    {
        "slides": [
            {
                "slide_number": 1,
                "section": "introduction",
                "description": "Company introduction with focus on enterprise software expertise",
                "keywords": ["company", "introduction", "expertise", "enterprise"]
            },
            {
                "slide_number": 2,
                "section": "problem",
                "description": "Common challenges faced by enterprises with legacy systems integration",
                "keywords": ["challenges", "pain points", "legacy", "integration"]
            },
            {
                "slide_number": 3,
                "section": "solution",
                "description": "Our approach to modernizing enterprise applications while maintaining business continuity",
                "keywords": ["solution", "modernization", "continuity", "approach"]
            },
            {
                "slide_number": 4,
                "section": "timeline",
                "description": "Proposed implementation timeline for client project",
                "keywords": ["timeline", "implementation", "schedule", "phases"]
            },
            {
                "slide_number": 5,
                "section": "next_steps",
                "description": "Recommended action items to move forward with the engagement",
                "keywords": ["next steps", "action", "engagement", "proposal"]
            }
        ]
    }
    """
    
    user_prompt = f"""Create a presentation outline for:
    Title: {input_data.title}
    Client: {input_data.client_name}
    Industry: {input_data.industry}
    Description: {input_data.description}
    Target Audience: {input_data.target_audience}
    Key Messages: {', '.join(input_data.key_messages)}
    Number of Slides: {input_data.num_slides or '8-12'}
    Tone: {input_data.tone or 'Professional'}
    Additional Context: {input_data.additional_context or 'N/A'}"""

    response = await get_formatted_completion(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        format_model=schemas.PresentationOutlineResponse
    )
    
    # Convert to SlideOutline objects with validation
    return [schemas.SlideOutline(**slide.model_dump()) for slide in response.slides]

async def find_matching_slides_remix(
    outline: List[schemas.SlideOutline], 
    db: Session,
    similarity_threshold: float = 0.7
) -> List[Tuple[SlideMetadata, int]]:
    """Find the best matching slides for each outline section using semantic search"""
    matched_slides = []
    used_slide_ids = set()  # Track already matched slide IDs
    
    for section in outline:
        search_content = {
            "section": section.section,
            "description": section.description,
            "keywords": section.keywords
        }
        search_embedding = await get_embedding(json.dumps(search_content))
        
        slides = db.query(SlideMetadata).all()
        best_match = None
        best_similarity = -1
        
        for slide in slides:
            if slide.embedding is None or slide.id in used_slide_ids:
                continue  # Skip already selected slides
                
            similarity = np.dot(search_embedding, slide.embedding) / (
                np.linalg.norm(search_embedding) * np.linalg.norm(slide.embedding)
            )

            score_multiplier = 1.0
            if section.section.lower() == slide.category.lower():
                score_multiplier *= 1.2

            final_similarity = similarity * score_multiplier

            if final_similarity > best_similarity:
                best_similarity = final_similarity
                best_match = (slide, slide.id)
        
        if best_match and best_similarity >= similarity_threshold:
            matched_slides.append(best_match)
            used_slide_ids.add(best_match[1])  # Add slide.id to the used set
        else:
            print(f"Warning: No good match found for section {section.section}")
    
    return matched_slides

def getOriginals(file_path, slide_ids):
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    prs = Presentation(file_path)
    originals = []  # Track if changes were made

    for slide_index, slide in enumerate(prs.slides, start=1):
        if slide_index in slide_ids:
            originals.append(slide)
    return originals


async def generate_slide_content_remix(
    slides,
    outline: List[schemas.SlideOutline],
    presentation_input: schemas.PresentationInput,
    max_retries: int = 3
) -> List[dict]:
    """Generate customized content for each slide based on the outline."""
    slide_content_list = []

    system_prompt = """You are an expert presentation content writer. 
    Your task is to refine and enhance the provided slide text while maintaining clarity, professionalism, and conciseness.

    ### Rules:
    1. Ensure the revised text keeps the **same meaning** as the original.
    2. If the original text is too long, **shorten it while preserving its key message**.
    3. The output should be a **JSON object where the original text is the key and the rewritten text is the value**.
    """

    # Convert slide data into replacement text format
    replacement_list = []
    for slide in slides:
        replacement_obj = {"slideNumber": slide["slideNumber"]}
        text_replacements = {}
        
        replacement_counter = 1  # Reset counter for each slide
        
        for section_text in slide["text"].values():
            key = f"replacement{replacement_counter}"
            text_replacements[key] = section_text
            replacement_counter += 1

        replacement_obj["text"] = text_replacements
        replacement_list.append(replacement_obj)

    for obj_index, obj in enumerate(replacement_list, start=1):
        print(f"🔹 Processing Slide {obj['slideNumber']}")

        for attempt in range(max_retries):
            prompt = f"""
            Your task is to **rewrite the text provided while keeping its meaning intact but have fun with it!
            Don't be afraid to be creative and add a bit of flair to the text to make it more engaging and interesting and 
            different from the original text.**.
            **.
            use this outline as a guide:
            {outline}

            and include this data it is about the team, client etc:
            {presentation_input}

            ### **Original Slide Content:**
            {json.dumps(obj, indent=4)}

            ### **Output Format (JSON)**
            Return a JSON object where:
            - **Each key is the original text**.
            - **Each value is the rewritten text**.

            Example:
            ```json
            {{
                "Original Text 1": "Rewritten Text 1",
                "Original Text 2": "Rewritten Text 2"
            }}
            ```
            """
            try:
                modified_content = await get_completion(
                    prompt=prompt,
                    system_prompt=system_prompt
                )
            except Exception as e:
                print(f"❌ API request failed on attempt {attempt + 1} for slide {obj['slideNumber']}: {e}")
                continue  # Retry

            if not modified_content:
                print(f"⚠️ Attempt {attempt + 1} failed for slide {obj['slideNumber']}: Empty response.")
                time.sleep(2)  
                continue  
            
            # Remove Markdown-style formatting from GPT response
            response = modified_content.strip("```").strip()
            try:
                parsed_response = json.loads(response)  

                slide_content_list.append({
                    "slide_id": obj["slideNumber"],  
                    "content": parsed_response
                })

                print(f"✅ Success for slide {obj['slideNumber']}")
                break  # Exit retry loop on success

            except json.JSONDecodeError as e:
                print(f"❌ Attempt {attempt + 1} failed for slide {obj['slideNumber']}: {e}")
                print("Raw response:", response)
                time.sleep(2)  # Wait before retrying

    return slide_content_list
  
def construct_presentation_remix(original_slides, output_path, slide_data):
    """Copy selected slides from template and modify content"""

    path_to_copy_project = copyOG_remix_remix(original_slides, slide_data)
    print (path_to_copy_project)
    return path_to_copy_project



def copyOG_remix_remix(original_slides, replacements):

    slide_ids = sorted(item["slide_id"] for item in replacements if "slide_id" in item)
    output_dir = Path("presentation_output")
    output_dir.mkdir(exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_filename = f"duplicated_{timestamp}.pptx"
    output_path = output_dir / output_filename

    # Copy
    outputPath = shutil.copy2(original_slides, output_path)

    # Modify
    newOutputPath = modify_ppt_text_remix(outputPath, replacements)
    prs = Presentation(newOutputPath)

    #Removal
    keep_slide_ids = {i - 1 for i in slide_ids}  # Adjust for zero-based index
    slides_to_remove = [i for i in range(len(prs.slides)) if i not in keep_slide_ids]
    xml_slides = prs.slides._sldIdLst

    for slide_index in reversed(slides_to_remove):  
        xml_slides.remove(xml_slides[slide_index])  
    # And Done
    prs.save(newOutputPath)
    return str(newOutputPath)


def modify_ppt_text_remix(file_path, replacements):
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    prs = Presentation(file_path)

    merged_content = {}

    for slide in replacements:
        merged_content.update(slide["content"])
    
    for slide in prs.slides:
      for shape in slide.shapes:
            if hasattr(shape, "text_frame") and shape.text_frame is not None:
                for paragraph in shape.text_frame.paragraphs:
                    full_text = paragraph.text.strip() 

                    if full_text in merged_content:
                        new_text = merged_content[full_text]  
                        runs = paragraph.runs                   

                        if len(runs) == 1:
                            print(f"Replacing text: {runs[0].text} with -> {new_text}")
                            runs[0].text = new_text
                        else:
                            first_run = runs[0] 
                            for run in runs:
                                print(f"Run Text Before: {run.text}")
                                run.text = ""
                            first_run.text = new_text if new_text.strip() else " "  


    file_path = Path(file_path)  # Ensure it's a Path object
    final_path = file_path.parent / "final_presentation.pptx"  # Keep same folder, change filename

    prs.save(final_path)
    return final_path


    # final_path = file_path.with_stem(file_path.stem + "_final")                        
    # prs.save(final_path)
    # return (final_path)

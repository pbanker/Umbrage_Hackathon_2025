from typing import List
from fastapi import HTTPException
from pptx import Presentation
from copy import deepcopy
from pptx.enum.shapes import MSO_SHAPE_TYPE, PP_PLACEHOLDER, MSO_SHAPE_TYPE
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
import os

logger = logging.getLogger(__name__)

def construct_presentation(template_path, output_path, slide_data):
    """Copy selected slides from template and modify content"""
    logger.info(f"Starting presentation construction from {template_path}")
    logger.debug(f"Slide data to process: {json.dumps(slide_data, indent=2)}")
    
    """Args:
        template_path (str): Path to the template presentation
        output_path (str): Path where the new presentation will be saved
        slide_data (list): List of dictionaries with slide_id and content to be updated
                          Example: [
                              {
                                  "slide_id": 5,  # slide number or some identifier
                                  "content": {
                                      "title": "New Title",
                                      "subtitle": "New Subtitle",
                                      "body": "New content for body placeholder"
                                  }
                              },
                              ...
                          ]
    """
    # Load the template presentation
    template_pres = Presentation(template_path)
    logger.info(f"Loaded template with {len(template_pres.slides)} slides")
    
    # Create a new presentation to hold the copied slides
    new_pres = Presentation()
    
    # Create a mapping of placeholder types to their names for easier identification
    placeholder_types = {getattr(PP_PLACEHOLDER, attr): attr 
                        for attr in dir(PP_PLACEHOLDER) 
                        if not attr.startswith('__')}
    
    # Map slide IDs to their indices
    slide_map = {i: slide for i, slide in enumerate(template_pres.slides)}
    logger.debug(f"Created slide map with {len(slide_map)} slides")
    
    # Process each slide in the slide_data
    for slide_item in slide_data:
        slide_id = slide_item["slide_id"]
        content = slide_item["content"]
        logger.info(f"Processing slide {slide_id}")
        
        # Get template slide
        template_slide = template_pres.slides[slide_id]
        layout = template_slide.slide_layout
        new_slide = new_pres.slides.add_slide(layout)
        
        # Process each element in the content
        for element in content.get("elements", []):
            logger.debug(f"Processing element: {element.get('name', 'unnamed')}")
            
            # Find matching shape in new slide
            for shape in new_slide.shapes:
                try:
                    # Match by placeholder type and index if available
                    if (element.get("is_placeholder") and 
                        hasattr(shape, "placeholder_format") and
                        shape.placeholder_format.idx == element.get("placeholder_idx")):
                        
                        # Update text content if available
                        if element.get("content_type") == "text" and hasattr(shape, "text_frame"):
                            text = "\n".join(p["text"] for p in element.get("paragraphs", []))
                            shape.text_frame.text = text
                            logger.debug(f"Updated text content for placeholder {element.get('placeholder_type', 'unknown')}")
                            
                        # TODO: Handle other content types (tables, charts, etc.)
                        break
                        
                except Exception as e:
                    logger.error(f"Error processing shape: {str(e)}", exc_info=True)
    
    logger.info(f"Saving presentation to {output_path}")
    new_pres.save(output_path)
    logger.info("Presentation saved successfully")
    return new_pres



def duplicate_slide_object(slide):
    """
    Create a duplicate of a slide object
    
    Args:
        slide: The source Slide object to duplicate
        
    Returns:
        A new Slide object with duplicated content
    """
    # Get the presentation that contains the slide
    prs = slide.part.package.presentation
    
    # Create a temporary new slide with the same layout
    slide_layout = slide.slide_layout
    new_slide = prs.slides.add_slide(slide_layout)
    
    # Copy slide content
    for shape in slide.shapes:
        el = shape.element
        new_el = deepcopy(el)
        new_slide.shapes._spTree.insert_element_before(new_el, 'p:extLst')
    
    # Copy slide properties
    if hasattr(slide, 'background') and hasattr(new_slide, 'background'):
        new_slide.background = slide.background
    
    # Return the new slide object
    return new_slide

    

def apply_modified_schema(slide, original_schema, modified_schema):
    """
    Apply only the modified parts of a schema to a slide
    
    Args:
        slide: The slide object to apply changes to (a duplicated slide)
        original_schema: Dictionary with the original slide schema
        modified_schema: Dictionary with the modified slide schema
        
    Returns:
        slide: The updated slide object
    """
    # We'll iterate through the elements in the modified schema
    # and update only what has changed compared to the original schema
    
    for mod_element in modified_schema["elements"]:
        # Find the corresponding element in the original schema
        orig_element = next(
            (e for e in original_schema["elements"] if e["id"] == mod_element["id"]), 
            None
        )
        
        # If this is a new element that wasn't in the original, we'd handle it differently
        # (that would require creating new shapes, which is more complex)
        if not orig_element:
            print(f"Warning: Element ID {mod_element['id']} not found in original schema")
            continue
        
        # Find the corresponding shape in the slide
        shape = None
        for s in slide.shapes:
            if s.shape_id == mod_element["id"]:
                shape = s
                break
        
        if not shape:
            print(f"Warning: Shape with ID {mod_element['id']} not found in slide")
            continue
        
        # Now we update only what has changed
        if "position" in mod_element:
            # Check if position attributes have changed
            mod_pos = mod_element["position"]
            orig_pos = orig_element["position"]
            
            if mod_pos.get("x") != orig_pos.get("x"):
                shape.left = mod_pos["x"]
            if mod_pos.get("y") != orig_pos.get("y"):
                shape.top = mod_pos["y"]
            if mod_pos.get("width") != orig_pos.get("width"):
                shape.width = mod_pos["width"]
            if mod_pos.get("height") != orig_pos.get("height"):
                shape.height = mod_pos["height"]
            if mod_pos.get("rotation") != orig_pos.get("rotation"):
                shape.rotation = mod_pos["rotation"]
        
        # Handle text content changes
        if mod_element.get("content_type") == "text" and shape.has_text_frame:
            mod_paras = mod_element.get("paragraphs", [])
            orig_paras = orig_element.get("paragraphs", [])
            
            # Only update if there are differences in paragraphs
            if mod_paras != orig_paras:
                # Clear existing text frame content
                for i in range(len(shape.text_frame.paragraphs)-1, 0, -1):
                    p = shape.text_frame.paragraphs[i]
                    p._p.getparent().remove(p._p)
                
                first_para = shape.text_frame.paragraphs[0]
                first_para.text = ""
                
                # Apply new text content
                for i, para_data in enumerate(mod_paras):
                    if i == 0:
                        para = first_para
                    else:
                        para = shape.text_frame.add_paragraph()
                    
                    # Apply paragraph-level formatting
                    if "level" in para_data:
                        para.level = para_data["level"]
                    
                    if "alignment" in para_data and para_data["alignment"]:
                        # Convert string alignment to enum value
                        alignment_str = para_data["alignment"].replace("PP_ALIGN.", "")
                        alignment_value = getattr(PP_ALIGN, alignment_str, None)
                        if alignment_value is not None:
                            para.alignment = alignment_value
                    
                    # Add text runs
                    for run_data in para_data.get("runs", []):
                        run = para.add_run()
                        run.text = run_data["text"]
                        
                        # Apply font formatting
                        font_data = run_data.get("font", {})
                        if font_data.get("name"):
                            run.font.name = font_data["name"]
                        if font_data.get("size"):
                            run.font.size = Pt(font_data["size"])
                        if font_data.get("bold") is not None:
                            run.font.bold = font_data["bold"]
                        if font_data.get("italic") is not None:
                            run.font.italic = font_data["italic"]
                        if font_data.get("underline") is not None:
                            run.font.underline = font_data["underline"]
                        if font_data.get("color"):
                            color_str = font_data["color"].replace("RGB(", "").replace(")", "")
                            rgb_values = [int(x) for x in color_str.split(",")]
                            run.font.color.rgb = RGBColor(*rgb_values)
                
                # Apply text frame properties
                if "has_text_linking" in mod_element and mod_element["has_text_linking"] != orig_element.get("has_text_linking"):
                    shape.text_frame.auto_size = mod_element["has_text_linking"]
                
                if "word_wrap" in mod_element and mod_element["word_wrap"] != orig_element.get("word_wrap"):
                    shape.text_frame.word_wrap = mod_element["word_wrap"]
                
                if "vertical_anchor" in mod_element and mod_element["vertical_anchor"] != orig_element.get("vertical_anchor"):
                    # Convert string anchor to enum value
                    anchor_str = mod_element["vertical_anchor"].replace("MSO_ANCHOR.", "")
                    anchor_value = getattr(MSO_ANCHOR, anchor_str, None)
                    if anchor_value is not None:
                        shape.text_frame.vertical_anchor = anchor_value
        
        # Handle table content changes
        elif mod_element.get("content_type") == "table" and hasattr(shape, "table"):
            mod_table = mod_element.get("table_data", [])
            orig_table = orig_element.get("table_data", [])
            
            # Only update if there are differences
            if mod_table != orig_table:
                for row_idx, row_data in enumerate(mod_table):
                    for col_idx, cell_data in enumerate(row_data):
                        # Check if cell data has changed
                        orig_cell_data = next(
                            (c for c in orig_table[row_idx] if c["row_idx"] == row_idx and c["col_idx"] == col_idx),
                            None
                        )
                        
                        if orig_cell_data and cell_data["text"] != orig_cell_data["text"]:
                            cell = shape.table.cell(row_idx, col_idx)
                            cell.text = cell_data["text"]
        
        # Handle chart content changes
        elif mod_element.get("content_type") == "chart" and hasattr(shape, "chart"):
            # Check if chart title has changed
            if "title" in mod_element and "title" in orig_element:
                if mod_element["title"] != orig_element["title"] and shape.chart.has_title:
                    shape.chart.chart_title.text_frame.text = mod_element["title"]
            
            # Updating chart data is more complex and may require reconstructing the chart
            # This is a simplified version - for production code you'd need more extensive logic
            if "series" in mod_element and "series" in orig_element:
                if mod_element["series"] != orig_element["series"]:
                    print("Warning: Chart data updates require more complex handling")
                    # Would need to update chart data here
        
        # Handle picture content changes (limited capabilities)
        elif mod_element.get("content_type") == "picture" and shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
            # Images typically need to be replaced entirely rather than modified
            pass
        
        # Handle shape fill changes
        if "fill_color" in mod_element and "fill_color" in orig_element:
            if mod_element["fill_color"] != orig_element["fill_color"]:
                color_str = mod_element["fill_color"].replace("RGB(", "").replace(")", "")
                rgb_values = [int(x) for x in color_str.split(",")]
                shape.fill.solid()
                shape.fill.fore_color.rgb = RGBColor(*rgb_values)
    
    return slide



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

async def find_matching_slides(
    outline: List[schemas.SlideOutline], 
    db: Session,
    similarity_threshold: float = 0.7
) -> List[SlideMetadata]:
    """Find the best matching slides for each outline section using semantic search"""
    matched_slides = []
    
    for section in outline:
        # Create semantic search content
        search_content = {
            "section": section.section,
            "description": section.description,
            "keywords": section.keywords
        }
        # Await the embedding result
        search_embedding = await get_embedding(json.dumps(search_content))
        
        # Query all slides and calculate similarity
        slides = db.query(SlideMetadata).all()
        best_match = None
        best_similarity = -1
        
        for slide in slides:
            if slide.embedding is None:
                continue
                
            # Calculate cosine similarity
            similarity = np.dot(search_embedding, slide.embedding) / (
                np.linalg.norm(search_embedding) * np.linalg.norm(slide.embedding)
            )
            
            # Consider secondary matching criteria
            score_multiplier = 1.0
            if section.section.lower() == slide.category.lower():
                score_multiplier *= 1.2
            
            final_similarity = similarity * score_multiplier
            
            if final_similarity > best_similarity:
                best_similarity = final_similarity
                best_match = slide
        
        if best_match and best_similarity >= similarity_threshold:
            matched_slides.append(best_match)
        else:
            print(f"Warning: No good match found for section {section.section}")
    
    return matched_slides

async def generate_slide_content(
    slides: List[SlideMetadata],
    outline: List[schemas.SlideOutline],
    presentation_input: schemas.PresentationInput,
    max_retries: int = 3
) -> List[dict]:
    """Generate customized content for each slide based on the outline"""
    slide_content_list = []
    
    system_prompt = """You are an expert presentation content writer. 
    Your task is to modify only the text content of a PowerPoint slide while preserving its exact structure.
    
    Rules:
    1. Keep the exact same JSON structure as the input
    2. Only modify text content where appropriate (title, body text, etc.)
    3. Preserve all styling, layout, and non-text properties
    4. Ensure all fields from the original are present in the output
    5. Keep text concise and impactful
    6. Format the response as valid JSON - return only the JSON object, no additional text
    """
    
    for slide, section in zip(slides, outline):
        for attempt in range(max_retries):
            try:
                prompt = f"""Generate new content for this slide with the following context:
                Slide Type: {slide.slide_type}
                Purpose: {section.description}
                Target Audience: {presentation_input.target_audience}
                Tone: {presentation_input.tone or 'Professional'}
                
                Original slide content structure (modify text only):
                {json.dumps(slide.content_mapping, indent=2)}
                
                Return only the modified JSON structure, no other text.
                """
                
                modified_content = await get_completion(
                    prompt=prompt,
                    system_prompt=system_prompt
                )
                
                logger.debug(f"OpenAI response for slide {slide.id} (attempt {attempt + 1}):\n{modified_content}")
                
                # Parse the response as JSON
                content_dict = json.loads(modified_content)
                slide_content_list.append({
                    "slide_id": slide.id,
                    "content": content_dict
                })
                break  # Success, exit retry loop
                
            except json.JSONDecodeError as e:
                logger.warning(f"Attempt {attempt + 1} failed for slide {slide.id}: {e}")
                logger.warning(f"Raw response:\n{modified_content}")
                
                if attempt == max_retries - 1:  # Last attempt failed
                    logger.error(f"All {max_retries} attempts failed for slide {slide.id}")
                    raise ValueError(f"Failed to generate valid JSON for slide {slide.id} after {max_retries} attempts")
    
    return slide_content_list


def modify_ppt_text(file_path, replacements, output_path):
    """
    Modifies text in a PowerPoint file while preserving formatting and handling multi-run text issues.

    :param file_path: Path to the original PowerPoint file.
    :param replacements: Dictionary mapping old text to new text.
    :param output_path: Path to save the modified PowerPoint.
    :return: Success or error message.
    """
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    prs = Presentation(file_path)
    modified = False  # Track if changes were made

    for slide in prs.slides:
        for shape in slide.shapes:
            if hasattr(shape, "text_frame") and shape.text_frame is not None:
                for paragraph in shape.text_frame.paragraphs:
                    full_text = paragraph.text.strip()  # Extract full text from paragraph

                    # Check if the entire text matches a replacement
                    if full_text in replacements:
                        new_text = replacements[full_text]  # Get new text
                        runs = paragraph.runs  # Get original text runs
                        print(runs)

                        if len(runs) == 1:
                            print(f'single replacement: original {runs[0].text}')
                            # Simple case: Only one run, replace it directly
                            runs[0].text = new_text
                            print(f'replace text {runs[0].text}')
                        else:
                            # Complex case: Multiple runs, preserve formatting while replacing text
                            first_run = runs[0]  # Store first run for formatting reference

                            # Clear all runs except the first one
                            for run in runs:
                                print(f"Run Text Before: '{run.text}', Font: {run.font.name}, Size: {run.font.size}, Bold: {run.font.bold}, Italic: {run.font.italic}")
                                run.text = ""

                            # Apply new text while keeping first run’s formatting
                            first_run.text = new_text
                            
                        modified = True  # Mark as modified

    if modified:
        prs.save(output_path)
        return {"message": f"Modified PowerPoint saved as: {output_path}"}
    else:
        return {"message": "No matching text found to replace."}

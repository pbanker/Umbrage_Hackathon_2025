from pptx import Presentation
from copy import deepcopy
import json
from pptx.enum.shapes import MSO_SHAPE_TYPE, PP_PLACEHOLDER, MSO_SHAPE_TYPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.util import Pt
import os
from datetime import datetime

def create_slide_schemas(template_path, output_folder=None):
    """
    Create comprehensive schemas for all slides in a PowerPoint presentation.
    
    Args:
        template_path (str): Path to the PowerPoint template file
        output_folder (str, optional): Folder to save the schema. If None, schema is only returned
    
    Returns:
        list: List of dictionaries containing slide schemas
    """
    # Create output folder if specified and doesn't exist
    if output_folder and not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    # Load presentation
    presentation = Presentation(template_path)
    presentation_name = os.path.basename(template_path).split('.')[0]
    
    # Get presentation-level information
    presentation_info = {
        "presentation_name": presentation_name,
        "slide_count": len(presentation.slides),
        "created_on": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "slide_width": presentation.slide_width,
        "slide_height": presentation.slide_height
    }
    
    # Create schema for each slide
    slide_schemas = []
    
    # Get placeholder type names for better readability
    placeholder_types = {
        getattr(PP_PLACEHOLDER, attr): attr 
        for attr in dir(PP_PLACEHOLDER) 
        if not attr.startswith('__')
    }
    
    # Get shape type names
    shape_types = {
        getattr(MSO_SHAPE_TYPE, attr): attr 
        for attr in dir(MSO_SHAPE_TYPE) 
        if not attr.startswith('__')
    }
    
    for slide_index, slide in enumerate(presentation.slides):
        # Basic slide information
        schema = {
            "slide_index": slide_index,
            "slide_id": slide.slide_id,
            "slide_number": slide_index + 1,
            "layout_name": slide.slide_layout.name,
            "layout_index": slide.slide_layout.index,
            "elements": []
        }
        
        # Process all shapes on the slide
        for shape in slide.shapes:
            # Base shape information
            element = {
                "id": shape.shape_id,
                "name": shape.name,
                "shape_type": shape_types.get(shape.shape_type, str(shape.shape_type)),
                "position": {
                    "x": shape.left,
                    "y": shape.top,
                    "width": shape.width,
                    "height": shape.height,
                    "rotation": shape.rotation
                }
            }
            
            # Add placeholder information if applicable
            if hasattr(shape, 'placeholder_format') and shape.is_placeholder:
                element["is_placeholder"] = True
                placeholder_type = shape.placeholder_format.type
                element["placeholder_type"] = placeholder_types.get(placeholder_type, str(placeholder_type))
                element["placeholder_idx"] = shape.placeholder_format.idx
            else:
                element["is_placeholder"] = False
            
            # Text content
            if shape.has_text_frame:
                element["content_type"] = "text"
                
                # Get text and formatting at paragraph level
                paragraphs_data = []
                for p in shape.text_frame.paragraphs:
                    paragraph_data = {
                        "text": p.text,
                        "level": p.level,
                        "alignment": str(p.alignment) if hasattr(p, 'alignment') else None,
                        "runs": []
                    }
                    
                    # Get formatting for each text run
                    for run in p.runs:
                        run_data = {
                            "text": run.text,
                            "font": {
                                "name": run.font.name,
                                "size": run.font.size.pt if hasattr(run.font.size, 'pt') else None,
                                "bold": run.font.bold,
                                "italic": run.font.italic,
                                "underline": run.font.underline,
                                "color": str(run.font.color.rgb) if hasattr(run.font.color, 'rgb') and run.font.color.rgb else None
                            }
                        }
                        paragraph_data["runs"].append(run_data)
                    
                    paragraphs_data.append(paragraph_data)
                
                element["paragraphs"] = paragraphs_data
                element["has_text_linking"] = shape.text_frame.auto_size
                element["word_wrap"] = shape.text_frame.word_wrap
                element["vertical_anchor"] = str(shape.text_frame.vertical_anchor) if hasattr(shape.text_frame, 'vertical_anchor') else None
            
            # Table content
            elif hasattr(shape, 'table'):
                element["content_type"] = "table"
                table_data = []
                
                for r_idx, row in enumerate(shape.table.rows):
                    row_data = []
                    for c_idx, cell in enumerate(row.cells):
                        cell_data = {
                            "text": cell.text,
                            "row_idx": r_idx,
                            "col_idx": c_idx,
                            "row_span": cell.span.row_span,
                            "col_span": cell.span.col_span,
                            "width": cell.width,
                            "height": cell.height
                        }
                        row_data.append(cell_data)
                    table_data.append(row_data)
                
                element["table_data"] = table_data
                element["row_count"] = len(shape.table.rows)
                element["column_count"] = len(shape.table.columns)
            
            # Chart content
            elif hasattr(shape, 'chart'):
                element["content_type"] = "chart"
                element["chart_type"] = str(shape.chart.chart_type)
                
                # Extract categories and series
                if hasattr(shape.chart, 'plots') and shape.chart.plots:
                    plot = shape.chart.plots[0]
                    
                    # Try to get categories
                    categories = []
                    if hasattr(plot, 'categories') and plot.categories:
                        for category in plot.categories:
                            categories.append(str(category.label))
                    element["categories"] = categories
                    
                    # Try to get series
                    series_data = []
                    if hasattr(plot, 'series'):
                        for series in plot.series:
                            series_info = {
                                "name": series.name if hasattr(series, 'name') else "Unknown",
                                "values": list(series.values) if hasattr(series, 'values') else []
                            }
                            series_data.append(series_info)
                    element["series"] = series_data
                
                element["has_title"] = shape.chart.has_title
                if shape.chart.has_title:
                    element["title"] = shape.chart.chart_title.text_frame.text
            
            # Picture content
            elif shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
                element["content_type"] = "picture"
                if hasattr(shape, 'image'):
                    element["image_filename"] = shape.image.filename if hasattr(shape.image, 'filename') else None
                    element["image_format"] = shape.image.ext if hasattr(shape.image, 'ext') else None
                    element["content_type"] = f"image/{shape.image.ext}" if hasattr(shape.image, 'ext') else "image"
            
            # Shape content
            else:
                element["content_type"] = "shape"
                if hasattr(shape, 'fill'):
                    element["fill_type"] = str(shape.fill.type) if hasattr(shape.fill, 'type') else None
                    if hasattr(shape.fill, 'fore_color') and shape.fill.fore_color:
                        element["fill_color"] = str(shape.fill.fore_color.rgb) if hasattr(shape.fill.fore_color, 'rgb') else None
            
            # Add this element to the slide schema
            schema["elements"].append(element)
        
        # Add background information
        if hasattr(slide, 'background') and slide.background:
            if hasattr(slide.background.fill, 'type'):
                schema["background_fill_type"] = str(slide.background.fill.type)
                if hasattr(slide.background.fill, 'fore_color') and slide.background.fill.fore_color:
                    schema["background_color"] = str(slide.background.fill.fore_color.rgb) if hasattr(slide.background.fill.fore_color, 'rgb') else None
        
        # Add the slide schema to our collection
        slide_schemas.append(schema)
    
    # Create the full schema with metadata
    full_schema = {
        "presentation_info": presentation_info,
        "slides": slide_schemas
    }
    
    # Save schema if output folder is specified
    if output_folder:
        schema_filename = f"{presentation_name}_schema.json"
        schema_path = os.path.join(output_folder, schema_filename)
        
        with open(schema_path, 'w', encoding='utf-8') as f:
            json.dump(full_schema, f, indent=2, ensure_ascii=False)
        
        print(f"Schema saved to {schema_path}")
    
    return full_schema

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
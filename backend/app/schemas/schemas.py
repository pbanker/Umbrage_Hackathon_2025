from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class PresentationMetadataBase(BaseModel):
    title: str
    storage_path: str
    number_of_slides: int
    image_path: Optional[str] = None

class PresentationMetadata(PresentationMetadataBase):
    id: int
    created_at: datetime

class SlideMetadataBase(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    slide_type: Optional[str] = None
    purpose: Optional[str] = None
    tags: Optional[List[str]] = None
    audience: Optional[str] = None
    sales_stage: Optional[str] = None
    content_mapping: Optional[Dict[str, Any]] = None

class SlideMetadataUpdate(SlideMetadataBase):
    class Config:
        exclude = {'content_mapping'}

class SlideMetadata(SlideMetadataBase):
    id: int
    slide_id: int
    presentation_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    image_path: Optional[str] = None

    class Config:
        from_attributes = True

class SlideTemplate(BaseModel):
    id: int
    slide_id: str
    title: str
    content_data: Dict[str, Any]
    created_at: datetime
    updated_at: Optional[datetime] = None
    slide_metadata: Optional[SlideMetadata] = None

    class Config:
        from_attributes = True

class PresentationSlide(BaseModel):
    id: int
    section: str
    position: int
    content_data: Dict[str, Any]
    slide_template_id: int
    slide_template: SlideTemplate

    class Config:
        from_attributes = True

class PresentationBase(BaseModel):
    title: str
    client_name: str
    industry: str
    outline: Dict[str, Any]

class PresentationOutline(PresentationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class PresentationWithSlides(PresentationOutline):
    slides: List[PresentationSlide]

    class Config:
        from_attributes = True

class PresentationInput(BaseModel):
    title: str
    client_name: str
    industry: str
    description: str
    target_audience: str
    key_messages: List[str]
    num_slides: Optional[int] = None
    preferred_slide_types: Optional[List[str]] = None
    tone: Optional[str] = None
    additional_context: Optional[str] = None

# For OpenAI response parsing
class SlideOutlineBase(BaseModel):
    slide_number: int
    section: str
    description: str
    keywords: List[str] | None = None

class PresentationOutlineResponse(BaseModel):
    slides: List[SlideOutlineBase]

# For API validation
class SlideOutline(SlideOutlineBase):
    slide_number: int = Field(description="The sequential position in the presentation", ge=1)
    section: str = Field(description="A general category or purpose for this slide")
    description: str = Field(description="A descriptive summary of what this slide should communicate")
    keywords: List[str] | None = Field(default=None, description="Keywords for semantic matching with template repository")

# models for slide content generation
class SlideContentBase(BaseModel):
    title: str | None = None
    subtitle: str | None = None
    body: str | None = None
    notes: str | None = None
    #TODO: Add any other common fields that might be in content_mapping

class SlideContentResponse(BaseModel):
    content: SlideContentBase
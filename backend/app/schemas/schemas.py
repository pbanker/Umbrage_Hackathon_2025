from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class SlideMetadataBase(BaseModel):
    category: Optional[str] = None
    slide_type: Optional[str] = None
    purpose: Optional[str] = None
    tags: Optional[List[str]] = None
    audience: Optional[str] = None
    sales_stage: Optional[str] = None
    content_schema: Optional[Dict[str, Any]] = None

class SlideMetadataUpdate(SlideMetadataBase):
    pass

class SlideMetadata(SlideMetadataBase):
    id: int
    slide_id: int

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
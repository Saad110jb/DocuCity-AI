from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    status: str
    message: str
    total_pages: int
    extracted_entities_count: int

class ExtractedEntity(BaseModel):
    entity_id: str
    entity_type: str  # e.g., "FAR", "HEIGHT", "SETBACK", "ZONE_CODE"
    raw_text: str
    value: str
    confidence: float
    page_number: int
    verified: bool = False

class DocumentReviewUpdate(BaseModel):
    document_id: str
    entities: List[ExtractedEntity]
    approved: bool
    notes: Optional[str] = None

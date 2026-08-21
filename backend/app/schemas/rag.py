from pydantic import BaseModel
from typing import List, Optional

class Citation(BaseModel):
    document_title: str
    clause: str
    page: int
    confidence: float
    snippet: str
    gazette_ref: Optional[str] = None

class RAGQueryRequest(BaseModel):
    query: str
    language: str = "en"  # "en" or "ur"
    zone_code: Optional[str] = None

class RAGQueryResponse(BaseModel):
    query: str
    answer: str
    language: str
    citations: List[Citation]
    translated_answer: Optional[str] = None
    suggested_followups: List[str] = []

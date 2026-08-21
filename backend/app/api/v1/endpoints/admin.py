from fastapi import APIRouter
from typing import List
from app.schemas.document import DocumentReviewUpdate, ExtractedEntity

router = APIRouter()

@router.get("/pending-reviews")
async def get_pending_reviews():
    return [
        {
            "document_id": "doc-89a1f2c",
            "filename": "LDA_Gulberg_Commercial_Notification_2024.pdf",
            "uploaded_by": "Officer Ahmad Khan",
            "upload_date": "2026-08-19",
            "status": "PENDING_APPROVAL",
            "entities": [
                {
                    "entity_id": "ent-101",
                    "entity_type": "FAR",
                    "raw_text": "Floor Area Ratio: 1:8",
                    "value": "1:8",
                    "confidence": 0.96,
                    "page_number": 3,
                    "verified": False
                },
                {
                    "entity_id": "ent-102",
                    "entity_type": "HEIGHT_LIMIT",
                    "raw_text": "Max Height: 120ft",
                    "value": "120ft",
                    "confidence": 0.94,
                    "page_number": 3,
                    "verified": False
                }
            ]
        }
    ]

@router.post("/approve-document")
async def approve_document_review(payload: DocumentReviewUpdate):
    return {
        "document_id": payload.document_id,
        "status": "APPROVED" if payload.approved else "REJECTED",
        "message": f"Document {payload.document_id} review status updated successfully by Municipal Officer.",
        "verified_entities_count": len(payload.entities)
    }

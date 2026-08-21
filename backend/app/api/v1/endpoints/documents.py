import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from app.schemas.document import DocumentUploadResponse
from app.services.ocr_service import ocr_service
from app.services.ner_service import ner_service
from app.core.security import sanitize_pii

router = APIRouter()

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith(('.pdf', '.png', '.jpg', '.jpeg', '.txt')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload PDF, PNG, JPG, or TXT documents."
        )
    
    contents = await file.read()
    
    # 1. OCR Extraction
    ocr_result = ocr_service.extract_text_from_pdf(contents, file.filename)
    
    # 2. PII Sanitization
    sanitized_text = sanitize_pii(ocr_result["full_text"])
    
    # 3. Entity Extraction via NER
    entities = ner_service.extract_bylaw_entities(sanitized_text)

    doc_id = f"doc-{uuid.uuid4().hex[:8]}"

    return DocumentUploadResponse(
        document_id=doc_id,
        filename=file.filename,
        status="processed",
        message="Document uploaded, OCR processed, PII redacted, and LDA entities extracted.",
        total_pages=ocr_result["total_pages"],
        extracted_entities_count=len(entities)
    )

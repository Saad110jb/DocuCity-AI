import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from app.schemas.document import DocumentUploadResponse
from app.services.ocr_service import ocr_service
from app.services.ner_service import ner_service
from app.services.universal_parser import universal_parser
from app.core.security import sanitize_pii

router = APIRouter()

@router.post("/parse")
async def parse_municipal_document(file: UploadFile = File(...)):
    """
    Universal Multimodal Document Parser Endpoint:
    Ingests any municipal document (PDF, Scanned Gazette, Images) ranging from 1 page to 200+ pages
    with dynamic page-level character density detection and canonical JSON output.
    """
    try:
        file_bytes = await file.read()
        result = universal_parser.parse_document(file_bytes=file_bytes, filename=file.filename)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Dynamic universal parsing failed: {str(e)}"
        )

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith(('.pdf', '.png', '.jpg', '.jpeg', '.txt')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload PDF, PNG, JPG, or TXT documents."
        )
    
    contents = await file.read()
    
    # Universal Document Parser
    parsed = universal_parser.parse_document(file_bytes=contents, filename=file.filename)
    
    doc_id = f"doc-{uuid.uuid4().hex[:8]}"

    return DocumentUploadResponse(
        document_id=doc_id,
        filename=file.filename,
        status="processed",
        message="Document uploaded and processed via Universal Multimodal Document Parser.",
        total_pages=parsed["total_pages"],
        extracted_entities_count=len(parsed.get("summary_highlights", []))
    )

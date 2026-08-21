from fastapi import APIRouter
from app.schemas.rag import RAGQueryRequest, RAGQueryResponse
from app.services.rag_service import rag_service

router = APIRouter()

@router.post("/query", response_model=RAGQueryResponse)
async def query_rag(payload: RAGQueryRequest):
    result = rag_service.query(
        user_query=payload.query,
        language=payload.language,
        zone_code=payload.zone_code
    )
    return RAGQueryResponse(**result)

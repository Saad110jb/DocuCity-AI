from fastapi import APIRouter
from app.api.v1.endpoints import documents, rag, spatial, admin

api_router = APIRouter()
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(rag.router, prefix="/rag", tags=["rag"])
api_router.include_router(spatial.router, prefix="/spatial", tags=["spatial"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])

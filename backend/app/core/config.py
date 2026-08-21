import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "DocuCity Lahore AI Service"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "docucity-lahore-super-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    
    # MongoDB Database configuration
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/docucity")
    
    # Gemini AI configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Paths
    GEOJSON_DIR: str = os.getenv("GEOJSON_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/geojson")))
    CHROMADB_DIR: str = os.getenv("CHROMADB_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/chromadb")))

    class Config:
        case_sensitive = True

settings = Settings()

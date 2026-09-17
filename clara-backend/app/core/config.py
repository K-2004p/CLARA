import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CLARA - Clause-Level Analysis & Risk Assessment Engine"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "CLARA_LEGAL_AI_SECRET_KEY_SUPER_SECURE_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./clara_legal.db")
    
    # Gemini API Key (optional for live RAG calls)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "*",
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "chrome-extension://*",
        "edge-extension://*"
    ]

    class Config:
        case_sensitive = True

settings = Settings()

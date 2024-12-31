from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Your Project Name"
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",    # React default port
        "http://localhost:5173",    # Vite default port
    ]
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")
    
    class Config:
        case_sensitive = True

settings = Settings() 
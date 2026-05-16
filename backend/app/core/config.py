# ============================================================
# backend/app/core/config.py  — App settings via pydantic
# ============================================================
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./shopai.db"
    SECRET_KEY: str = "kawshar_secret_key_2024_shopai"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    ANTHROPIC_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    UPLOAD_DIR: str = "uploads"
    FRONTEND_URL: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

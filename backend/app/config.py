import os
from pydantic_settings import BaseSettings
from pydantic import field_validator
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = False
    PROJECT_NAME: str = "AI PowerPoint Presentation Builder"
    DATABASE_URI: str = os.getenv("DATABASE_URI", "postgresql://postgres:postgres@db:5432/myapp")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "default-secret-key")
    OPENAI_API_KEY: str = ""

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "allow"
    }

    @field_validator("OPENAI_API_KEY", mode="before")
    def validate_openai_api_key(cls, v):
        return os.getenv("OPENAI_API_KEY", v)

settings = Settings()
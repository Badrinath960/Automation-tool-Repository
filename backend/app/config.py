from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 100
    ADMIN_EMAIL: str = "admin@atr.internal"
    ADMIN_PASSWORD: str = "Admin@123"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()

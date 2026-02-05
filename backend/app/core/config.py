from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os


class Settings(BaseSettings):
    """Application settings and configuration."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        extra='allow'  # Allow extra fields
    )
    
    # Database
    DATABASE_URL: str = "sqlite:///./test.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS - stored as string to avoid JSON parsing issues
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    
    # Application
    APP_NAME: str = "Artist Configuration Manager"
    DEBUG: bool = True
    
    def get_allowed_origins(self) -> List[str]:
        """Parse ALLOWED_ORIGINS from comma-separated string."""
        value = self.ALLOWED_ORIGINS
        if not value or not value.strip():
            return []
        return [origin.strip() for origin in value.split(',') if origin.strip()]


# Create settings instance and replace ALLOWED_ORIGINS with parsed list
_settings = Settings()
_settings.ALLOWED_ORIGINS = _settings.get_allowed_origins()
settings = _settings

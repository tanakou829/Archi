from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os
import json


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
        """Parse ALLOWED_ORIGINS from comma-separated string, list, or JSON array."""
        value = self.ALLOWED_ORIGINS
        
        # If already a list, return it (cleaned)
        if isinstance(value, list):
            return [origin.strip() for origin in value if origin and isinstance(origin, str) and origin.strip()]
        
        # If string, try to parse
        if isinstance(value, str):
            # First, try parsing as JSON
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return [origin.strip() for origin in parsed if origin and isinstance(origin, str) and origin.strip()]
            except (json.JSONDecodeError, ValueError):
                pass
            
            # Otherwise, treat as comma-separated string
            if not value or not value.strip():
                return []
            return [origin.strip() for origin in value.split(',') if origin.strip()]
        
        # Fallback to empty list
        return []


# Create settings instance and replace ALLOWED_ORIGINS with parsed list
_settings = Settings()
_settings.ALLOWED_ORIGINS = _settings.get_allowed_origins()
settings = _settings

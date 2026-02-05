from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserSettingBase(BaseModel):
    """Base user setting schema."""
    category: str = Field(..., description="Setting category (e.g., maya, blender, houdini)")
    key: str = Field(..., description="Setting key")
    value: Optional[str] = Field(None, description="Setting value (JSON string or plain text)")
    description: Optional[str] = Field(None, description="Setting description")


class UserSettingCreate(UserSettingBase):
    """Schema for creating a new user setting."""
    pass


class UserSettingUpdate(BaseModel):
    """Schema for updating a user setting."""
    value: Optional[str] = None
    description: Optional[str] = None


class UserSettingResponse(UserSettingBase):
    """Schema for user setting response."""
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

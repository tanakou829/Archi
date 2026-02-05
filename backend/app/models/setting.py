from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserSetting(Base):
    """Extensible settings model for storing DCC tool configurations and other settings."""
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    category = Column(String, index=True, nullable=False)  # e.g., "maya", "blender", "houdini", "general"
    key = Column(String, index=True, nullable=False)  # e.g., "workspace_path", "render_engine"
    value = Column(Text)  # JSON string or plain text value
    description = Column(Text)  # Optional description of the setting
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="settings")
    project = relationship("Project", back_populates="settings")
    
    __table_args__ = (
        UniqueConstraint('user_id', 'project_id', 'category', 'key', name='uq_user_project_category_key'),
    )

from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    """User model for storing artist information."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    section = Column(String)  # e.g., "Modeling", "Animation", "VFX"
    unit = Column(String)  # e.g., "Unit A", "Unit B"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    settings = relationship("UserSetting", back_populates="user", cascade="all, delete-orphan")
    created_projects = relationship("Project", foreign_keys="Project.created_by", back_populates="creator")
    projects = relationship("Project", secondary="user_projects", back_populates="members")

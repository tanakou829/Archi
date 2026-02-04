from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core import get_db
from app.models import User, UserSetting
from app.schemas import UserSettingCreate, UserSettingResponse, UserSettingUpdate
from .auth import get_current_user

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/", response_model=List[UserSettingResponse])
def list_user_settings(
    category: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all settings for the current user, optionally filtered by category."""
    query = db.query(UserSetting).filter(UserSetting.user_id == current_user.id)
    
    if category:
        query = query.filter(UserSetting.category == category)
    
    settings = query.all()
    return settings


@router.post("/", response_model=UserSettingResponse, status_code=status.HTTP_201_CREATED)
def create_user_setting(
    setting_data: UserSettingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new setting for the current user."""
    # Check if setting already exists
    existing_setting = db.query(UserSetting).filter(
        UserSetting.user_id == current_user.id,
        UserSetting.category == setting_data.category,
        UserSetting.key == setting_data.key
    ).first()
    
    if existing_setting:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Setting with category '{setting_data.category}' and key '{setting_data.key}' already exists"
        )
    
    new_setting = UserSetting(
        user_id=current_user.id,
        category=setting_data.category,
        key=setting_data.key,
        value=setting_data.value,
        description=setting_data.description
    )
    
    db.add(new_setting)
    db.commit()
    db.refresh(new_setting)
    
    return new_setting


@router.get("/{setting_id}", response_model=UserSettingResponse)
def get_user_setting(
    setting_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific setting by ID."""
    setting = db.query(UserSetting).filter(
        UserSetting.id == setting_id,
        UserSetting.user_id == current_user.id
    ).first()
    
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Setting not found"
        )
    
    return setting


@router.put("/{setting_id}", response_model=UserSettingResponse)
def update_user_setting(
    setting_id: int,
    setting_data: UserSettingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a specific setting."""
    setting = db.query(UserSetting).filter(
        UserSetting.id == setting_id,
        UserSetting.user_id == current_user.id
    ).first()
    
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Setting not found"
        )
    
    update_data = setting_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(setting, field, value)
    
    db.commit()
    db.refresh(setting)
    
    return setting


@router.delete("/{setting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_setting(
    setting_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a specific setting."""
    setting = db.query(UserSetting).filter(
        UserSetting.id == setting_id,
        UserSetting.user_id == current_user.id
    ).first()
    
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Setting not found"
        )
    
    db.delete(setting)
    db.commit()

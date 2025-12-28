from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.settings import DeliverySettings, RestaurantSettings
from app.models.user import User, UserRole
from app.schemas.settings import DeliverySettingsResponse, DeliverySettingsUpdate, RestaurantSettingResponse
from app.api.v1.auth import get_current_user

router = APIRouter()

def require_admin(current_user: User = Depends(get_current_user)):
    """Require admin role"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@router.get("/delivery", response_model=DeliverySettingsResponse)
def get_delivery_settings(db: Session = Depends(get_db)):
    """Get delivery settings"""
    settings = db.query(DeliverySettings).first()
    if not settings:
        # Create default settings
        settings = DeliverySettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("/delivery", response_model=DeliverySettingsResponse)
def update_delivery_settings(
    settings_data: DeliverySettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update delivery settings (admin only)"""
    settings = db.query(DeliverySettings).first()
    if not settings:
        settings = DeliverySettings()
        db.add(settings)
    
    for key, value in settings_data.model_dump(exclude_unset=True).items():
        setattr(settings, key, value)
    
    db.commit()
    db.refresh(settings)
    return settings

@router.get("/restaurant", response_model=List[RestaurantSettingResponse])
def get_restaurant_settings(db: Session = Depends(get_db)):
    """Get all restaurant settings"""
    settings = db.query(RestaurantSettings).all()
    return settings

@router.put("/restaurant/{key}")
def update_restaurant_setting(
    key: str,
    value: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update a restaurant setting (admin only)"""
    setting = db.query(RestaurantSettings).filter(RestaurantSettings.key == key).first()
    if not setting:
        setting = RestaurantSettings(key=key, value=value)
        db.add(setting)
    else:
        setting.value = value
    
    db.commit()
    db.refresh(setting)
    return setting

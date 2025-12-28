"""Staff profiles API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
from pathlib import Path

from app.core.database import get_db
from app.api.v1.auth import get_current_user, create_access_token
from app.models.user import User, UserRole
from app.schemas.user import (
    StaffProfileResponse, 
    UserUpdate, 
    PINLoginRequest,
    Token
)
from app.core.security import get_password_hash, verify_password

router = APIRouter(prefix="/staff-profiles", tags=["staff-profiles"])

UPLOAD_DIR = Path("uploads/avatars")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.get("/", response_model=List[StaffProfileResponse])
async def get_all_staff_profiles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all staff profiles (for profile selection screen)"""
    users = db.query(User).filter(User.is_active == 1).all()
    return users


@router.get("/{user_id}", response_model=StaffProfileResponse)
async def get_staff_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific staff profile"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}")
async def update_staff_profile(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update staff profile (admin only or own profile)"""
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Hash password if provided
    if "password" in update_data:
        update_data["password_hash"] = get_password_hash(update_data.pop("password"))
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/avatar")
async def upload_avatar(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload staff avatar"""
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / filename
    
    # Save file
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Update user avatar URL
    user.avatar_url = f"http://localhost:8000/uploads/avatars/{filename}"
    db.commit()
    
    return {"avatar_url": user.avatar_url}


@router.post("/pin-login", response_model=Token)
async def pin_login(
    login_request: PINLoginRequest,
    db: Session = Depends(get_db)
):
    """Login with user ID and PIN code"""
    user = db.query(User).filter(
        User.id == login_request.user_id,
        User.is_active == 1
    ).first()
    
    if not user or not user.pin_code:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if user.pin_code != login_request.pin_code:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid PIN code"
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/{user_id}/set-pin")
async def set_pin_code(
    user_id: int,
    pin_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Set PIN code for user (admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if not pin_code.isdigit() or len(pin_code) != 4:
        raise HTTPException(status_code=400, detail="PIN must be 4 digits")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.pin_code = pin_code
    db.commit()
    
    return {"message": "PIN code set successfully"}

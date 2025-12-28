from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os
from pathlib import Path

from app.core.database import get_db
from app.models.menu_item import MenuItem
from app.models.user import User
from app.schemas.menu_item import MenuItemCreate, MenuItemUpdate, MenuItemResponse
from app.api.v1.auth import get_current_user

router = APIRouter()

UPLOAD_DIR = Path("uploads/menu_items")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.get("/", response_model=List[MenuItemResponse])
def get_menu_items(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    available_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get all menu items"""
    query = db.query(MenuItem)
    
    if category:
        query = query.filter(MenuItem.category == category)
    
    if available_only:
        query = query.filter(MenuItem.available == 1)
    
    items = query.offset(skip).limit(limit).all()
    return items

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    """Get all unique categories"""
    categories = db.query(MenuItem.category).distinct().all()
    return [cat[0] for cat in categories]

@router.get("/{item_id}", response_model=MenuItemResponse)
def get_menu_item(item_id: int, db: Session = Depends(get_db)):
    """Get a specific menu item"""
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
    
    return item

@router.post("/", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
def create_menu_item(
    item: MenuItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new menu item (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    new_item = MenuItem(
        name=item.name,
        description=item.description,
        price=item.price,
        category=item.category,
        image_url=item.image_url,
        available=1 if item.available else 0
    )
    
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    return new_item

@router.post("/upload-image/{item_id}")
async def upload_item_image(
    item_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload an image for a menu item"""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
    
    # Save file
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"item_{item_id}{file_extension}"
    file_path = UPLOAD_DIR / file_name
    
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update item with image URL
    item.image_url = f"/uploads/menu_items/{file_name}"
    db.commit()
    
    return {"image_url": item.image_url}

@router.put("/{item_id}", response_model=MenuItemResponse)
def update_menu_item(
    item_id: int,
    item_update: MenuItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a menu item (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
    
    # Update fields
    if item_update.name is not None:
        item.name = item_update.name
    if item_update.description is not None:
        item.description = item_update.description
    if item_update.price is not None:
        item.price = item_update.price
    if item_update.category is not None:
        item.category = item_update.category
    if item_update.image_url is not None:
        item.image_url = item_update.image_url
    if item_update.available is not None:
        item.available = 1 if item_update.available else 0
    
    db.commit()
    db.refresh(item)
    
    return item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_menu_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a menu item (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
    
    db.delete(item)
    db.commit()
    
    return None

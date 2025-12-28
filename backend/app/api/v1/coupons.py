from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.coupon import Coupon, DiscountType
from app.models.user import User
from pydantic import BaseModel, Field

router = APIRouter()


# Pydantic schemas
class CouponCreate(BaseModel):
    code: str
    description: str | None = None
    discount_type: DiscountType
    discount_value: float
    min_order_amount: float = 0.0
    max_discount_amount: float | None = None
    usage_limit: int | None = None
    valid_from: datetime | None = None
    valid_until: datetime | None = None
    is_active: bool = True
    applicable_categories: str | None = None
    free_item_id: int | None = None


class CouponUpdate(BaseModel):
    description: str | None = None
    discount_type: DiscountType | None = None
    discount_value: float | None = None
    min_order_amount: float | None = None
    max_discount_amount: float | None = None
    usage_limit: int | None = None
    valid_from: datetime | None = None
    valid_until: datetime | None = None
    is_active: bool | None = None
    applicable_categories: str | None = None
    free_item_id: int | None = None


class CouponResponse(BaseModel):
    id: int
    code: str
    description: str | None
    discount_type: DiscountType
    discount_value: float
    min_order_amount: float
    max_discount_amount: float | None
    usage_limit: int | None
    usage_count: int
    valid_from: datetime
    valid_until: datetime | None
    is_active: bool
    applicable_categories: str | None
    free_item_id: int | None
    created_at: datetime

    class Config:
        from_attributes = True


class CouponValidationRequest(BaseModel):
    code: str
    order_total: float
    items: List[dict]


class CouponValidationResponse(BaseModel):
    valid: bool
    discount_amount: float = 0.0
    final_total: float = 0.0
    message: str | None = None


# API Endpoints
@router.post("/", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
async def create_coupon(
    coupon: CouponCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Tworzy nowy kupon (tylko admin)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Brak uprawnień")

    # Sprawdź czy kod nie istnieje
    existing = db.query(Coupon).filter(Coupon.code == coupon.code.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Kupon o tym kodzie już istnieje")

    db_coupon = Coupon(
        code=coupon.code.upper(),
        description=coupon.description,
        discount_type=coupon.discount_type,
        discount_value=coupon.discount_value,
        min_order_amount=coupon.min_order_amount,
        max_discount_amount=coupon.max_discount_amount,
        usage_limit=coupon.usage_limit,
        valid_from=coupon.valid_from or datetime.utcnow(),
        valid_until=coupon.valid_until,
        is_active=coupon.is_active,
        applicable_categories=coupon.applicable_categories,
        free_item_id=coupon.free_item_id
    )
    
    db.add(db_coupon)
    db.commit()
    db.refresh(db_coupon)
    return db_coupon


@router.get("/", response_model=List[CouponResponse])
async def get_coupons(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Pobiera listę kuponów"""
    query = db.query(Coupon)
    
    if active_only:
        query = query.filter(
            Coupon.is_active == True,
            (Coupon.valid_until == None) | (Coupon.valid_until > datetime.utcnow())
        )
    
    return query.offset(skip).limit(limit).all()


@router.get("/{coupon_id}", response_model=CouponResponse)
async def get_coupon(
    coupon_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Pobiera szczegóły kuponu"""
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Kupon nie znaleziony")
    return coupon


@router.put("/{coupon_id}", response_model=CouponResponse)
async def update_coupon(
    coupon_id: int,
    coupon_update: CouponUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Aktualizuje kupon (tylko admin)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Brak uprawnień")

    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Kupon nie znaleziony")

    for key, value in coupon_update.dict(exclude_unset=True).items():
        setattr(coupon, key, value)

    db.commit()
    db.refresh(coupon)
    return coupon


@router.delete("/{coupon_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_coupon(
    coupon_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Usuwa kupon (tylko admin)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Brak uprawnień")

    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Kupon nie znaleziony")

    db.delete(coupon)
    db.commit()
    return None


@router.post("/validate", response_model=CouponValidationResponse)
async def validate_coupon(
    validation: CouponValidationRequest,
    db: Session = Depends(get_db)
):
    """Waliduje kupon i oblicza zniżkę"""
    coupon = db.query(Coupon).filter(Coupon.code == validation.code.upper()).first()
    
    if not coupon:
        return CouponValidationResponse(
            valid=False,
            message="Kod kuponu nie istnieje"
        )
    
    # Sprawdź czy aktywny
    if not coupon.is_active:
        return CouponValidationResponse(
            valid=False,
            message="Kupon jest nieaktywny"
        )
    
    # Sprawdź datę ważności
    now = datetime.utcnow()
    if coupon.valid_from and coupon.valid_from > now:
        return CouponValidationResponse(
            valid=False,
            message="Kupon jeszcze nie jest aktywny"
        )
    
    if coupon.valid_until and coupon.valid_until < now:
        return CouponValidationResponse(
            valid=False,
            message="Kupon wygasł"
        )
    
    # Sprawdź limit użyć
    if coupon.usage_limit and coupon.usage_count >= coupon.usage_limit:
        return CouponValidationResponse(
            valid=False,
            message="Limit użyć kuponu został wyczerpany"
        )
    
    # Sprawdź minimalną kwotę zamówienia
    if validation.order_total < coupon.min_order_amount:
        return CouponValidationResponse(
            valid=False,
            message=f"Minimalna kwota zamówienia: {coupon.min_order_amount} zł"
        )
    
    # Oblicz zniżkę
    discount_amount = 0.0
    
    if coupon.discount_type == DiscountType.PERCENTAGE:
        discount_amount = validation.order_total * (coupon.discount_value / 100)
        if coupon.max_discount_amount:
            discount_amount = min(discount_amount, coupon.max_discount_amount)
    elif coupon.discount_type == DiscountType.FIXED:
        discount_amount = min(coupon.discount_value, validation.order_total)
    
    final_total = max(0, validation.order_total - discount_amount)
    
    return CouponValidationResponse(
        valid=True,
        discount_amount=round(discount_amount, 2),
        final_total=round(final_total, 2),
        message="Kupon został zastosowany"
    )


@router.post("/{coupon_id}/use")
async def use_coupon(
    coupon_id: int,
    db: Session = Depends(get_db)
):
    """Zwiększa licznik użycia kuponu"""
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Kupon nie znaleziony")
    
    coupon.usage_count += 1
    db.commit()
    return {"message": "Kupon użyty", "usage_count": coupon.usage_count}

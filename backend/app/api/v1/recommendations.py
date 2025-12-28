from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.recommendation import ProductRecommendation, CustomerPreference
from app.models.menu_item import MenuItem
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()


# Pydantic schemas
class RecommendationCreate(BaseModel):
    product_id: int
    recommended_product_id: int
    recommendation_type: str = "cross_sell"
    priority: int = 0
    discount_percentage: float = 0.0


class RecommendationResponse(BaseModel):
    id: int
    product_id: int
    recommended_product_id: int
    recommendation_type: str
    priority: int
    discount_percentage: float
    is_active: bool

    class Config:
        from_attributes = True


class ProductWithRecommendations(BaseModel):
    id: int
    name: str
    price: float
    image_url: str | None
    recommendations: List[dict]


# API Endpoints
@router.post("/", response_model=RecommendationResponse, status_code=status.HTTP_201_CREATED)
async def create_recommendation(
    recommendation: RecommendationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Tworzy rekomendację produktu (tylko admin)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Brak uprawnień")

    # Sprawdź czy produkty istnieją
    product = db.query(MenuItem).filter(MenuItem.id == recommendation.product_id).first()
    recommended = db.query(MenuItem).filter(MenuItem.id == recommendation.recommended_product_id).first()
    
    if not product or not recommended:
        raise HTTPException(status_code=404, detail="Produkt nie znaleziony")

    db_recommendation = ProductRecommendation(**recommendation.dict())
    db.add(db_recommendation)
    db.commit()
    db.refresh(db_recommendation)
    return db_recommendation


@router.get("/product/{product_id}", response_model=List[dict])
async def get_recommendations_for_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Pobiera rekomendacje dla danego produktu"""
    recommendations = db.query(ProductRecommendation).filter(
        ProductRecommendation.product_id == product_id,
        ProductRecommendation.is_active == True
    ).order_by(ProductRecommendation.priority.desc()).all()

    result = []
    for rec in recommendations:
        product = db.query(MenuItem).filter(MenuItem.id == rec.recommended_product_id).first()
        if product and product.available:
            result.append({
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "image_url": product.image_url,
                "category": product.category,
                "recommendation_type": rec.recommendation_type,
                "discount_percentage": rec.discount_percentage
            })
    
    return result


@router.get("/smart-suggestions")
async def get_smart_suggestions(
    cart_items: str,  # JSON string z ID produktów w koszyku
    db: Session = Depends(get_db)
):
    """Inteligentne sugestie na podstawie koszyka"""
    import json
    
    try:
        item_ids = json.loads(cart_items)
    except:
        item_ids = []

    suggestions = set()
    
    # Dla każdego produktu w koszyku znajdź rekomendacje
    for item_id in item_ids:
        recommendations = db.query(ProductRecommendation).filter(
            ProductRecommendation.product_id == item_id,
            ProductRecommendation.is_active == True
        ).all()
        
        for rec in recommendations:
            if rec.recommended_product_id not in item_ids:
                suggestions.add(rec.recommended_product_id)
    
    # Pobierz szczegóły sugerowanych produktów
    result = []
    for product_id in list(suggestions)[:5]:  # Maksymalnie 5 sugestii
        product = db.query(MenuItem).filter(
            MenuItem.id == product_id,
            MenuItem.available == True
        ).first()
        if product:
            result.append({
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "image_url": product.image_url,
                "category": product.category
            })
    
    return result


@router.delete("/{recommendation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recommendation(
    recommendation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Usuwa rekomendację (tylko admin)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Brak uprawnień")

    recommendation = db.query(ProductRecommendation).filter(
        ProductRecommendation.id == recommendation_id
    ).first()
    
    if not recommendation:
        raise HTTPException(status_code=404, detail="Rekomendacja nie znaleziona")

    db.delete(recommendation)
    db.commit()
    return None


# Customer Preferences endpoints
class CustomerPreferenceResponse(BaseModel):
    id: int
    customer_phone: str
    customer_name: str | None
    order_frequency: int
    total_spent: float
    average_order_value: float
    preferred_order_type: str | None

    class Config:
        from_attributes = True


@router.get("/customers/{phone}", response_model=CustomerPreferenceResponse | None)
async def get_customer_preferences(
    phone: str,
    db: Session = Depends(get_db)
):
    """Pobiera preferencje klienta po numerze telefonu"""
    pref = db.query(CustomerPreference).filter(
        CustomerPreference.customer_phone == phone
    ).first()
    return pref


@router.post("/customers/update")
async def update_customer_preferences(
    phone: str,
    name: str | None = None,
    order_total: float = 0.0,
    order_type: str | None = None,
    db: Session = Depends(get_db)
):
    """Aktualizuje preferencje klienta po złożeniu zamówienia"""
    pref = db.query(CustomerPreference).filter(
        CustomerPreference.customer_phone == phone
    ).first()

    if not pref:
        pref = CustomerPreference(
            customer_phone=phone,
            customer_name=name,
            order_frequency=1,
            total_spent=order_total,
            average_order_value=order_total,
            preferred_order_type=order_type
        )
        db.add(pref)
    else:
        pref.order_frequency += 1
        pref.total_spent += order_total
        pref.average_order_value = pref.total_spent / pref.order_frequency
        if name:
            pref.customer_name = name
        if order_type:
            pref.preferred_order_type = order_type
    
    from datetime import datetime
    pref.last_order_date = datetime.utcnow()
    
    db.commit()
    db.refresh(pref)
    return {"message": "Preferencje zaktualizowane", "customer": pref}

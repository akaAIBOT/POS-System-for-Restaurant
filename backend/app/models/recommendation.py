from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class ProductRecommendation(Base):
    """Rekomendacje produktów dla cross-sellingu"""
    __tablename__ = "product_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    recommended_product_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    recommendation_type = Column(String, default="cross_sell")  # cross_sell, upsell, bundle
    priority = Column(Integer, default=0)  # wyższy = ważniejszy
    discount_percentage = Column(Float, default=0.0)  # opcjonalna zniżka przy wspólnym zakupie
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Recommendation {self.product_id} -> {self.recommended_product_id}>"


class CustomerPreference(Base):
    """Preferencje klientów dla personalizacji"""
    __tablename__ = "customer_preferences"

    id = Column(Integer, primary_key=True, index=True)
    customer_phone = Column(String, index=True, nullable=False)  # identyfikator klienta
    customer_name = Column(String, nullable=True)
    favorite_items = Column(String, nullable=True)  # JSON lista ulubionych produktów
    order_frequency = Column(Integer, default=0)  # ile razy zamawiał
    total_spent = Column(Float, default=0.0)  # łącznie wydane pieniądze
    average_order_value = Column(Float, default=0.0)  # średnia wartość zamówienia
    last_order_date = Column(DateTime(timezone=True), nullable=True)
    preferred_order_type = Column(String, nullable=True)  # dine_in, takeaway, delivery
    notes = Column(String, nullable=True)  # notatki o kliencie
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<CustomerPreference {self.customer_phone}>"

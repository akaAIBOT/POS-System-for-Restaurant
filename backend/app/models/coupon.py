from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class DiscountType(str, enum.Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"
    FREE_ITEM = "free_item"


class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    discount_type = Column(SQLEnum(DiscountType), nullable=False)
    discount_value = Column(Float, nullable=False)  # procent lub kwota
    min_order_amount = Column(Float, default=0.0)  # minimalna kwota zamówienia
    max_discount_amount = Column(Float, nullable=True)  # maksymalna zniżka
    usage_limit = Column(Integer, nullable=True)  # ile razy można użyć (NULL = nieograniczone)
    usage_count = Column(Integer, default=0)  # ile razy użyto
    valid_from = Column(DateTime(timezone=True), server_default=func.now())
    valid_until = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    applicable_categories = Column(String, nullable=True)  # JSON lista kategorii
    free_item_id = Column(Integer, nullable=True)  # ID darmowego produktu
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Coupon {self.code}>"

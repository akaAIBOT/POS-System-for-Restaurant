from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class OrderType(str, enum.Enum):
    DINE_IN = "dine_in"
    TAKEOUT = "takeout"
    DELIVERY = "delivery"

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PREPARING = "preparing"
    READY = "ready"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class PaymentStatus(str, enum.Enum):
    UNPAID = "unpaid"
    PAID = "paid"
    REFUNDED = "refunded"

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_type = Column(SQLEnum(OrderType), default=OrderType.DINE_IN, nullable=False)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    items = Column(JSON, nullable=False)  # Store as JSON: [{"item_id": 1, "name": "Pizza", "quantity": 2, "price": 12.99}]
    total_price = Column(Float, nullable=False)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    payment_status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.UNPAID, nullable=False)
    payment_method = Column(String, nullable=True)  # "cash", "card", "stripe", "paypal"
    notes = Column(String)
    # Delivery fields
    customer_name = Column(String, nullable=True)
    customer_phone = Column(String, nullable=True)
    delivery_address = Column(String, nullable=True)
    delivery_fee = Column(Float, default=0.0)
    # Coupon fields
    coupon_code = Column(String, nullable=True)
    discount_amount = Column(Float, default=0.0)
    # Split payment
    card_amount = Column(Float, nullable=True)
    cash_amount = Column(Float, nullable=True)
    # Tips and split
    tip_amount = Column(Float, nullable=True)
    split_count = Column(Integer, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    table = relationship("Table", back_populates="orders")
    created_by_user = relationship("User", back_populates="orders")
    payment = relationship("Payment", back_populates="order", uselist=False)

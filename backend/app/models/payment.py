from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, unique=True)
    amount = Column(Float, nullable=False)
    payment_method = Column(String, nullable=False)  # "cash", "card", "stripe", "paypal"
    transaction_id = Column(String, nullable=True)  # External transaction ID (Stripe, PayPal)
    status = Column(String, default="completed")  # "pending", "completed", "failed", "refunded"
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    order = relationship("Order", back_populates="payment")

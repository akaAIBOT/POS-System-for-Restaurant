from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PaymentBase(BaseModel):
    order_id: int
    amount: float
    payment_method: str  # "cash", "card", "stripe", "paypal"

class PaymentCreate(PaymentBase):
    transaction_id: Optional[str] = None

class PaymentResponse(PaymentBase):
    id: int
    transaction_id: Optional[str]
    status: str
    timestamp: datetime

    class Config:
        from_attributes = True

class StripePaymentIntent(BaseModel):
    amount: int  # Amount in cents
    currency: str = "usd"
    order_id: int

class PayPalPaymentCreate(BaseModel):
    order_id: int
    amount: float
    currency: str = "USD"

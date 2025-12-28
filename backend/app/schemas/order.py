from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.order import OrderStatus, PaymentStatus, OrderType

class OrderItem(BaseModel):
    item_id: int
    name: str
    quantity: int
    price: float

class OrderBase(BaseModel):
    order_type: OrderType = OrderType.DINE_IN
    table_id: Optional[int] = None
    items: List[OrderItem]
    notes: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    delivery_address: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    order_type: Optional[OrderType] = None
    table_id: Optional[int] = None
    items: Optional[List[OrderItem]] = None
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    delivery_address: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    order_type: OrderType
    table_id: Optional[int]
    created_by: int
    items: List[dict]
    total_price: float
    status: OrderStatus
    payment_status: PaymentStatus
    payment_method: Optional[str]
    notes: Optional[str]
    customer_name: Optional[str]
    customer_phone: Optional[str]
    delivery_address: Optional[str]
    delivery_fee: float
    timestamp: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.order import Order, OrderStatus, PaymentStatus
from app.models.user import User
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse
from app.api.v1.auth import get_current_user
from app.websocket.connection_manager import manager

router = APIRouter()

@router.get("/", response_model=List[OrderResponse])
def get_orders(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[OrderStatus] = None,
    table_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all orders"""
    query = db.query(Order)
    
    if status_filter:
        query = query.filter(Order.status == status_filter)
    
    if table_id:
        query = query.filter(Order.table_id == table_id)
    
    orders = query.order_by(Order.timestamp.desc()).offset(skip).limit(limit).all()
    return orders

@router.get("/stats")
def get_order_stats(
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get order statistics (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    orders = db.query(Order).filter(Order.timestamp >= start_date).all()
    
    total_orders = len(orders)
    completed_orders = len([o for o in orders if o.status == OrderStatus.COMPLETED])
    total_revenue = sum(o.total_price for o in orders if o.payment_status == PaymentStatus.PAID)
    
    return {
        "total_orders": total_orders,
        "completed_orders": completed_orders,
        "cancelled_orders": len([o for o in orders if o.status == OrderStatus.CANCELLED]),
        "total_revenue": total_revenue,
        "average_order_value": total_revenue / total_orders if total_orders > 0 else 0
    }

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get a specific order"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    return order

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new order"""
    # Calculate total price
    total_price = sum(item.price * item.quantity for item in order.items)
    
    # Calculate delivery fee if applicable
    delivery_fee = 0.0
    if order.order_type == "delivery":
        from app.models.settings import DeliverySettings
        delivery_settings = db.query(DeliverySettings).first()
        if delivery_settings and delivery_settings.delivery_enabled:
            if total_price < delivery_settings.free_delivery_threshold:
                delivery_fee = delivery_settings.delivery_fee
            total_price += delivery_fee
    
    # Convert items to dict for JSON storage
    items_data = [item.model_dump() for item in order.items]
    
    new_order = Order(
        order_type=order.order_type,
        table_id=order.table_id,
        created_by=current_user.id,
        items=items_data,
        total_price=total_price,
        notes=order.notes,
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        delivery_address=order.delivery_address,
        delivery_fee=delivery_fee,
        status=OrderStatus.PENDING,
        payment_status=PaymentStatus.UNPAID
    )
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # Broadcast order creation via WebSocket
    await manager.broadcast(f"New order created: #{new_order.id}")
    
    return new_order

@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    order_update: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an order"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    # Update fields
    if order_update.table_id is not None:
        order.table_id = order_update.table_id
    
    if order_update.items is not None:
        items_data = [item.model_dump() for item in order_update.items]
        order.items = items_data
        order.total_price = sum(item.price * item.quantity for item in order_update.items)
    
    if order_update.status is not None:
        order.status = order_update.status
    
    if order_update.payment_status is not None:
        order.payment_status = order_update.payment_status
    
    if order_update.payment_method is not None:
        order.payment_method = order_update.payment_method
    
    if order_update.notes is not None:
        order.notes = order_update.notes
    
    order.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(order)
    
    # Broadcast order update via WebSocket
    await manager.broadcast(f"Order #{order_id} updated: {order.status}")
    
    return order

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an order (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    db.delete(order)
    db.commit()
    
    return None

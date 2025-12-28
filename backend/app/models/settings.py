from sqlalchemy import Column, Integer, String, Boolean, Float
from app.core.database import Base

class RestaurantSettings(Base):
    __tablename__ = "restaurant_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False, index=True)
    value = Column(String, nullable=False)
    
class DeliverySettings(Base):
    __tablename__ = "delivery_settings"

    id = Column(Integer, primary_key=True, index=True)
    delivery_enabled = Column(Boolean, default=True, nullable=False)
    delivery_fee = Column(Float, default=5.0, nullable=False)
    free_delivery_threshold = Column(Float, default=50.0, nullable=False)
    min_order_amount = Column(Float, default=15.0, nullable=False)
    max_delivery_distance = Column(Float, default=10.0, nullable=False)  # km
    estimated_delivery_time = Column(Integer, default=45, nullable=False)  # minutes

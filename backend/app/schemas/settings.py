from pydantic import BaseModel
from typing import Optional

class DeliverySettingsBase(BaseModel):
    delivery_enabled: bool
    delivery_fee: float
    free_delivery_threshold: float
    min_order_amount: float
    max_delivery_distance: float
    estimated_delivery_time: int

class DeliverySettingsCreate(DeliverySettingsBase):
    pass

class DeliverySettingsUpdate(BaseModel):
    delivery_enabled: Optional[bool] = None
    delivery_fee: Optional[float] = None
    free_delivery_threshold: Optional[float] = None
    min_order_amount: Optional[float] = None
    max_delivery_distance: Optional[float] = None
    estimated_delivery_time: Optional[int] = None

class DeliverySettingsResponse(DeliverySettingsBase):
    id: int
    
    class Config:
        from_attributes = True

class RestaurantSettingResponse(BaseModel):
    key: str
    value: str
    
    class Config:
        from_attributes = True

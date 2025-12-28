from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class WorkLogBase(BaseModel):
    notes: Optional[str] = None

class WorkLogClockIn(WorkLogBase):
    pass

class WorkLogClockOut(BaseModel):
    notes: Optional[str] = None

class WorkLogResponse(BaseModel):
    id: int
    user_id: int
    clock_in: datetime
    clock_out: Optional[datetime]
    notes: Optional[str]
    user_name: Optional[str] = None
    hours_worked: Optional[float] = None
    
    class Config:
        from_attributes = True

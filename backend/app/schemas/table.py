from pydantic import BaseModel
from typing import Optional
from app.models.table import TableStatus

class TableBase(BaseModel):
    number: int
    capacity: int = 4
    status: TableStatus = TableStatus.AVAILABLE

class TableCreate(TableBase):
    pass

class TableUpdate(BaseModel):
    number: Optional[int] = None
    capacity: Optional[int] = None
    status: Optional[TableStatus] = None

class TableResponse(TableBase):
    id: int

    class Config:
        from_attributes = True

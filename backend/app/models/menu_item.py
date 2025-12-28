from sqlalchemy import Column, Integer, String, Float, Text
from app.core.database import Base

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    price = Column(Float, nullable=False)
    category = Column(String, nullable=False, index=True)
    image_url = Column(String)
    available = Column(Integer, default=1)  # 1 = available, 0 = unavailable

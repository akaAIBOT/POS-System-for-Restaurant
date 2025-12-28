from sqlalchemy import Column, Integer, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class WorkLog(Base):
    __tablename__ = "work_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    clock_in = Column(DateTime, default=datetime.utcnow, nullable=False)
    clock_out = Column(DateTime, nullable=True)
    notes = Column(String, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="work_logs")

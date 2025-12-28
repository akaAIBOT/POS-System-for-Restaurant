from sqlalchemy import Column, Integer, String, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    STAFF = "staff"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.STAFF, nullable=False)
    
    # Staff profile fields
    pin_code = Column(String(4), nullable=True)  # 4-digit PIN for quick login
    avatar_url = Column(String, nullable=True)  # Avatar image URL
    full_name = Column(String, nullable=True)  # Display name
    position = Column(String, nullable=True)  # Job position (e.g., "Cashier", "Cook")
    phone = Column(String, nullable=True)  # Contact phone
    is_active = Column(Integer, default=1)  # Active status
    
    # Relationships
    orders = relationship("Order", back_populates="created_by_user")
    work_logs = relationship("WorkLog", back_populates="user")

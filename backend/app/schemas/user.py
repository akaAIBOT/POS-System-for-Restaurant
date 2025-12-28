from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.models.user import UserRole

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole = UserRole.STAFF

class UserCreate(UserBase):
    password: str
    full_name: Optional[str] = None
    position: Optional[str] = None
    phone: Optional[str] = None
    pin_code: Optional[str] = Field(None, min_length=4, max_length=4, pattern=r'^\d{4}$')

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    full_name: Optional[str] = None
    position: Optional[str] = None
    phone: Optional[str] = None
    pin_code: Optional[str] = Field(None, min_length=4, max_length=4, pattern=r'^\d{4}$')
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    full_name: Optional[str] = None
    position: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: int = 1

    class Config:
        from_attributes = True

class StaffProfileResponse(BaseModel):
    id: int
    name: str
    full_name: Optional[str] = None
    position: Optional[str] = None
    avatar_url: Optional[str] = None
    role: UserRole
    is_active: int = 1
    
    class Config:
        from_attributes = True

class PINLoginRequest(BaseModel):
    user_id: int
    pin_code: str = Field(..., min_length=4, max_length=4, pattern=r'^\d{4}$')

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None

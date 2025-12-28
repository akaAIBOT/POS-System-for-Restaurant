from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, Enum as SQLEnum
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class CampaignType(str, enum.Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"


class CampaignStatus(str, enum.Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    COMPLETED = "completed"
    PAUSED = "paused"


class TriggerType(str, enum.Enum):
    MANUAL = "manual"
    NEW_CUSTOMER = "new_customer"
    BIRTHDAY = "birthday"
    INACTIVE_CUSTOMER = "inactive_customer"
    ORDER_THRESHOLD = "order_threshold"
    LOYALTY_REWARD = "loyalty_reward"


class MarketingCampaign(Base):
    """Kampanie marketingowe"""
    __tablename__ = "marketing_campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    campaign_type = Column(SQLEnum(CampaignType), nullable=False)
    status = Column(SQLEnum(CampaignStatus), default=CampaignStatus.DRAFT)
    trigger_type = Column(SQLEnum(TriggerType), default=TriggerType.MANUAL)
    
    # Content
    subject = Column(String, nullable=True)  # temat emaila
    message_template = Column(Text, nullable=False)  # treść wiadomości
    
    # Targeting
    target_segment = Column(String, nullable=True)  # "all", "vip", "inactive", etc.
    min_order_count = Column(Integer, default=0)
    min_total_spent = Column(Float, default=0.0)
    
    # Scheduling
    scheduled_date = Column(DateTime(timezone=True), nullable=True)
    
    # Coupon integration
    coupon_code = Column(String, nullable=True)  # automatycznie przypisany kupon
    
    # Statistics
    sent_count = Column(Integer, default=0)
    opened_count = Column(Integer, default=0)
    clicked_count = Column(Integer, default=0)
    converted_count = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<MarketingCampaign {self.name}>"


class MarketingMessage(Base):
    """Historie wysłanych wiadomości"""
    __tablename__ = "marketing_messages"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, nullable=True)
    customer_phone = Column(String, index=True, nullable=False)
    customer_email = Column(String, nullable=True)
    message_type = Column(SQLEnum(CampaignType), nullable=False)
    subject = Column(String, nullable=True)
    message_content = Column(Text, nullable=False)
    
    # Status
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    delivered = Column(Boolean, default=False)
    opened = Column(Boolean, default=False)
    clicked = Column(Boolean, default=False)
    converted = Column(Boolean, default=False)  # czy klient skorzystał
    
    # Error handling
    error_message = Column(String, nullable=True)

    def __repr__(self):
        return f"<MarketingMessage {self.id} to {self.customer_phone}>"


class LoyaltyProgram(Base):
    """Program lojalnościowy"""
    __tablename__ = "loyalty_programs"

    id = Column(Integer, primary_key=True, index=True)
    customer_phone = Column(String, index=True, nullable=False, unique=True)
    customer_name = Column(String, nullable=True)
    points = Column(Integer, default=0)
    tier = Column(String, default="bronze")  # bronze, silver, gold, platinum
    total_visits = Column(Integer, default=0)
    total_spent = Column(Float, default=0.0)
    last_visit = Column(DateTime(timezone=True), nullable=True)
    birthday = Column(DateTime(timezone=True), nullable=True)
    referral_code = Column(String, unique=True, nullable=True)
    referred_by = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<LoyaltyProgram {self.customer_phone} - {self.tier}>"

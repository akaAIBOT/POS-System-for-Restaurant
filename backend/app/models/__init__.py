# Import all models here for Alembic migrations
from app.models.user import User
from app.models.menu_item import MenuItem
from app.models.table import Table
from app.models.order import Order
from app.models.payment import Payment
from app.models.coupon import Coupon
from app.models.recommendation import ProductRecommendation, CustomerPreference
from app.models.marketing import MarketingCampaign, MarketingMessage, LoyaltyProgram

__all__ = ["User", "MenuItem", "Table", "Order", "Payment", "Coupon", "ProductRecommendation", "CustomerPreference", "MarketingCampaign", "MarketingMessage", "LoyaltyProgram"]

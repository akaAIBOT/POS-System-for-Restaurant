from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.marketing import MarketingCampaign, MarketingMessage, LoyaltyProgram, CampaignType, CampaignStatus, TriggerType
from app.models.recommendation import CustomerPreference
from app.models.user import User
from pydantic import BaseModel
import random
import string

router = APIRouter()


# Pydantic schemas
class CampaignCreate(BaseModel):
    name: str
    description: str | None = None
    campaign_type: CampaignType
    trigger_type: TriggerType = TriggerType.MANUAL
    subject: str | None = None
    message_template: str
    target_segment: str | None = "all"
    min_order_count: int = 0
    min_total_spent: float = 0.0
    scheduled_date: datetime | None = None
    coupon_code: str | None = None


class CampaignResponse(BaseModel):
    id: int
    name: str
    campaign_type: CampaignType
    status: CampaignStatus
    sent_count: int
    opened_count: int
    clicked_count: int
    converted_count: int

    class Config:
        from_attributes = True


class LoyaltyProgramResponse(BaseModel):
    id: int
    customer_phone: str
    customer_name: str | None
    points: int
    tier: str
    total_visits: int
    total_spent: float
    referral_code: str | None

    class Config:
        from_attributes = True


# Helper functions
def generate_referral_code(length=8):
    """Generuje unikalny kod polecający"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))


async def send_sms(phone: str, message: str):
    """Wysyłanie SMS (integracja z Twilio, MessageBird, etc.)"""
    print(f"[SMS] Wysyłanie do {phone}: {message}")
    return True


async def send_email(email: str, subject: str, message: str):
    """Wysyłanie emaili (integracja z SendGrid, Mailgun, etc.)"""
    print(f"[EMAIL] Wysyłanie do {email}: {subject}")
    return True


# API Endpoints
@router.post("/campaigns", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    campaign: CampaignCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Tworzy nową kampanię marketingową (tylko admin)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Brak uprawnień")

    db_campaign = MarketingCampaign(**campaign.dict())
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return db_campaign


@router.get("/campaigns", response_model=List[CampaignResponse])
async def get_campaigns(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Pobiera listę kampanii"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Brak uprawnień")
    
    return db.query(MarketingCampaign).all()


@router.post("/campaigns/{campaign_id}/send")
async def send_campaign(
    campaign_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Wysyła kampanię do wybranej grupy klientów"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Brak uprawnień")

    campaign = db.query(MarketingCampaign).filter(MarketingCampaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Kampania nie znaleziona")

    # Pobierz klientów według segmentu
    customers = db.query(CustomerPreference).filter(
        CustomerPreference.order_frequency >= campaign.min_order_count,
        CustomerPreference.total_spent >= campaign.min_total_spent
    ).all()

    sent_count = 0
    for customer in customers:
        # Personalizuj wiadomość
        message = campaign.message_template.replace("{name}", customer.customer_name or "Kliencie")
        if campaign.coupon_code:
            message += f"\n\nTwój kod rabatowy: {campaign.coupon_code}"

        # Utwórz rekord wiadomości
        msg = MarketingMessage(
            campaign_id=campaign.id,
            customer_phone=customer.customer_phone,
            message_type=campaign.campaign_type,
            subject=campaign.subject,
            message_content=message
        )
        db.add(msg)
        
        # Wyślij w tle
        if campaign.campaign_type == CampaignType.SMS:
            background_tasks.add_task(send_sms, customer.customer_phone, message)
        
        sent_count += 1

    campaign.sent_count = sent_count
    campaign.status = CampaignStatus.ACTIVE
    db.commit()

    return {"message": f"Kampania wysłana do {sent_count} klientów"}


# Loyalty Program endpoints
@router.post("/loyalty/enroll")
async def enroll_in_loyalty_program(
    phone: str,
    name: str | None = None,
    db: Session = Depends(get_db)
):
    """Zapisuje klienta do programu lojalnościowego"""
    existing = db.query(LoyaltyProgram).filter(LoyaltyProgram.customer_phone == phone).first()
    if existing:
        return {"message": "Klient już jest w programie", "loyalty": existing}

    referral_code = generate_referral_code()
    loyalty = LoyaltyProgram(
        customer_phone=phone,
        customer_name=name,
        referral_code=referral_code
    )
    
    db.add(loyalty)
    db.commit()
    db.refresh(loyalty)
    
    return {"message": "Zapisano do programu lojalnościowego", "loyalty": loyalty}


@router.get("/loyalty/{phone}", response_model=LoyaltyProgramResponse | None)
async def get_loyalty_info(
    phone: str,
    db: Session = Depends(get_db)
):
    """Pobiera informacje o programie lojalnościowym klienta"""
    loyalty = db.query(LoyaltyProgram).filter(LoyaltyProgram.customer_phone == phone).first()
    return loyalty


@router.post("/loyalty/{phone}/add-points")
async def add_loyalty_points(
    phone: str,
    points: int,
    order_total: float,
    db: Session = Depends(get_db)
):
    """Dodaje punkty lojalnościowe za zamówienie"""
    loyalty = db.query(LoyaltyProgram).filter(LoyaltyProgram.customer_phone == phone).first()
    
    if not loyalty:
        # Auto-enroll jeśli nie ma konta
        loyalty = LoyaltyProgram(
            customer_phone=phone,
            referral_code=generate_referral_code()
        )
        db.add(loyalty)

    loyalty.points += points
    loyalty.total_visits += 1
    loyalty.total_spent += order_total
    loyalty.last_visit = datetime.utcnow()

    # Aktualizuj tier na podstawie wydanych pieniędzy
    if loyalty.total_spent >= 5000:
        loyalty.tier = "platinum"
    elif loyalty.total_spent >= 2000:
        loyalty.tier = "gold"
    elif loyalty.total_spent >= 500:
        loyalty.tier = "silver"

    db.commit()
    db.refresh(loyalty)
    
    return {"message": f"Dodano {points} punktów", "loyalty": loyalty}


@router.post("/loyalty/{phone}/redeem")
async def redeem_loyalty_points(
    phone: str,
    points: int,
    db: Session = Depends(get_db)
):
    """Wykorzystaj punkty lojalnościowe"""
    loyalty = db.query(LoyaltyProgram).filter(LoyaltyProgram.customer_phone == phone).first()
    
    if not loyalty:
        raise HTTPException(status_code=404, detail="Konto lojalnościowe nie znalezione")
    
    if loyalty.points < points:
        raise HTTPException(status_code=400, detail="Niewystarczająca ilość punktów")

    loyalty.points -= points
    discount_amount = points * 0.10  # 1 punkt = 0.10 zł zniżki
    
    db.commit()
    
    return {
        "message": f"Wykorzystano {points} punktów",
        "discount_amount": discount_amount,
        "remaining_points": loyalty.points
    }


@router.get("/analytics/inactive-customers")
async def get_inactive_customers(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Znajduje nieaktywnych klientów (nie zamawiali od X dni)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Brak uprawnień")

    threshold_date = datetime.utcnow() - timedelta(days=days)
    
    inactive = db.query(CustomerPreference).filter(
        CustomerPreference.last_order_date < threshold_date,
        CustomerPreference.order_frequency > 0
    ).all()

    return {
        "count": len(inactive),
        "customers": [
            {
                "phone": c.customer_phone,
                "name": c.customer_name,
                "last_order": c.last_order_date,
                "total_spent": c.total_spent
            }
            for c in inactive
        ]
    }


@router.post("/auto-triggers/check")
async def check_marketing_triggers(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Sprawdza i uruchamia automatyczne triggery marketingowe"""
    
    # 1. Birthday campaigns
    today = datetime.utcnow().date()
    birthday_customers = db.query(LoyaltyProgram).filter(
        LoyaltyProgram.birthday != None
    ).all()
    
    for customer in birthday_customers:
        if customer.birthday and customer.birthday.date() == today:
            message = f"🎉 Wszystkiego najlepszego {customer.customer_name}! Masz 20% zniżki na dzisiejsze zamówienie. Kod: BIRTHDAY20"
            background_tasks.add_task(send_sms, customer.customer_phone, message)
    
    # 2. Inactive customer re-engagement
    threshold_date = datetime.utcnow() - timedelta(days=30)
    inactive = db.query(CustomerPreference).filter(
        CustomerPreference.last_order_date < threshold_date,
        CustomerPreference.order_frequency >= 3
    ).limit(10).all()
    
    for customer in inactive:
        message = f"Tęsknimy za Tobą! Specjalna oferta: 15% zniżki. Kod: COMEBACK15"
        background_tasks.add_task(send_sms, customer.customer_phone, message)
    
    return {"message": "Triggery sprawdzone i uruchomione"}

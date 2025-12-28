from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Optional
import stripe
import paypalrestsdk

from app.core.database import get_db
from app.core.config import settings
from app.models.payment import Payment
from app.models.order import Order, PaymentStatus
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentResponse, StripePaymentIntent, PayPalPaymentCreate
from app.api.v1.auth import get_current_user

router = APIRouter()

# Configure Stripe
if settings.STRIPE_API_KEY:
    stripe.api_key = settings.STRIPE_API_KEY

# Configure PayPal
if settings.PAYPAL_CLIENT_ID and settings.PAYPAL_CLIENT_SECRET:
    paypalrestsdk.configure({
        "mode": settings.PAYPAL_MODE,
        "client_id": settings.PAYPAL_CLIENT_ID,
        "client_secret": settings.PAYPAL_CLIENT_SECRET
    })

@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a payment record"""
    # Verify order exists
    order = db.query(Order).filter(Order.id == payment.order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    # Check if payment already exists for this order
    existing_payment = db.query(Payment).filter(Payment.order_id == payment.order_id).first()
    if existing_payment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment already exists for this order"
        )
    
    # Create payment record
    new_payment = Payment(
        order_id=payment.order_id,
        amount=payment.amount,
        payment_method=payment.payment_method,
        transaction_id=payment.transaction_id,
        status="completed"
    )
    
    db.add(new_payment)
    
    # Update order payment status
    order.payment_status = PaymentStatus.PAID
    order.payment_method = payment.payment_method
    
    db.commit()
    db.refresh(new_payment)
    
    return new_payment

@router.post("/stripe/create-payment-intent")
def create_stripe_payment_intent(
    payment_data: StripePaymentIntent,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a Stripe payment intent"""
    if not settings.STRIPE_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe is not configured"
        )
    
    # Verify order exists
    order = db.query(Order).filter(Order.id == payment_data.order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    try:
        # Create Stripe payment intent
        intent = stripe.PaymentIntent.create(
            amount=payment_data.amount,
            currency=payment_data.currency,
            metadata={"order_id": payment_data.order_id}
        )
        
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id
        }
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/stripe/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook events"""
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)
    
    # Handle successful payment
    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        order_id = int(payment_intent["metadata"]["order_id"])
        
        # Create payment record
        order = db.query(Order).filter(Order.id == order_id).first()
        if order:
            payment = Payment(
                order_id=order_id,
                amount=payment_intent["amount"] / 100,  # Convert from cents
                payment_method="stripe",
                transaction_id=payment_intent["id"],
                status="completed"
            )
            db.add(payment)
            
            order.payment_status = PaymentStatus.PAID
            order.payment_method = "stripe"
            
            db.commit()
    
    return {"status": "success"}

@router.post("/paypal/create-payment")
def create_paypal_payment(
    payment_data: PayPalPaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a PayPal payment"""
    if not (settings.PAYPAL_CLIENT_ID and settings.PAYPAL_CLIENT_SECRET):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="PayPal is not configured"
        )
    
    # Verify order exists
    order = db.query(Order).filter(Order.id == payment_data.order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    try:
        payment = paypalrestsdk.Payment({
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "transactions": [{
                "amount": {
                    "total": str(payment_data.amount),
                    "currency": payment_data.currency
                },
                "description": f"Order #{payment_data.order_id}"
            }],
            "redirect_urls": {
                "return_url": "http://localhost:3000/payment/success",
                "cancel_url": "http://localhost:3000/payment/cancel"
            }
        })
        
        if payment.create():
            # Get approval URL
            for link in payment.links:
                if link.rel == "approval_url":
                    return {
                        "payment_id": payment.id,
                        "approval_url": link.href
                    }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=payment.error
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a payment record"""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    
    return payment

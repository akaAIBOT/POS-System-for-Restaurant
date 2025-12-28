import sys
sys.path.insert(0, '/app')

from app.core.database import SessionLocal
from app.models import order, user, work_log  # Import all models first
from app.models.order import Order, OrderStatus, PaymentStatus

db = SessionLocal()

try:
    # Check existing orders
    count_before = db.query(Order).count()
    print(f"Zamówień przed: {count_before}")
    
    # Create test orders
    test_orders = [
        Order(
            order_type="DINE_IN",
            table_id=None,
            status=OrderStatus.PENDING,
            payment_status=PaymentStatus.UNPAID,
            items=[{"name": "Pad Thai", "quantity": 2, "price": 32.0}],
            total_price=64.0,
            created_by=1
        ),
        Order(
            order_type="DELIVERY",
            status=OrderStatus.PREPARING,
            payment_status=PaymentStatus.PAID,
            items=[{"name": "Tom Yum Soup", "quantity": 1, "price": 28.0}],
            total_price=28.0,
            customer_name="Jan Kowalski",
            customer_phone="123456789",
            delivery_address="ul. Testowa 1",
            created_by=1
        ),
        Order(
            order_type="TAKEOUT",
            status=OrderStatus.READY,
            payment_status=PaymentStatus.PAID,
            items=[{"name": "Green Curry", "quantity": 1, "price": 35.0}],
            total_price=35.0,
            customer_name="Anna Nowak",
            customer_phone="987654321",
            created_by=1
        )
    ]
    
    for order in test_orders:
        db.add(order)
    
    db.commit()
    count_after = db.query(Order).count()
    print(f"Zamówień po: {count_after}")
    print(f"✅ Utworzono {count_after - count_before} nowych zamówień")
    
except Exception as e:
    print(f"❌ Błąd: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()

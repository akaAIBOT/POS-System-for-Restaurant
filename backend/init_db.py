from app.core.database import engine, Base, SessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.menu_item import MenuItem
from app.models.order import Order
from app.models.table import Table
from app.models.payment import Payment
from app.models.settings import RestaurantSettings, DeliverySettings
from app.models.work_log import WorkLog

print("Dropping all tables...")
Base.metadata.drop_all(bind=engine)

print("Creating all tables...")
Base.metadata.create_all(bind=engine)

print("Creating default users...")
db = SessionLocal()

try:
    # Create admin user with username "admin"
    admin = User(
        name="admin",  # This is username for login
        email="admin@restaurant.com",
        password_hash=get_password_hash("admin123"),
        full_name="Administrator",
        role="admin",
        is_active=1
    )
    db.add(admin)
    
    # Create staff user with username "staff"
    staff = User(
        name="staff",  # This is username for login
        email="staff@restaurant.com",
        password_hash=get_password_hash("staff123"),
        full_name="Staff Member",
        role="staff",
        is_active=1
    )
    db.add(staff)
    
    db.commit()
    
    print("✅ Admin created: login='admin' / password='admin123'")
    print("✅ Staff created: login='staff' / password='staff123'")
    print("✅ Database initialized successfully!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
finally:
    db.close()

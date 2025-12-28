"""Add new fields to users table"""
from app.core.database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN pin_code VARCHAR(4)"))
            conn.commit()
            print("✅ Added pin_code column")
        except Exception as e:
            print(f"pin_code: {e}")
        
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN avatar_url VARCHAR"))
            conn.commit()
            print("✅ Added avatar_url column")
        except Exception as e:
            print(f"avatar_url: {e}")
        
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN full_name VARCHAR"))
            conn.commit()
            print("✅ Added full_name column")
        except Exception as e:
            print(f"full_name: {e}")
        
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN position VARCHAR"))
            conn.commit()
            print("✅ Added position column")
        except Exception as e:
            print(f"position: {e}")
        
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR"))
            conn.commit()
            print("✅ Added phone column")
        except Exception as e:
            print(f"phone: {e}")
        
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1"))
            conn.commit()
            print("✅ Added is_active column")
        except Exception as e:
            print(f"is_active: {e}")
    
    print("\n✅ Migration completed!")

if __name__ == "__main__":
    migrate()

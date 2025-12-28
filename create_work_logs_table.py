"""Script to create work_logs table"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.core.database import engine, Base
from app.models.work_log import WorkLog
from app.models.user import User

def create_tables():
    print("Creating work_logs table...")
    Base.metadata.create_all(bind=engine)
    print("✅ Work logs table created successfully!")

if __name__ == "__main__":
    create_tables()

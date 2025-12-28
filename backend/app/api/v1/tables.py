from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.table import Table, TableStatus
from app.models.user import User
from app.schemas.table import TableCreate, TableUpdate, TableResponse
from app.api.v1.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[TableResponse])
def get_tables(
    skip: int = 0,
    limit: int = 100,
    status_filter: TableStatus = None,
    db: Session = Depends(get_db)
):
    """Get all tables"""
    query = db.query(Table)
    
    if status_filter:
        query = query.filter(Table.status == status_filter)
    
    tables = query.offset(skip).limit(limit).all()
    return tables

@router.get("/{table_id}", response_model=TableResponse)
def get_table(table_id: int, db: Session = Depends(get_db)):
    """Get a specific table"""
    table = db.query(Table).filter(Table.id == table_id).first()
    if not table:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table not found")
    
    return table

@router.post("/", response_model=TableResponse, status_code=status.HTTP_201_CREATED)
def create_table(
    table: TableCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new table (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # Check if table number already exists
    existing_table = db.query(Table).filter(Table.number == table.number).first()
    if existing_table:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Table number already exists"
        )
    
    new_table = Table(
        number=table.number,
        capacity=table.capacity,
        status=table.status
    )
    
    db.add(new_table)
    db.commit()
    db.refresh(new_table)
    
    return new_table

@router.put("/{table_id}", response_model=TableResponse)
def update_table(
    table_id: int,
    table_update: TableUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a table"""
    table = db.query(Table).filter(Table.id == table_id).first()
    if not table:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table not found")
    
    # Update fields
    if table_update.number is not None:
        # Check if new number already exists
        existing = db.query(Table).filter(
            Table.number == table_update.number,
            Table.id != table_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Table number already exists"
            )
        table.number = table_update.number
    
    if table_update.capacity is not None:
        table.capacity = table_update.capacity
    
    if table_update.status is not None:
        table.status = table_update.status
    
    db.commit()
    db.refresh(table)
    
    return table

@router.delete("/{table_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_table(
    table_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a table (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    table = db.query(Table).filter(Table.id == table_id).first()
    if not table:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table not found")
    
    db.delete(table)
    db.commit()
    
    return None

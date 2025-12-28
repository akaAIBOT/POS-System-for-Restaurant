from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.work_log import WorkLog
from app.models.user import User, UserRole
from app.schemas.work_log import WorkLogClockIn, WorkLogClockOut, WorkLogResponse
from app.api.v1.auth import get_current_user

router = APIRouter()

def require_admin(current_user: User = Depends(get_current_user)):
    """Require admin role"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@router.post("/clock-in", response_model=WorkLogResponse)
def clock_in(
    log_data: WorkLogClockIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clock in for work"""
    # Check if user is already clocked in
    active_log = db.query(WorkLog).filter(
        WorkLog.user_id == current_user.id,
        WorkLog.clock_out == None
    ).first()
    
    if active_log:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already clocked in. Please clock out first."
        )
    
    new_log = WorkLog(
        user_id=current_user.id,
        notes=log_data.notes
    )
    
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    
    return new_log

@router.post("/clock-out", response_model=WorkLogResponse)
def clock_out(
    log_data: WorkLogClockOut,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clock out from work"""
    # Find active log
    active_log = db.query(WorkLog).filter(
        WorkLog.user_id == current_user.id,
        WorkLog.clock_out == None
    ).first()
    
    if not active_log:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not clocked in. Please clock in first."
        )
    
    active_log.clock_out = datetime.utcnow()
    if log_data.notes:
        active_log.notes = log_data.notes
    
    db.commit()
    db.refresh(active_log)
    
    return active_log

@router.get("/status", response_model=Optional[WorkLogResponse])
def get_work_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current work status"""
    active_log = db.query(WorkLog).filter(
        WorkLog.user_id == current_user.id,
        WorkLog.clock_out == None
    ).first()
    
    return active_log

@router.get("/", response_model=List[WorkLogResponse])
def get_work_logs(
    user_id: Optional[int] = None,
    days: int = 7,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get work logs (admin can see all, staff only their own)"""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    query = db.query(WorkLog).filter(WorkLog.clock_in >= start_date)
    
    if current_user.role == UserRole.ADMIN:
        if user_id:
            query = query.filter(WorkLog.user_id == user_id)
    else:
        query = query.filter(WorkLog.user_id == current_user.id)
    
    logs = query.order_by(WorkLog.clock_in.desc()).offset(skip).limit(limit).all()
    
    # Add calculated fields
    result = []
    for log in logs:
        log_dict = {
            "id": log.id,
            "user_id": log.user_id,
            "clock_in": log.clock_in,
            "clock_out": log.clock_out,
            "notes": log.notes,
            "user_name": log.user.name if log.user else None,
            "hours_worked": None
        }
        
        if log.clock_out:
            delta = log.clock_out - log.clock_in
            log_dict["hours_worked"] = round(delta.total_seconds() / 3600, 2)
        
        result.append(WorkLogResponse(**log_dict))
    
    return result

@router.get("/stats")
def get_work_stats(
    user_id: Optional[int] = None,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get work statistics (admin only)"""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    query = db.query(WorkLog).filter(
        WorkLog.clock_in >= start_date,
        WorkLog.clock_out != None
    )
    
    if user_id:
        query = query.filter(WorkLog.user_id == user_id)
    
    logs = query.all()
    
    total_hours = 0
    for log in logs:
        if log.clock_out:
            delta = log.clock_out - log.clock_in
            total_hours += delta.total_seconds() / 3600
    
    return {
        "total_logs": len(logs),
        "total_hours": round(total_hours, 2),
        "average_hours_per_day": round(total_hours / days, 2) if days > 0 else 0,
        "period_days": days
    }

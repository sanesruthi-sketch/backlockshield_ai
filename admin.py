from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from backend.app.db.database import get_db
from backend.app.db.models import User, AuditEvent
from backend.app.api.deps import get_current_user
from backend.app.services.csv_service import CSVImportService
from backend.app.schemas.models import (
    CSVPreviewResponse,
    CSVCommitRequest,
    CSVCommitResponse,
    AuditEventResponse
)

router = APIRouter()

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Enforce admin-only authorization on sensitive institutional endpoints."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Administrative privileges required to access this resource.")
    return current_user

@router.get("/users")
def list_system_users(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Lists institutional users and roles."""
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.strftime("%b %d, %Y") if u.created_at else "Recent"
        }
        for u in users
    ]

@router.post("/csv/preview", response_model=CSVPreviewResponse)
async def preview_csv_upload(
    file: UploadFile = File(...),
    admin: User = Depends(require_admin)
):
    """
    Validates CSV headers, types, and value ranges prior to commit.
    Provides row-by-row error reporting.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only verified .csv files are supported.")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="File size exceeds maximum 5MB institutional limit.")

    return CSVImportService.preview_csv(content, file.filename)

@router.post("/csv/commit", response_model=CSVCommitResponse)
def commit_csv_import(
    req: CSVCommitRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Transactionally commits verified CSV rows into institutional student tables.
    Logs audit event.
    """
    return CSVImportService.commit_import(
        db=db,
        valid_rows=req.valid_rows,
        actor_user_id=admin.id
    )

@router.get("/audit-events", response_model=List[AuditEventResponse])
def get_audit_trail(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Retrieves institutional data modification audit trail."""
    events = db.query(AuditEvent).order_by(AuditEvent.created_at.desc()).limit(50).all()
    return [
        {
            "id": e.id,
            "actor_email": e.actor.email if e.actor else "system",
            "action": e.action,
            "entity_type": e.entity_type,
            "details": e.details,
            "created_at": e.created_at.strftime("%b %d, %Y %I:%M %p") if e.created_at else "Recent"
        }
        for e in events
    ]

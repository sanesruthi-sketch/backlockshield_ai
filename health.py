from fastapi import APIRouter
from datetime import datetime
from backend.app.core.config import settings

router = APIRouter()

@router.get("/health")
def health_check():
    """
    Heartbeat and connectivity verification endpoint.
    Used by frontend to verify FastAPI availability and calculate latency.
    """
    return {
        "status": "online",
        "version": settings.PROJECT_VERSION,
        "platform": settings.PROJECT_NAME,
        "team": "DEBUG MASTERS · HacXLerate 2026",
        "timestamp": datetime.utcnow().isoformat()
    }

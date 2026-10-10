from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.db.models import Student
from backend.app.api.deps import get_current_student
from backend.app.services.planner_service import StudyPlannerService
from backend.app.schemas.models import StudyPlannerResponse, CompleteTaskRequest

router = APIRouter()

@router.get("", response_model=StudyPlannerResponse)
def get_study_planner(
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """
    Returns rolling 7-day study planner, tasks, planned vs actual study time,
    and completion statistics.
    """
    return StudyPlannerService.get_student_study_plan(db=db, student_id=student.id)

@router.post("/generate", response_model=StudyPlannerResponse)
def generate_study_plan(
    daily_minutes: int = 45,
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """
    Synthesizes a personalized 7-day study plan grounded in actual
    topic learning gaps (<70% mastery).
    """
    StudyPlannerService.generate_rolling_plan(db=db, student_id=student.id, daily_minutes=daily_minutes)
    return StudyPlannerService.get_student_study_plan(db=db, student_id=student.id)

@router.post("/{task_id}/complete")
def complete_study_task(
    task_id: str,
    req: CompleteTaskRequest,
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """
    Marks study task completed and records verified actual study minutes.
    """
    task = StudyPlannerService.complete_task(
        db=db,
        student_id=student.id,
        task_id=task_id,
        actual_minutes=req.actual_minutes
    )
    if not task:
        raise HTTPException(status_code=404, detail="Study task not found")
    return {"success": True, "task_id": task.id, "status": task.status, "actual_minutes": task.actual_minutes}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.db.models import Student
from backend.app.api.deps import get_current_student
from backend.app.services.quiz_service import QuizService
from backend.app.schemas.models import (
    QuizStartRequest,
    QuizStartResponse,
    QuizSubmitRequest,
    QuizSubmitResponse
)

router = APIRouter()

@router.post("/start", response_model=QuizStartResponse)
def start_adaptive_quiz(
    req: QuizStartRequest,
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """
    Initializes an adaptive quiz. Questions are dynamically selected according to
    student's current mastery level. Correct answer keys are strictly withheld.
    """
    return QuizService.start_quiz(
        db=db,
        course_id=req.course_id,
        topic_name=req.topic_name,
        student_id=student.id
    )

@router.post("/submit", response_model=QuizSubmitResponse)
def submit_quiz(
    req: QuizSubmitRequest,
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """
    Evaluates submitted answers server-side, prevents score tampering,
    records the attempt in history, and updates topic mastery in the Learning Twin.
    """
    submissions_data = [
        {"question_id": s.question_id, "selected_option": s.selected_option}
        for s in req.submissions
    ]
    return QuizService.submit_quiz_answers(
        db=db,
        student_id=student.id,
        course_id=req.course_id,
        topic_name=req.topic_name,
        submissions=submissions_data
    )

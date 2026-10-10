from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.db.models import Student, User
from backend.app.api.deps import get_current_student
from backend.app.schemas.models import StudentProfileResponse

router = APIRouter()

@router.get("/me", response_model=StudentProfileResponse)
def get_my_student_profile(
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """
    Returns the complete profile for the active student.
    Matches the TypeScript StudentProfile schema required by the React frontend.
    """
    user = db.query(User).filter(User.id == student.user_id).first()
    name = user.full_name if user else "Alex Rivera"
    email = user.email if user else "a.rivera@campus.edu"
    avatar = user.avatar if (user and user.avatar) else "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"

    return {
        "id": student.id,
        "name": name,
        "avatar": avatar,
        "email": email,
        "major": student.department,
        "department": student.department,
        "semester": student.semester,
        "university": student.university,
        "rollNo": student.roll_number,
        "advisorName": student.advisor_name,
        "academicStanding": student.academic_standing,
        "cgpa": student.cgpa,
        "projectedCgpa": student.projected_cgpa,
        "creditsEarned": student.credits_earned,
        "totalCredits": student.total_credits
    }

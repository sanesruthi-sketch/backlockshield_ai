from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List, Optional
import io
import csv
from datetime import datetime

from backend.app.db.database import get_db
from backend.app.db.models import User, Student, Enrollment, Intervention, TopicMastery
from backend.app.api.deps import get_current_user
from backend.app.schemas.models import (
    FacultyCohortStudent,
    InterventionCreateRequest,
    InterventionResponse
)

router = APIRouter()

def require_faculty_or_admin(current_user: User = Depends(get_current_user)) -> User:
    """Enforce faculty/advisor authorization."""
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Faculty authorization required.")
    return current_user

@router.get("/cohort", response_model=List[FacultyCohortStudent])
def get_faculty_cohort(
    db: Session = Depends(get_db)
):
    """
    Returns live cohort telemetry from the database.
    Calculates dynamic risk levels, attendance, and average grades.
    """
    students = db.query(Student).all()
    results = []

    for s in students:
        enrollments = db.query(Enrollment).filter(Enrollment.student_id == s.id).all()
        if enrollments:
            avg_att = sum(e.attendance_percent for e in enrollments) / len(enrollments)
            avg_grade = sum(e.grade_percent for e in enrollments) / len(enrollments)
            has_crit = any(e.risk_level == "critical" for e in enrollments)
            has_mod = any(e.risk_level == "moderate" for e in enrollments)
            risk_level = "critical" if has_crit or avg_att < 75.0 else ("moderate" if has_mod or avg_att < 85.0 else "low")
            risk_score = 78.0 if risk_level == "critical" else (42.0 if risk_level == "moderate" else 15.0)
        else:
            avg_att = 85.0
            avg_grade = 80.0
            risk_level = "low"
            risk_score = 20.0

        flags = []
        if avg_att < 75.0:
            flags.append(f"Low Attendance ({avg_att:.1f}%)")
        if avg_grade < 70.0:
            flags.append(f"Grade Deficit ({avg_grade:.1f}%)")
        if not flags:
            flags.append("On Track")

        results.append({
            "id": s.id,
            "name": s.full_name,
            "rollNo": s.roll_number,
            "major": s.department,
            "semester": s.semester,
            "riskLevel": risk_level,
            "riskScore": risk_score,
            "attendance": round(avg_att, 1),
            "avgGrade": round(avg_grade, 1),
            "flags": flags,
            "lastActive": "Active Now"
        })

    # Sort critical first
    results.sort(key=lambda x: (0 if x["riskLevel"] == "critical" else (1 if x["riskLevel"] == "moderate" else 2)))
    return results

@router.post("/interventions", response_model=InterventionResponse)
def create_faculty_intervention(
    req: InterventionCreateRequest,
    faculty: User = Depends(require_faculty_or_admin),
    db: Session = Depends(get_db)
):
    """
    Creates and records a faculty support action (tutoring, attendance notice, study plan).
    """
    student = db.query(Student).filter(Student.id == req.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found")

    intervention = Intervention(
        student_id=student.id,
        faculty_id=faculty.id,
        action=req.action,
        notes=req.notes,
        status="planned",
        follow_up_date=req.follow_up_date or "Within 7 Days"
    )
    db.add(intervention)
    db.commit()
    db.refresh(intervention)

    return {
        "id": intervention.id,
        "student_id": student.id,
        "student_name": student.full_name,
        "faculty_id": faculty.id,
        "action": intervention.action,
        "notes": intervention.notes,
        "status": intervention.status,
        "follow_up_date": intervention.follow_up_date,
        "created_at": intervention.created_at.strftime("%b %d, %Y")
    }

@router.get("/interventions", response_model=List[InterventionResponse])
def list_faculty_interventions(
    faculty: User = Depends(require_faculty_or_admin),
    db: Session = Depends(get_db)
):
    """Lists recorded student interventions."""
    records = db.query(Intervention).order_by(Intervention.created_at.desc()).all()
    res = []
    for r in records:
        st = db.query(Student).filter(Student.id == r.student_id).first()
        res.append({
            "id": r.id,
            "student_id": r.student_id,
            "student_name": st.full_name if st else "Student",
            "faculty_id": r.faculty_id,
            "action": r.action,
            "notes": r.notes,
            "status": r.status,
            "follow_up_date": r.follow_up_date,
            "created_at": r.created_at.strftime("%b %d, %Y")
        })
    return res

@router.get("/export-csv")
def export_cohort_csv(
    faculty: User = Depends(require_faculty_or_admin),
    db: Session = Depends(get_db)
):
    """Exports authorized cohort records to downloadable CSV."""
    students = db.query(Student).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["roll_number", "full_name", "department", "cgpa", "attendance_percent", "avg_grade", "risk_level"])

    for s in students:
        enrollments = db.query(Enrollment).filter(Enrollment.student_id == s.id).all()
        avg_att = sum(e.attendance_percent for e in enrollments) / len(enrollments) if enrollments else 85.0
        avg_gr = sum(e.grade_percent for e in enrollments) / len(enrollments) if enrollments else 80.0
        risk = "critical" if avg_att < 75.0 else ("moderate" if avg_att < 85.0 else "low")
        writer.writerow([s.roll_number, s.full_name, s.department, s.cgpa, round(avg_att, 1), round(avg_gr, 1), risk])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=campusiq_cohort_{datetime.utcnow().strftime('%Y%m%d')}.csv"}
    )

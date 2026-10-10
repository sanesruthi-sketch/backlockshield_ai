from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.app.db.database import get_db
from backend.app.db.models import Student, Enrollment, PerformanceHistory
from backend.app.api.deps import get_current_student
from backend.app.ml.risk_engine import StudentRiskPredictor
from backend.app.schemas.models import (
    MetricsSummaryResponse,
    PerformanceHistoryItem,
    RiskExplanationResponse
)

router = APIRouter()

@router.get("/metrics", response_model=MetricsSummaryResponse)
def get_metrics_summary(
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """
    Returns aggregated KPI metrics: CGPA, projected CGPA, attendance, retention probability, etc.
    """
    enrollments = db.query(Enrollment).filter(Enrollment.student_id == student.id).all()
    
    if enrollments:
        avg_attendance = sum(e.attendance_percent for e in enrollments) / len(enrollments)
        avg_grade = sum(e.grade_percent for e in enrollments) / len(enrollments)
        total_completed = sum(e.assignments_completed for e in enrollments)
        total_assignments = sum(e.total_assignments for e in enrollments)
        assignment_rate = (total_completed / total_assignments * 100.0) if total_assignments > 0 else 92.0
        critical_count = sum(1 for e in enrollments if e.risk_level == "critical")
    else:
        avg_attendance = 87.5
        avg_grade = 85.2
        assignment_rate = 92.0
        critical_count = 1

    # Predict dynamic retention probability using ML engine
    retention_res = StudentRiskPredictor.calculate_retention_estimate(
        cgpa=student.cgpa,
        average_attendance=avg_attendance,
        average_grade=avg_grade,
        critical_course_count=critical_count
    )

    return {
        "cgpa": student.cgpa,
        "projectedCgpa": student.projected_cgpa,
        "gpaChange": 0.06,
        "retentionProbability": retention_res["retention_probability_estimate"],
        "retentionChange": 1.8,
        "attendanceAverage": round(avg_attendance, 1),
        "attendanceChange": -2.1,
        "assignmentRate": round(assignment_rate, 1),
        "assignmentChange": 4.5,
        "studyHoursWeekly": student.weekly_study_hours,
        "classRankPercentile": student.class_rank_percentile
    }

@router.get("/risk-explanation", response_model=RiskExplanationResponse)
def get_risk_explanation(
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """
    Returns fully explainable multi-variate academic risk calculation,
    including individual deficits, weighted factor contributions, and reasons.
    """
    enrollments = db.query(Enrollment).filter(Enrollment.student_id == student.id).all()
    
    if enrollments:
        avg_grade = sum(e.grade_percent for e in enrollments) / len(enrollments)
        avg_attendance = sum(e.attendance_percent for e in enrollments) / len(enrollments)
        total_comp = sum(e.assignments_completed for e in enrollments)
        total_all = sum(e.total_assignments for e in enrollments)
        asgn_rate = (total_comp / total_all * 100.0) if total_all > 0 else 90.0
    else:
        avg_grade = 82.0
        avg_attendance = 87.5
        asgn_rate = 90.0

    return StudentRiskPredictor.calculate_course_risk(
        grade_percent=avg_grade,
        attendance_percent=avg_attendance,
        assignment_rate=asgn_rate,
        weekly_study_hours=student.weekly_study_hours
    )

@router.get("/retention-estimate")
def get_retention_estimate(
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """
    Returns provisional sigmoid retention probability with clear disclaimers.
    """
    enrollments = db.query(Enrollment).filter(Enrollment.student_id == student.id).all()
    critical_count = sum(1 for e in enrollments if e.risk_level == "critical") if enrollments else 1
    avg_att = sum(e.attendance_percent for e in enrollments) / len(enrollments) if enrollments else 87.5
    avg_gr = sum(e.grade_percent for e in enrollments) / len(enrollments) if enrollments else 85.0

    return StudentRiskPredictor.calculate_retention_estimate(
        cgpa=student.cgpa,
        average_attendance=avg_att,
        average_grade=avg_gr,
        critical_course_count=critical_count
    )

@router.get("/performance-history", response_model=List[PerformanceHistoryItem])
def get_performance_history(
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """
    Returns longitudinal 10-week performance history (Student Score vs Class Average).
    """
    records = db.query(PerformanceHistory).filter(PerformanceHistory.student_id == student.id).all()
    
    if not records:
        return [
            {"week": "W1", "studentScore": 88, "classAverage": 82, "studyHours": 18, "targetScore": 85},
            {"week": "W2", "studentScore": 90, "classAverage": 81, "studyHours": 20, "targetScore": 85},
            {"week": "W3", "studentScore": 86, "classAverage": 79, "studyHours": 19, "targetScore": 85},
            {"week": "W4", "studentScore": 92, "classAverage": 80, "studyHours": 25, "targetScore": 85},
            {"week": "W5", "studentScore": 84, "classAverage": 78, "studyHours": 21, "targetScore": 85},
            {"week": "W6", "studentScore": 76, "classAverage": 75, "studyHours": 14, "targetScore": 85},
            {"week": "W7", "studentScore": 79, "classAverage": 77, "studyHours": 17, "targetScore": 85},
            {"week": "W8", "studentScore": 85, "classAverage": 78, "studyHours": 23, "targetScore": 85},
            {"week": "W9", "studentScore": 89, "classAverage": 80, "studyHours": 26, "targetScore": 85},
            {"week": "W10", "studentScore": 91, "classAverage": 81, "studyHours": 28, "targetScore": 85}
        ]

    return [
        {
            "week": r.week,
            "studentScore": r.student_score,
            "classAverage": r.class_average,
            "studyHours": r.study_hours,
            "targetScore": r.target_score
        }
        for r in records
    ]

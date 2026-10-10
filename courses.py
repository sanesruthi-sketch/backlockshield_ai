from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.db.database import get_db
from backend.app.db.models import Course, Enrollment, TopicMastery, Student
from backend.app.api.deps import get_current_student
from backend.app.schemas.models import CourseResponse

router = APIRouter()

@router.get("", response_model=List[CourseResponse])
def get_student_courses(
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """
    Returns enrolled courses for the student, including risk diagnoses, attendance rates,
    and mastery topics.
    """
    enrollments = db.query(Enrollment).filter(Enrollment.student_id == student.id).all()

    response = []
    for en in enrollments:
        course = en.course
        masteries = db.query(TopicMastery).filter(
            TopicMastery.student_id == student.id,
            TopicMastery.course_id == course.id
        ).all()
        struggling_topics = [
            tm.topic_name for tm in masteries
            if tm.mastery_percent is not None and tm.mastery_percent < 70
        ]
        mastered_topics = [
            tm.topic_name for tm in masteries
            if tm.mastery_percent is not None and tm.mastery_percent >= 70
        ]

        response.append({
            "id": f"crs_{course.course_code.lower().replace('-', '')}",
            "code": course.course_code,
            "title": course.course_name,
            "instructor": course.instructor,
            "instructorEmail": course.instructor_email,
            "credits": course.credits,
            "currentGrade": en.current_letter_grade,
            "projectedGrade": en.projected_letter_grade,
            "gradePercent": en.grade_percent,
            "attendancePercent": en.attendance_percent,
            "riskLevel": en.risk_level,
            "riskReason": en.risk_reason,
            "assignmentsCompleted": en.assignments_completed,
            "totalAssignments": en.total_assignments,
            "nextEvaluation": en.next_evaluation,
            "evaluationDate": en.evaluation_date,
            "topicsStruggling": struggling_topics,
            "topicsMastered": mastered_topics
        })

    return response

@router.get("/{course_id}", response_model=CourseResponse)
def get_course_details(
    course_id: str,
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    enrollments = db.query(Enrollment).filter(Enrollment.student_id == student.id).all()
    for en in enrollments:
        course = en.course
        if course.id == course_id or course.course_code.lower() in course_id.lower() or f"crs_{course.course_code.lower().replace('-', '')}" == course_id.lower():
            masteries = db.query(TopicMastery).filter(
                TopicMastery.student_id == student.id,
                TopicMastery.course_id == course.id
            ).all()
            struggling_topics = [
                tm.topic_name for tm in masteries
                if tm.mastery_percent is not None and tm.mastery_percent < 70
            ]
            mastered_topics = [
                tm.topic_name for tm in masteries
                if tm.mastery_percent is not None and tm.mastery_percent >= 70
            ]
            return {
                "id": course.id,
                "code": course.course_code,
                "title": course.course_name,
                "instructor": course.instructor,
                "instructorEmail": course.instructor_email,
                "credits": course.credits,
                "currentGrade": en.current_letter_grade,
                "projectedGrade": en.projected_letter_grade,
                "gradePercent": en.grade_percent,
                "attendancePercent": en.attendance_percent,
                "riskLevel": en.risk_level,
                "riskReason": en.risk_reason,
                "assignmentsCompleted": en.assignments_completed,
                "totalAssignments": en.total_assignments,
                "nextEvaluation": en.next_evaluation,
                "evaluationDate": en.evaluation_date,
                "topicsStruggling": struggling_topics,
                "topicsMastered": mastered_topics
            }
    raise HTTPException(status_code=404, detail="Course not found")


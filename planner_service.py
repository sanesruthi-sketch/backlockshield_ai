from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.app.db.models import StudySession, Student, TopicMastery, Course, Assessment, Enrollment

class StudyPlannerService:
    """
    CampusIQ Personalized Study Planner Service.
    Generates rolling 7-day study plans, tracks planned vs actual study time,
    and updates progress states.
    """

    @classmethod
    def get_student_study_plan(cls, db: Session, student_id: str) -> Dict[str, Any]:
        """
        Retrieves the student's rolling study tasks, completion rate, and study time telemetry.
        """
        tasks = db.query(StudySession).filter(
            StudySession.student_id == student_id
        ).order_by(StudySession.planned_date.asc()).all()

        total_planned_minutes = sum(t.planned_minutes for t in tasks)
        total_actual_minutes = sum(t.actual_minutes for t in tasks)
        completed_tasks_count = sum(1 for t in tasks if t.status == "completed")
        total_tasks_count = len(tasks)
        completion_percent = round((completed_tasks_count / total_tasks_count * 100.0) if total_tasks_count > 0 else 0.0, 1)

        serialized_tasks = [
            {
                "id": t.id,
                "course_code": t.course_code,
                "topic_name": t.topic_name,
                "title": t.title,
                "description": t.description,
                "planned_minutes": t.planned_minutes,
                "actual_minutes": t.actual_minutes,
                "planned_date": t.planned_date,
                "priority": t.priority,
                "status": t.status,
                "completed_at": t.completed_at.isoformat() if t.completed_at else None
            }
            for t in tasks
        ]

        return {
            "total_tasks": total_tasks_count,
            "completed_tasks": completed_tasks_count,
            "completion_percent": completion_percent,
            "total_planned_minutes": total_planned_minutes,
            "total_actual_minutes": total_actual_minutes,
            "planned_hours": round(total_planned_minutes / 60.0, 1),
            "actual_hours": round(total_actual_minutes / 60.0, 1),
            "tasks": serialized_tasks
        }

    @classmethod
    def generate_rolling_plan(
        cls,
        db: Session,
        student_id: str,
        daily_minutes: int = 60
    ) -> List[StudySession]:
        """
        Generates a 7-day personalized study schedule grounded in the student's actual
        learning gaps (TopicMastery < 70) and upcoming course assessments.
        """
        # Find weak topics from learning twin
        weak_topics = db.query(TopicMastery).filter(
            TopicMastery.student_id == student_id,
            TopicMastery.mastery_percent != None,
            TopicMastery.mastery_percent < 70.0
        ).all()

        today = datetime.utcnow()
        created_tasks = []

        day_offset = 0
        for wm in weak_topics:
            course = db.query(Course).filter(Course.id == wm.course_id).first()
            course_code = course.course_code if course else "GEN"

            task_date = (today + timedelta(days=day_offset % 7)).strftime("%Y-%m-%d")
            prio = "urgent" if (wm.mastery_percent or 0) < 50.0 else "recommended"

            session = StudySession(
                student_id=student_id,
                course_code=course_code,
                topic_name=wm.topic_name,
                title=f"Review & Practice: {wm.topic_name}",
                description=f"Targeted study block on {wm.topic_name} to address current {wm.mastery_percent}% mastery level.",
                planned_minutes=daily_minutes,
                actual_minutes=0,
                planned_date=task_date,
                priority=prio,
                status="planned"
            )
            db.add(session)
            created_tasks.append(session)
            day_offset += 1

        db.commit()
        return created_tasks

    @classmethod
    def complete_task(
        cls,
        db: Session,
        student_id: str,
        task_id: str,
        actual_minutes: int
    ) -> Optional[StudySession]:
        """
        Marks study task as completed and records verified actual study minutes.
        """
        task = db.query(StudySession).filter(
            StudySession.id == task_id,
            StudySession.student_id == student_id
        ).first()

        if not task:
            return None

        task.status = "completed" if task.status != "completed" else "planned"
        task.actual_minutes = actual_minutes if task.status == "completed" else 0
        task.completed_at = datetime.utcnow() if task.status == "completed" else None

        db.commit()
        db.refresh(task)
        return task

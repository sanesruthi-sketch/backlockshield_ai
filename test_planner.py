import pytest
from backend.app.services.planner_service import StudyPlannerService
from backend.app.db.database import SessionLocal
from backend.app.db.models import Student, StudySession

def test_planner_task_completion():
    """Verify study task completion updates status and records actual minutes."""
    db = SessionLocal()
    try:
        student = db.query(Student).first()
        if not student:
            pytest.skip("Database not seeded yet")

        # Create temporary task
        task = StudySession(
            student_id=student.id,
            course_code="TEST-101",
            topic_name="Unit Testing",
            title="Practice Test Cases",
            planned_minutes=45,
            actual_minutes=0,
            planned_date="Today",
            priority="recommended",
            status="planned"
        )
        db.add(task)
        db.commit()

        # Complete task
        updated = StudyPlannerService.complete_task(
            db=db,
            student_id=student.id,
            task_id=task.id,
            actual_minutes=45
        )
        assert updated is not None
        assert updated.status == "completed"
        assert updated.actual_minutes == 45

        # Cleanup
        db.delete(updated)
        db.commit()
    finally:
        db.close()

import pytest
from backend.app.services.quiz_service import QuizService
from backend.app.db.database import SessionLocal
from backend.app.db.models import Course, QuizQuestion, Student

def test_quiz_answer_key_withheld():
    """Verify that starting a quiz strips correct_option and explanation from client output."""
    db = SessionLocal()
    try:
        course = db.query(Course).first()
        student = db.query(Student).first()
        if not course or not student:
            pytest.skip("Database not seeded yet")

        quiz_session = QuizService.start_quiz(
            db=db,
            course_id=course.id,
            topic_name="Singular Value Decomposition (SVD)",
            student_id=student.id
        )

        assert "questions" in quiz_session
        for q in quiz_session["questions"]:
            assert "correct_option" not in q
            assert "explanation" not in q
            assert "options" in q
            assert "A" in q["options"]
    finally:
        db.close()

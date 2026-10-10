from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.app.db.models import QuizQuestion, QuizAttempt, TopicMastery, Course
from backend.app.services.learning_twin import LearningTwinService

class QuizService:
    """
    CampusIQ Adaptive Quiz Service.
    Selects questions dynamically, evaluates answers server-side,
    protects answer keys, and updates Topic Mastery in real time.
    """

    @classmethod
    def start_quiz(
        cls,
        db: Session,
        course_id: str,
        topic_name: str,
        student_id: str
    ) -> Dict[str, Any]:
        """
        Starts an adaptive quiz session. Selects questions based on student's current mastery.
        Removes correct_option and explanation to prevent client-side inspection.
        """
        # Determine target difficulty from topic mastery
        mastery_record = db.query(TopicMastery).filter(
            TopicMastery.student_id == student_id,
            TopicMastery.course_id == course_id,
            TopicMastery.topic_name == topic_name
        ).first()

        current_mastery = mastery_record.mastery_percent if mastery_record else None
        if current_mastery is None or current_mastery < 50.0:
            target_diff = "beginner"
        elif current_mastery < 75.0:
            target_diff = "intermediate"
        else:
            target_diff = "advanced"

        # Fetch matching questions from bank
        questions = db.query(QuizQuestion).filter(
            QuizQuestion.course_id == course_id,
            QuizQuestion.topic_name == topic_name,
            QuizQuestion.difficulty == target_diff
        ).all()

        if not questions:
            # Fallback to any difficulty for this topic
            questions = db.query(QuizQuestion).filter(
                QuizQuestion.course_id == course_id,
                QuizQuestion.topic_name == topic_name
            ).all()

        if not questions:
            # Fallback to any questions for this course
            questions = db.query(QuizQuestion).filter(
                QuizQuestion.course_id == course_id
            ).limit(3).all()

        # Sanitize output (keep answer keys strictly on server)
        sanitized_questions = [
            {
                "id": q.id,
                "course_id": q.course_id,
                "topic_name": q.topic_name,
                "difficulty": q.difficulty,
                "question_text": q.question_text,
                "options": {
                    "A": q.option_a,
                    "B": q.option_b,
                    "C": q.option_c,
                    "D": q.option_d
                }
            }
            for q in questions
        ]

        return {
            "quiz_session_id": f"quiz_{course_id}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            "course_id": course_id,
            "topic_name": topic_name,
            "difficulty": target_diff,
            "total_questions": len(sanitized_questions),
            "questions": sanitized_questions
        }

    @classmethod
    def submit_quiz_answers(
        cls,
        db: Session,
        student_id: str,
        course_id: str,
        topic_name: str,
        submissions: List[Dict[str, str]]  # list of {"question_id": str, "selected_option": str}
    ) -> Dict[str, Any]:
        """
        Validates answers server-side against answer keys, records attempt,
        and dynamically updates topic mastery in the digital learning twin.
        """
        correct_count = 0
        total_count = len(submissions)
        question_breakdowns = []
        difficulty_used = "intermediate"

        for sub in submissions:
            q_id = sub.get("question_id")
            selected = sub.get("selected_option", "").upper().strip()

            question = db.query(QuizQuestion).filter(QuizQuestion.id == q_id).first()
            if not question:
                continue

            difficulty_used = question.difficulty
            is_correct = (selected == question.correct_option.upper().strip())
            if is_correct:
                correct_count += 1

            question_breakdowns.append({
                "question_id": question.id,
                "question_text": question.question_text,
                "selected_option": selected,
                "correct_option": question.correct_option,
                "is_correct": is_correct,
                "explanation": question.explanation
            })

        score_percent = round((correct_count / total_count * 100.0) if total_count > 0 else 0.0, 1)

        # 1. Record Attempt in Database
        attempt = QuizAttempt(
            student_id=student_id,
            course_id=course_id,
            topic_name=topic_name,
            difficulty=difficulty_used,
            score_percent=score_percent,
            total_questions=total_count,
            correct_answers=correct_count,
            created_at=datetime.utcnow()
        )
        db.add(attempt)
        db.commit()

        # 2. Update Digital Learning Twin Topic Mastery
        updated_twin = LearningTwinService.update_topic_mastery(
            db=db,
            student_id=student_id,
            course_id=course_id,
            topic_name=topic_name,
            latest_quiz_percent=score_percent
        )

        classification = LearningTwinService.classify_mastery_state(updated_twin.mastery_percent)

        return {
            "attempt_id": attempt.id,
            "course_id": course_id,
            "topic_name": topic_name,
            "score_percent": score_percent,
            "correct_answers": correct_count,
            "total_questions": total_count,
            "updated_mastery_percent": updated_twin.mastery_percent,
            "mastery_status": classification["status"],
            "mastery_status_label": classification["label"],
            "feedback": (
                "Excellent mastery demonstrated!" if score_percent >= 80.0
                else ("Good effort! Targeted practice recommended on mistakes below." if score_percent >= 50.0
                else "Learning gap identified. Review concept explanations and re-test.")
            ),
            "questions_result": question_breakdowns
        }

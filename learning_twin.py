from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.app.db.models import TopicMastery, Course

class LearningTwinService:
    """
    CampusIQ Digital Learning Twin Service.
    Maintains a data-driven topic-level mastery profile for every course.
    """

    GAP_THRESHOLD_PRIORITY = 50.0
    PRACTICE_THRESHOLD = 70.0

    @classmethod
    def classify_mastery_state(cls, mastery_percent: Optional[float]) -> Dict[str, str]:
        """
        Classifies mastery score into standardized states:
        - NOT ASSESSED (None)
        - priority learning gap (< 50)
        - needs practice (50–69)
        - provisional mastery (>= 70)
        """
        if mastery_percent is None:
            return {
                "status": "NOT ASSESSED",
                "label": "Not Assessed",
                "badge_color": "slate",
                "recommendation": "Attempt diagnostic adaptive quiz to establish mastery baseline."
            }

        score = float(mastery_percent)
        if score < cls.GAP_THRESHOLD_PRIORITY:
            return {
                "status": "priority learning gap",
                "label": "Priority Gap",
                "badge_color": "rose",
                "recommendation": "Review fundamental concepts, worked examples, and take remedial drill."
            }
        elif score < cls.PRACTICE_THRESHOLD:
            return {
                "status": "needs practice",
                "label": "Needs Practice",
                "badge_color": "amber",
                "recommendation": "Complete targeted problem sets to reinforce comprehension."
            }
        else:
            return {
                "status": "provisional mastery",
                "label": "Provisional Mastery",
                "badge_color": "emerald",
                "recommendation": "Demonstrates solid competency; maintain active recall before exams."
            }

    @classmethod
    def update_topic_mastery(
        cls,
        db: Session,
        student_id: str,
        course_id: str,
        topic_name: str,
        latest_quiz_percent: float
    ) -> TopicMastery:
        """
        Applies verified server-side update formula:
        New mastery = 0.7 * previous mastery + 0.3 * latest quiz percentage.
        If unassessed, initializes score with the latest quiz result.
        """
        if not (0.0 <= latest_quiz_percent <= 100.0):
            raise ValueError(f"Quiz percentage must be between 0 and 100, received: {latest_quiz_percent}")

        mastery_record = db.query(TopicMastery).filter(
            TopicMastery.student_id == student_id,
            TopicMastery.course_id == course_id,
            TopicMastery.topic_name == topic_name
        ).first()

        now = datetime.utcnow()

        if not mastery_record:
            # Create new record initialized to the first valid quiz score
            mastery_record = TopicMastery(
                student_id=student_id,
                course_id=course_id,
                topic_name=topic_name,
                mastery_percent=round(latest_quiz_percent, 1),
                attempt_count=1,
                last_assessed_at=now,
                updated_at=now
            )
            db.add(mastery_record)
        else:
            old_score = mastery_record.mastery_percent
            if old_score is None:
                # Topic was previously unassessed
                new_score = latest_quiz_percent
            else:
                # Exponential moving average formula
                new_score = (0.7 * old_score) + (0.3 * latest_quiz_percent)

            mastery_record.mastery_percent = round(new_score, 1)
            mastery_record.attempt_count += 1
            mastery_record.last_assessed_at = now
            mastery_record.updated_at = now

        db.commit()
        db.refresh(mastery_record)
        return mastery_record

    @classmethod
    def get_student_twin_profile(cls, db: Session, student_id: str) -> List[Dict[str, Any]]:
        """
        Retrieves the complete Digital Learning Twin profile by course and topic.
        """
        records = db.query(TopicMastery).filter(TopicMastery.student_id == student_id).all()
        
        result = []
        for r in records:
            course = db.query(Course).filter(Course.id == r.course_id).first()
            course_code = course.course_code if course else "COURSE"
            classification = cls.classify_mastery_state(r.mastery_percent)

            result.append({
                "id": r.id,
                "course_id": r.course_id,
                "course_code": course_code,
                "course_name": course.course_name if course else "Course",
                "topic_name": r.topic_name,
                "mastery_percent": r.mastery_percent,
                "status": classification["status"],
                "status_label": classification["label"],
                "badge_color": classification["badge_color"],
                "recommendation": classification["recommendation"],
                "attempt_count": r.attempt_count,
                "last_assessed_at": r.last_assessed_at.strftime("%b %d, %Y") if r.last_assessed_at else "Not yet assessed",
                "updated_at": r.updated_at.isoformat() if r.updated_at else None
            })

        # Sort so that Priority Learning Gaps appear first
        def sort_key(item):
            status = item["status"]
            if status == "priority learning gap":
                return (0, item["mastery_percent"] if item["mastery_percent"] is not None else 0)
            elif status == "needs practice":
                return (1, item["mastery_percent"] if item["mastery_percent"] is not None else 0)
            elif status == "NOT ASSESSED":
                return (2, 0)
            return (3, item["mastery_percent"] if item["mastery_percent"] is not None else 100)

        result.sort(key=sort_key)
        return result

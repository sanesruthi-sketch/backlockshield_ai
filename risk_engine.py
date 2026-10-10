import math
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple

class RiskCalculationError(ValueError):
    """Raised when risk engine receives invalid or out-of-range inputs."""
    pass

class StudentRiskPredictor:
    """
    CampusIQ Multi-variate Academic Risk & Retention Prediction Engine.
    Deterministic, explainable baseline risk engine following HacXLerate 2026 specifications.
    """

    WEIGHT_GRADE = 0.38
    WEIGHT_ATTENDANCE = 0.32
    WEIGHT_ASSIGNMENT_RATE = 0.18
    WEIGHT_STUDY_HOURS = 0.12

    INSTITUTIONAL_ATTENDANCE_THRESHOLD = 75.0
    FORMULA_VERSION = "v1.0-deterministic-baseline"

    @classmethod
    def calculate_course_risk(
        cls,
        grade_percent: float,
        attendance_percent: float,
        assignment_rate: float,
        weekly_study_hours: float
    ) -> Dict[str, Any]:
        """
        Pure, independently testable risk calculation service.
        Validates ranges and rejects negative numbers or invalid percentages.
        """
        # 1. Input Validation
        if not (0.0 <= grade_percent <= 100.0):
            raise RiskCalculationError(f"grade_percent must be between 0 and 100, received: {grade_percent}")
        if not (0.0 <= attendance_percent <= 100.0):
            raise RiskCalculationError(f"attendance_percent must be between 0 and 100, received: {attendance_percent}")
        if not (0.0 <= assignment_rate <= 100.0):
            raise RiskCalculationError(f"assignment_rate must be between 0 and 100, received: {assignment_rate}")
        if weekly_study_hours < 0.0:
            raise RiskCalculationError(f"weekly_study_hours must be non-negative, received: {weekly_study_hours}")

        # 2. Deficit Calculations
        grade_deficit = 100.0 - grade_percent
        attendance_deficit = 100.0 - attendance_percent
        assignment_deficit = 100.0 - assignment_rate
        study_deficit = min(100.0, max(0.0, (25.0 - weekly_study_hours) * 4.0))

        # 3. Weighted Contributions
        grade_contrib = cls.WEIGHT_GRADE * grade_deficit
        attendance_contrib = cls.WEIGHT_ATTENDANCE * attendance_deficit
        assignment_contrib = cls.WEIGHT_ASSIGNMENT_RATE * assignment_deficit
        study_contrib = cls.WEIGHT_STUDY_HOURS * study_deficit

        # Composite Score Clamped to 0-100
        raw_score = grade_contrib + attendance_contrib + assignment_contrib + study_contrib
        risk_score = round(max(0.0, min(100.0, raw_score)), 1)

        # 4. Risk Categorization (Section E bands)
        # Low: 0–29, Moderate: 30–54, High: 55–74, Critical: 75–100
        if risk_score < 30.0:
            risk_category = "LOW"
        elif risk_score < 55.0:
            risk_category = "MODERATE"
        elif risk_score < 75.0:
            risk_category = "HIGH"
        else:
            risk_category = "CRITICAL"

        # 5. Separate Attendance Warning Flag
        attendance_warning = attendance_percent < cls.INSTITUTIONAL_ATTENDANCE_THRESHOLD

        # 6. Sorted Reasons by Actual Weighted Contribution
        contributions = [
            ("Evaluation Performance Deficit", grade_contrib, f"Grade score ({grade_percent:.1f}%) is {grade_deficit:.1f}% below ideal benchmark"),
            ("Classroom Attendance Deficit", attendance_contrib, f"Attendance rate ({attendance_percent:.1f}%) represents a {attendance_deficit:.1f}% absence deficit"),
            ("Assignment Completion Deficit", assignment_contrib, f"Assignment delivery rate ({assignment_rate:.1f}%) reflects pending deliverables"),
            ("Study Preparation Deficit", study_contrib, f"Weekly study time ({weekly_study_hours:.1f}h) is below the 25-hour target")
        ]
        # Sort factors by weighted contribution descending
        contributions.sort(key=lambda x: x[1], reverse=True)
        top_reasons = [item[2] for item in contributions if item[1] > 2.0]

        if attendance_warning:
            top_reasons.insert(0, f"ATTENDANCE BREACH WARNING: Attendance ({attendance_percent:.1f}%) is below mandatory {cls.INSTITUTIONAL_ATTENDANCE_THRESHOLD}% threshold.")

        if not top_reasons:
            top_reasons.append("Consistently strong academic performance across all metrics.")

        # 7. Prescriptive Interventions
        recommended_actions = []
        if attendance_warning:
            recommended_actions.append("Schedule attendance consultation with faculty advisor and verify biometric logs.")
        if grade_deficit > 20.0:
            recommended_actions.append("Complete targeted adaptive quiz drills on identified topic learning gaps.")
        if assignment_deficit > 15.0:
            recommended_actions.append("Prioritize pending homework submissions before the upcoming deadline cutoff.")
        if study_deficit > 20.0:
            recommended_actions.append("Activate a rolling 7-day study planner to budget 25 weekly study hours.")

        return {
            "risk_score": risk_score,
            "risk_category": risk_category,
            "attendance_warning": attendance_warning,
            "input_metrics": {
                "grade_percent": grade_percent,
                "attendance_percent": attendance_percent,
                "assignment_rate": assignment_rate,
                "weekly_study_hours": weekly_study_hours
            },
            "deficits": {
                "grade_deficit": round(grade_deficit, 1),
                "attendance_deficit": round(attendance_deficit, 1),
                "assignment_deficit": round(assignment_deficit, 1),
                "study_deficit": round(study_deficit, 1)
            },
            "weighted_contributions": {
                "grade_contribution": round(grade_contrib, 2),
                "attendance_contribution": round(attendance_contrib, 2),
                "assignment_contribution": round(assignment_contrib, 2),
                "study_contribution": round(study_contrib, 2)
            },
            "reasons": top_reasons,
            "recommended_actions": recommended_actions,
            "formula_version": cls.FORMULA_VERSION,
            "timestamp": datetime.utcnow().isoformat()
        }

    @classmethod
    def calculate_retention_estimate(
        cls,
        cgpa: float,
        average_attendance: float,
        average_grade: float,
        critical_course_count: int
    ) -> Dict[str, Any]:
        """
        Provisional logistic retention probability estimation service.
        Explicitly labeled as an uncalibrated prototype model.
        """
        # Validate CGPA is on a 0.0 - 4.0 scale
        if not (0.0 <= cgpa <= 4.0):
            raise RiskCalculationError(f"CGPA must be between 0.0 and 4.0, received: {cgpa}")

        z = (
            1.20 * (cgpa - 2.50) +
            0.04 * (average_attendance - 75.0) +
            0.03 * (average_grade - 70.0) -
            0.85 * critical_course_count
        )

        prob = 100.0 / (1.0 + math.exp(-z))
        retention_estimate = round(max(10.0, min(99.4, prob)), 1)

        standing = (
            "Dean's Honor Roll" if cgpa >= 3.75 
            else ("Good Academic Standing" if cgpa >= 3.0 
            else "Academic Review Recommended")
        )

        return {
            "retention_probability_estimate": retention_estimate,
            "standing": standing,
            "linear_predictor_z": round(z, 3),
            "disclaimer": "PROTOTYPE MODEL LIMITATION: Illustrative, uncalibrated estimate calibrated from literature heuristics. Not a certified statistical prediction.",
            "inputs_evaluated": {
                "cgpa": cgpa,
                "average_attendance": average_attendance,
                "average_grade": average_grade,
                "critical_course_count": critical_course_count
            }
        }

import pytest
from backend.app.ml.risk_engine import StudentRiskPredictor

def test_risk_engine_perfect_inputs():
    """Verify that perfect grades, perfect attendance, full assignments, and full study result in zero risk."""
    result = StudentRiskPredictor.calculate_course_risk(
        grade_percent=100.0,
        attendance_percent=100.0,
        assignments_completed=10,
        total_assignments=10,
        study_hours_weekly=25.0
    )
    assert result["risk_score"] == 0.0
    assert result["risk_level"] == "low"
    assert "track" in result["diagnosis"].lower()

def test_risk_engine_worst_inputs():
    """Verify that zero grades, zero attendance, zero assignments, and zero study result in maximum critical risk."""
    result = StudentRiskPredictor.calculate_course_risk(
        grade_percent=0.0,
        attendance_percent=0.0,
        assignments_completed=0,
        total_assignments=10,
        study_hours_weekly=0.0
    )
    assert result["risk_score"] == 100.0
    assert result["risk_level"] == "critical"
    assert "threshold" in result["diagnosis"].lower()

def test_attendance_threshold_trigger():
    """Verify that attendance falling below 75% triggers critical warning."""
    result = StudentRiskPredictor.calculate_course_risk(
        grade_percent=85.0,
        attendance_percent=71.0,  # Below 75% threshold
        assignments_completed=5,
        total_assignments=5,
        study_hours_weekly=20.0
    )
    assert result["risk_level"] == "critical"
    assert "below mandatory 75.0% threshold" in result["diagnosis"]

def test_retention_probability_bounds():
    """Verify retention probability returns realistic percentage bounded between 35% and 99.4%."""
    retention, standing = StudentRiskPredictor.calculate_overall_retention(
        cgpa=3.78,
        avg_attendance=87.5,
        avg_grade=85.2,
        critical_course_count=1
    )
    assert 35.0 <= retention <= 99.4
    assert standing == "Dean's Honor Roll"

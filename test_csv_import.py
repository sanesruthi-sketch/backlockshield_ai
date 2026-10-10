import pytest
from backend.app.services.csv_service import CSVImportService

def test_csv_preview_validation_and_errors():
    """Verify CSV validation identifies bad rows, range errors, and valid rows."""
    sample_csv = b"""roll_number,full_name,email,department,semester,cgpa,attendance_percent,avg_grade_percent
23CS001,John Doe,j.doe@campus.edu,Computer Science,Semester 6,3.50,85.0,82.0
23CS002,Invalid Grade,bad.grade@campus.edu,Computer Science,Semester 6,3.80,90.0,150.0
23CS003,Invalid CGPA,bad.cgpa@campus.edu,Computer Science,Semester 6,5.50,80.0,75.0
"""
    result = CSVImportService.preview_csv(sample_csv, "test.csv")
    assert result["total_rows"] == 3
    assert result["valid_count"] == 1
    assert result["invalid_count"] == 2
    assert len(result["errors"]) >= 2

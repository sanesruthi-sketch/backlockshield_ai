import io
import pandas as pd
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
from backend.app.db.models import Student, User, AuditEvent
from backend.app.core.security import get_password_hash

REQUIRED_COLUMNS = [
    "roll_number", "full_name", "email", "department", "semester", "cgpa", "attendance_percent", "avg_grade_percent"
]

class CSVImportService:
    """
    CampusIQ Data Quality & CSV Ingestion Service.
    Implements multi-stage validation, row-by-row error reporting, preview before commit,
    and transactional safe commits with audit event logging.
    """

    @classmethod
    def preview_csv(cls, file_content: bytes, filename: str) -> Dict[str, Any]:
        """
        Parses CSV, validates schema, ranges, and types, and generates a pre-commit audit report.
        """
        try:
            df = pd.read_csv(io.BytesIO(file_content))
        except Exception as e:
            return {
                "valid": False,
                "error": f"Failed to parse CSV file: {str(e)}",
                "total_rows": 0,
                "valid_count": 0,
                "invalid_count": 0,
                "rows": [],
                "errors": [{"row": 0, "column": "file", "value": filename, "reason": "Corrupted or non-CSV format"}]
            }

        # Validate required columns
        missing_cols = [c for c in REQUIRED_COLUMNS if c not in df.columns]
        if missing_cols:
            return {
                "valid": False,
                "error": f"Missing required columns: {', '.join(missing_cols)}",
                "total_rows": len(df),
                "valid_count": 0,
                "invalid_count": len(df),
                "rows": [],
                "errors": [{"row": 0, "column": "headers", "value": str(df.columns.tolist()), "reason": f"Required headers missing: {missing_cols}"}]
            }

        valid_rows = []
        errors = []
        seen_rolls = set()
        seen_emails = set()

        for idx, row in df.iterrows():
            row_num = idx + 1
            row_errors = []

            roll = str(row.get("roll_number", "")).strip()
            name = str(row.get("full_name", "")).strip()
            email = str(row.get("email", "")).strip()
            dept = str(row.get("department", "")).strip()
            sem = str(row.get("semester", "")).strip()

            # 1. Null / Empty Checks
            if not roll or roll.lower() == "nan":
                row_errors.append({"row": row_num, "column": "roll_number", "value": "", "reason": "Roll number cannot be empty"})
            elif roll in seen_rolls:
                row_errors.append({"row": row_num, "column": "roll_number", "value": roll, "reason": "Duplicate roll number within CSV"})
            else:
                seen_rolls.add(roll)

            if not email or email.lower() == "nan" or "@" not in email:
                row_errors.append({"row": row_num, "column": "email", "value": email, "reason": "Invalid or missing email address"})
            elif email in seen_emails:
                row_errors.append({"row": row_num, "column": "email", "value": email, "reason": "Duplicate email within CSV"})
            else:
                seen_emails.add(email)

            if not name or name.lower() == "nan":
                row_errors.append({"row": row_num, "column": "full_name", "value": "", "reason": "Full name cannot be empty"})

            # 2. CGPA Range Validation (0.0 to 4.0)
            try:
                cgpa = float(row.get("cgpa", 0.0))
                if not (0.0 <= cgpa <= 4.0):
                    row_errors.append({"row": row_num, "column": "cgpa", "value": cgpa, "reason": "CGPA must be between 0.0 and 4.0"})
            except (ValueError, TypeError):
                row_errors.append({"row": row_num, "column": "cgpa", "value": str(row.get("cgpa")), "reason": "CGPA must be a valid float"})
                cgpa = 0.0

            # 3. Attendance Percentage Range Validation (0.0 to 100.0)
            try:
                att = float(row.get("attendance_percent", 0.0))
                if not (0.0 <= att <= 100.0):
                    row_errors.append({"row": row_num, "column": "attendance_percent", "value": att, "reason": "Attendance must be between 0.0% and 100.0%"})
            except (ValueError, TypeError):
                row_errors.append({"row": row_num, "column": "attendance_percent", "value": str(row.get("attendance_percent")), "reason": "Attendance must be a valid float"})
                att = 0.0

            # 4. Grade Percentage Range Validation (0.0 to 100.0)
            try:
                grade = float(row.get("avg_grade_percent", 0.0))
                if not (0.0 <= grade <= 100.0):
                    row_errors.append({"row": row_num, "column": "avg_grade_percent", "value": grade, "reason": "Grade must be between 0.0% and 100.0%"})
            except (ValueError, TypeError):
                row_errors.append({"row": row_num, "column": "avg_grade_percent", "value": str(row.get("avg_grade_percent")), "reason": "Grade must be a valid float"})
                grade = 0.0

            if row_errors:
                errors.extend(row_errors)
            else:
                valid_rows.append({
                    "row_number": row_num,
                    "roll_number": roll,
                    "full_name": name,
                    "email": email,
                    "department": dept or "Computer Science",
                    "semester": sem or "Semester 6",
                    "cgpa": cgpa,
                    "attendance_percent": att,
                    "avg_grade_percent": grade
                })

        return {
            "valid": len(errors) == 0,
            "filename": filename,
            "total_rows": len(df),
            "valid_count": len(valid_rows),
            "invalid_count": len(df) - len(valid_rows),
            "valid_rows": valid_rows,
            "errors": errors
        }

    @classmethod
    def commit_import(
        cls,
        db: Session,
        valid_rows: List[Dict[str, Any]],
        actor_user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Transactionally commits validated student records into database.
        Rolls back safely on exception and logs AuditEvent.
        """
        imported_count = 0
        skipped_count = 0

        try:
            for item in valid_rows:
                # Check for existing user by email
                existing_user = db.query(User).filter(User.email == item["email"]).first()
                if existing_user:
                    skipped_count += 1
                    continue

                new_user = User(
                    email=item["email"],
                    password_hash=get_password_hash("password123"),
                    full_name=item["full_name"],
                    role="student"
                )
                db.add(new_user)
                db.flush()

                new_student = Student(
                    user_id=new_user.id,
                    roll_number=item["roll_number"],
                    full_name=item["full_name"],
                    department=item["department"],
                    semester=item["semester"],
                    cgpa=item["cgpa"],
                    projected_cgpa=min(4.0, item["cgpa"] + 0.05),
                    weekly_study_hours=20.0
                )
                db.add(new_student)
                imported_count += 1

            # Log audit event
            audit = AuditEvent(
                actor_user_id=actor_user_id,
                action="CSV_IMPORT_COMMIT",
                entity_type="Student",
                details=f"Committed {imported_count} new student records; {skipped_count} duplicates skipped."
            )
            db.add(audit)
            db.commit()

            return {
                "success": True,
                "imported_count": imported_count,
                "skipped_count": skipped_count,
                "message": f"Successfully imported {imported_count} verified student records into institutional database."
            }
        except Exception as e:
            db.rollback()
            return {
                "success": False,
                "imported_count": 0,
                "error": f"Database commit failed, rolled back changes safely: {str(e)}"
            }

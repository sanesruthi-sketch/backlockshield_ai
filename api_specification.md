# CampusIQ — REST API Specification
**Version:** 1.0.0 · OpenAPI 3.0 Compatible  
**Base URL:** `http://localhost:8000/api/v1`  
**Authentication:** HTTP Bearer JWT (Header: `Authorization: Bearer <token>`)

---

## 1. Authentication & Session Endpoints

### `POST /api/v1/auth/login`
Authenticates a user and returns a signed JSON Web Token (JWT).
- **Access:** Public
- **Request Body (`application/json`):**
  ```json
  {
    "username": "a.rivera@campus.edu",
    "password": "Password123!"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "role": "student",
    "user_id": 1,
    "email": "a.rivera@campus.edu",
    "full_name": "Alex Rivera",
    "student_id": 1
  }
  ```
- **Response `401 Unauthorized`:**
  ```json
  { "detail": "Incorrect email or password" }
  ```

### `GET /api/v1/auth/me`
Retrieves identity profile and permissions for the authenticated session.
- **Access:** Authenticated (Student, Faculty, Admin)
- **Response `200 OK`:**
  ```json
  {
    "id": 1,
    "email": "a.rivera@campus.edu",
    "full_name": "Alex Rivera",
    "role": "student",
    "is_active": true
  }
  ```

---

## 2. Health & System Diagnostics

### `GET /api/v1/health`
System liveness and readiness probe for container environments.
- **Access:** Public
- **Response `200 OK`:**
  ```json
  {
    "status": "healthy",
    "version": "1.0.0",
    "database": "connected",
    "active_models": ["DeterministicRiskEngine-v1", "RetentionSigmoid-v1"]
  }
  ```

---

## 3. Student Profile & Dashboard Endpoints

### `GET /api/v1/students/{student_id}`
Returns student biographical data, academic standing, and institutional identifiers.
- **Access:** Enforces RBAC (Student can view own record; Faculty can view cohort; Admin full access)
- **Parameters:** `student_id` (integer path parameter)
- **Response `200 OK`:**
  ```json
  {
    "id": 1,
    "roll_number": "23CS048",
    "full_name": "Alex Rivera",
    "email": "a.rivera@campus.edu",
    "department": "Computer Science & Engineering",
    "semester": "Semester 6",
    "cgpa": 3.78,
    "attendance_percent": 87.5,
    "avg_grade_percent": 85.2,
    "weekly_study_hours": 16.5,
    "total_credits": 78
  }
  ```

### `GET /api/v1/analytics/students/{student_id}/risk`
Computes explainable composite risk score, deficit breakdowns, and retention probability.
- **Access:** Enforces RBAC
- **Response `200 OK`:**
  ```json
  {
    "student_id": 1,
    "composite_risk_score": 28.4,
    "risk_category": "Low",
    "attendance_breach_warning": false,
    "deficits": {
      "grade_deficit": 14.8,
      "attendance_deficit": 12.5,
      "assignment_deficit": 8.0,
      "study_deficit": 34.0
    },
    "weighted_contributions": {
      "grade": 5.62,
      "attendance": 4.0,
      "assignment": 1.44,
      "study": 4.08
    },
    "retention_probability": 94.2,
    "retention_model_disclaimer": "Provisional logistic estimate based on continuous academic telemetry."
  }
  ```

### `GET /api/v1/students/{student_id}/courses`
Returns current semester course enrollments with course-level risk and grades.
- **Access:** Enforces RBAC
- **Response `200 OK`:** Array of course records with code, name, credits, grade, attendance, risk tier, and professor.

---

## 4. Digital Learning Twin & Knowledge Gap Endpoints

### `GET /api/v1/learning-twin/{student_id}`
Returns student topic mastery records classified by mastery thresholds.
- **Access:** Enforces RBAC
- **Response `200 OK`:**
  ```json
  [
    {
      "id": 1,
      "course_code": "MA-204",
      "course_name": "Applied Linear Algebra",
      "topic_name": "Singular Value Decomposition",
      "mastery_score": 42.0,
      "status": "priority learning gap",
      "attempts_count": 2,
      "last_assessed_at": "2026-03-24T10:30:00Z"
    },
    {
      "id": 2,
      "course_code": "CS-301",
      "course_name": "Distributed Systems",
      "topic_name": "Raft Consensus",
      "mastery_score": 88.0,
      "status": "provisional mastery",
      "attempts_count": 4,
      "last_assessed_at": "2026-03-25T14:15:00Z"
    }
  ]
  ```

---

## 5. Adaptive Quiz Engine Endpoints

### `GET /api/v1/quizzes/questions?course_code={code}&limit={n}`
Retrieves sanitized diagnostic questions for an adaptive assessment.
- **Access:** Authenticated
- **Security Rule:** Correct answers and grading rubrics are strictly stripped before returning to the browser.
- **Response `200 OK`:**
  ```json
  [
    {
      "id": 1,
      "course_code": "MA-204",
      "topic_name": "Singular Value Decomposition",
      "difficulty": "medium",
      "question_text": "In the SVD decomposition A = U Σ V^T, what do the diagonal values of Σ represent?",
      "options": [
        "Eigenvalues of A",
        "Singular values of A, which are square roots of eigenvalues of A^T A",
        "Determinants of the row submatrices",
        "Left singular vectors"
      ]
    }
  ]
  ```

### `POST /api/v1/quizzes/submit`
Verifies submitted answers server-side, scores attempt, and updates the student's Digital Learning Twin.
- **Access:** Authenticated
- **Request Body (`application/json`):**
  ```json
  {
    "student_id": 1,
    "course_code": "MA-204",
    "topic_name": "Singular Value Decomposition",
    "answers": [
      { "question_id": 1, "selected_option": "Singular values of A, which are square roots of eigenvalues of A^T A" }
    ]
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "attempt_id": 14,
    "score_percent": 100.0,
    "correct_count": 1,
    "total_questions": 1,
    "previous_mastery": 42.0,
    "updated_mastery": 59.4,
    "mastery_status": "needs practice",
    "explanations": [
      {
        "question_id": 1,
        "is_correct": true,
        "explanation": "Singular values are non-negative square roots of the eigenvalues of A^T A."
      }
    ]
  }
  ```

---

## 6. Rolling 7-Day Study Planner Endpoints

### `GET /api/v1/planner/{student_id}`
Returns current rolling 7-day scheduled study sessions.
- **Access:** Enforces RBAC
- **Response `200 OK`:** Array of study session objects with date, task, planned minutes, actual minutes, completed status, and priority.

### `POST /api/v1/planner/generate`
Synthesizes an intelligent 7-day plan dynamically prioritised by weak topics and upcoming deadlines.
- **Access:** Enforces RBAC
- **Request Body:** `{ "student_id": 1, "daily_budget_minutes": 180 }`
- **Response `201 Created`:** Generated plan details.

### `PATCH /api/v1/planner/tasks/{session_id}/complete`
Records verified task completion and logs actual study time.
- **Access:** Enforces RBAC
- **Request Body:** `{ "actual_minutes": 45, "is_completed": true }`
- **Response `200 OK`:** Updated study session.

---

## 7. Faculty & Advisor Intervention Endpoints

### `GET /api/v1/faculty/cohort`
Returns aggregated department risk metrics, cohort grade distributions, and student roster.
- **Access:** Faculty, Admin
- **Response `200 OK`:**
  ```json
  {
    "total_students": 6,
    "risk_distribution": { "Low": 3, "Moderate": 1, "High": 1, "Critical": 1 },
    "attendance_breaches_count": 2,
    "students": [
      {
        "id": 2,
        "roll_number": "23CS012",
        "full_name": "Marcus Vance",
        "cgpa": 2.65,
        "attendance_percent": 62.4,
        "avg_grade_percent": 58.2,
        "composite_risk_score": 78.4,
        "risk_category": "Critical"
      }
    ]
  }
  ```

### `POST /api/v1/faculty/interventions`
Creates an advisor intervention ticket with follow-up milestone.
- **Access:** Faculty, Admin
- **Request Body:**
  ```json
  {
    "student_id": 2,
    "intervention_type": "Tutoring Referral",
    "severity": "high",
    "notes": "Referred Marcus to Peer Math Lab for MA-204 linear algebra support.",
    "follow_up_date": "2026-04-10"
  }
  ```
- **Response `201 Created`:** Created intervention record with status `Pending`.

---

## 8. Admin Ingestion, Validation & Audit Endpoints

### `POST /api/v1/admin/csv-import/preview`
Validates uploaded CSV file against schema rules, type constraints, and value ranges without modifying the database.
- **Access:** Admin only
- **Response `200 OK`:**
  ```json
  {
    "total_rows": 7,
    "valid_rows_count": 6,
    "invalid_rows_count": 1,
    "errors": [
      {
        "row_number": 7,
        "column": "cgpa",
        "invalid_value": "5.50",
        "error_reason": "Value exceeds maximum allowed CGPA (4.0)"
      }
    ],
    "preview_sample": [...]
  }
  ```

### `POST /api/v1/admin/csv-import/commit`
Executes transactional ingestion of validated records, rolling back changes if any fatal error occurs.
- **Access:** Admin only
- **Response `200 OK`:**
  ```json
  {
    "status": "success",
    "imported_count": 6,
    "skipped_count": 1,
    "audit_event_id": 42
  }
  ```

### `GET /api/v1/admin/audit-logs`
Returns chronologically ordered audit logs of administrative actions.
- **Access:** Admin only
- **Response `200 OK`:** Array of audit events with timestamp, user email, action, and metadata.

---

## 9. AI Academic Copilot Endpoint

### `POST /api/v1/copilot/query`
Answers contextual academic queries grounded in verified student records.
- **Access:** Authenticated
- **Request Body:**
  ```json
  {
    "student_id": 1,
    "query": "Which subjects need my immediate attention?"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "answer": "Based on your verified academic records, MA-204 (Applied Linear Algebra) requires your immediate attention. Your attendance is 71.0% (below the 75% institutional threshold) and topic mastery for Singular Value Decomposition is at 42.0%.",
    "grounded_sources": ["MA-204 Attendance Log", "Learning Twin: SVD (42%)"],
    "suggested_actions": ["Complete SVD revision module", "Attend Thursday faculty office hours"]
  }
  ```

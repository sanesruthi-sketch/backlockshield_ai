from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr

# ----------------------------------------------------
# 1. Authentication Schemas
# ----------------------------------------------------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str
    role: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "student"
    roll_number: Optional[str] = None
    department: Optional[str] = "Computer Science"

# ----------------------------------------------------
# 2. Student & Analytics Schemas
# ----------------------------------------------------
class StudentProfileResponse(BaseModel):
    id: str
    name: str
    avatar: str
    email: str
    major: str
    department: str
    semester: str
    university: str
    rollNo: str
    advisorName: str
    academicStanding: str
    cgpa: float
    projectedCgpa: float
    creditsEarned: int
    totalCredits: int

class MetricsSummaryResponse(BaseModel):
    cgpa: float
    projectedCgpa: float
    gpaChange: float
    retentionProbability: float
    retentionChange: float
    attendanceAverage: float
    attendanceChange: float
    assignmentRate: float
    assignmentChange: float
    studyHoursWeekly: float
    classRankPercentile: int

class PerformanceHistoryItem(BaseModel):
    week: str
    studentScore: float
    classAverage: float
    studyHours: float
    targetScore: float

class RiskExplanationResponse(BaseModel):
    risk_score: float
    risk_category: str
    attendance_warning: bool
    input_metrics: Dict[str, float]
    deficits: Dict[str, float]
    weighted_contributions: Dict[str, float]
    reasons: List[str]
    recommended_actions: List[str]
    formula_version: str
    timestamp: str

# ----------------------------------------------------
# 3. Course Schemas
# ----------------------------------------------------
class CourseResponse(BaseModel):
    id: str
    code: str
    title: str
    instructor: str
    instructorEmail: str
    credits: int
    currentGrade: str
    projectedGrade: str
    gradePercent: float
    attendancePercent: float
    riskLevel: str
    riskReason: Optional[str] = None
    assignmentsCompleted: int
    totalAssignments: int
    nextEvaluation: Optional[str] = None
    evaluationDate: Optional[str] = None
    topicsStruggling: List[str] = []
    topicsMastered: List[str] = []

# ----------------------------------------------------
# 4. Digital Learning Twin Schemas
# ----------------------------------------------------
class TopicMasteryItem(BaseModel):
    id: str
    course_id: str
    course_code: str
    course_name: str
    topic_name: str
    mastery_percent: Optional[float] = None
    status: str
    status_label: str
    badge_color: str
    recommendation: str
    attempt_count: int
    last_assessed_at: str

# ----------------------------------------------------
# 5. Adaptive Quiz Schemas
# ----------------------------------------------------
class QuizQuestionSanitized(BaseModel):
    id: str
    course_id: str
    topic_name: str
    difficulty: str
    question_text: str
    options: Dict[str, str]

class QuizStartRequest(BaseModel):
    course_id: str
    topic_name: str

class QuizStartResponse(BaseModel):
    quiz_session_id: str
    course_id: str
    topic_name: str
    difficulty: str
    total_questions: int
    questions: List[QuizQuestionSanitized]

class QuizAnswerSubmission(BaseModel):
    question_id: str
    selected_option: str

class QuizSubmitRequest(BaseModel):
    course_id: str
    topic_name: str
    submissions: List[QuizAnswerSubmission]

class QuestionResultBreakdown(BaseModel):
    question_id: str
    question_text: str
    selected_option: str
    correct_option: str
    is_correct: bool
    explanation: str

class QuizSubmitResponse(BaseModel):
    attempt_id: str
    course_id: str
    topic_name: str
    score_percent: float
    correct_answers: int
    total_questions: int
    updated_mastery_percent: Optional[float]
    mastery_status: str
    mastery_status_label: str
    feedback: str
    questions_result: List[QuestionResultBreakdown]

# ----------------------------------------------------
# 6. Study Planner Schemas
# ----------------------------------------------------
class StudyTaskItem(BaseModel):
    id: str
    course_code: str
    topic_name: str
    title: str
    description: Optional[str] = None
    planned_minutes: int
    actual_minutes: int
    planned_date: str
    priority: str
    status: str
    completed_at: Optional[str] = None

class StudyPlannerResponse(BaseModel):
    total_tasks: int
    completed_tasks: int
    completion_percent: float
    total_planned_minutes: int
    total_actual_minutes: int
    planned_hours: float
    actual_hours: float
    tasks: List[StudyTaskItem]

class CompleteTaskRequest(BaseModel):
    actual_minutes: int = 45

# ----------------------------------------------------
# 7. Recommendations Schemas
# ----------------------------------------------------
class RecommendationResponse(BaseModel):
    id: str
    courseCode: str
    title: str
    description: str
    priority: str
    impactEstimate: str
    estimatedTimeMinutes: int
    actionType: str
    completed: bool
    createdAt: str

# ----------------------------------------------------
# 8. Copilot Schemas
# ----------------------------------------------------
class CopilotRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class CopilotResponse(BaseModel):
    reply: str
    suggestions: Optional[List[str]] = None

# ----------------------------------------------------
# 9. Faculty & Interventions Schemas
# ----------------------------------------------------
class FacultyCohortStudent(BaseModel):
    id: str
    name: str
    rollNo: str
    major: str
    semester: str
    riskLevel: str
    riskScore: float
    attendance: float
    avgGrade: float
    flags: List[str]
    lastActive: str

class InterventionCreateRequest(BaseModel):
    student_id: str
    action: str
    notes: str
    follow_up_date: Optional[str] = None

class InterventionResponse(BaseModel):
    id: str
    student_id: str
    student_name: str
    faculty_id: str
    action: str
    notes: str
    status: str
    follow_up_date: Optional[str] = None
    created_at: str

# ----------------------------------------------------
# 10. Admin & CSV Data Quality Schemas
# ----------------------------------------------------
class CSVRowError(BaseModel):
    row: int
    column: str
    value: Any
    reason: str

class CSVPreviewResponse(BaseModel):
    valid: bool
    filename: str
    total_rows: int
    valid_count: int
    invalid_count: int
    valid_rows: List[Dict[str, Any]]
    errors: List[CSVRowError]

class CSVCommitRequest(BaseModel):
    valid_rows: List[Dict[str, Any]]

class CSVCommitResponse(BaseModel):
    success: bool
    imported_count: int
    skipped_count: int
    message: str

class AuditEventResponse(BaseModel):
    id: str
    actor_email: Optional[str] = None
    action: str
    entity_type: str
    details: Optional[str] = None
    created_at: str

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.app.core.security import get_password_hash
from backend.app.db.models import (
    User,
    Student,
    Course,
    Enrollment,
    Assessment,
    LMSActivity,
    TopicMastery,
    QuizQuestion,
    QuizAttempt,
    StudySession,
    Recommendation,
    PerformanceHistory,
    Intervention,
    AuditEvent
)

def seed_database_if_empty(db: Session):
    """
    Deterministically and idempotently seeds the CampusIQ database with
    synthetic student, faculty, course, quiz, and LMS records.
    Never duplicates data on server restart.
    """
    existing_admin = db.query(User).filter(User.email == "admin@campus.edu").first()
    if existing_admin:
        return  # Database already seeded

    print("[Database Seed] Seeding complete CampusIQ institutional dataset...")

    # 1. Admin User
    admin_user = User(
        email="admin@campus.edu",
        password_hash=get_password_hash("admin123"),
        full_name="Dean Jonathan Hayes (Admin)",
        role="admin"
    )
    db.add(admin_user)

    # 2. Faculty Advisor User
    faculty_user = User(
        email="e.vance@campus.edu",
        password_hash=get_password_hash("password123"),
        full_name="Dr. Evelyn Vance",
        avatar="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
        role="faculty"
    )
    db.add(faculty_user)
    db.flush()

    # 3. Primary Student User (Alex Rivera)
    student_user = User(
        email="a.rivera@campus.edu",
        password_hash=get_password_hash("password123"),
        full_name="Alex Rivera",
        avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        role="student"
    )
    db.add(student_user)
    db.flush()

    # 4. Primary Student Profile
    alex_student = Student(
        user_id=student_user.id,
        roll_number="23CS048",
        full_name="Alex Rivera",
        department="Computer Science & Engineering",
        semester="Semester 6 (Spring 2026)",
        university="Imperial Tech University",
        advisor_name="Dr. Evelyn Vance",
        academic_standing="Dean's Honor Roll",
        cgpa=3.78,
        projected_cgpa=3.84,
        credits_earned=96,
        total_credits=128,
        weekly_study_hours=24.5,
        class_rank_percentile=91
    )
    db.add(alex_student)
    db.flush()

    # 5. Cohort Students
    cohort_data = [
        ("m.vance@campus.edu", "Marcus Vance", "23CS012", 2.65, 62.4, 58.2),
        ("s.patel@campus.edu", "Sophia Patel", "23CS035", 2.90, 69.1, 64.0),
        ("l.chen@campus.edu", "Liam Chen", "23CS051", 3.15, 74.0, 73.5),
        ("e.watson@campus.edu", "Emma Watson", "23CS019", 3.95, 96.0, 94.8),
        ("j.taylor@campus.edu", "Jordan Taylor", "23CS077", 3.82, 93.5, 91.2),
    ]

    for email, name, roll, cgpa, att, grade in cohort_data:
        c_user = User(
            email=email,
            password_hash=get_password_hash("password123"),
            full_name=name,
            role="student"
        )
        db.add(c_user)
        db.flush()

        c_student = Student(
            user_id=c_user.id,
            roll_number=roll,
            full_name=name,
            department="Computer Science & Engineering",
            semester="Semester 6 (Spring 2026)",
            cgpa=cgpa,
            weekly_study_hours=18.0
        )
        db.add(c_student)

    # 6. Courses
    courses_info = [
        ("MA-204", "Applied Linear Algebra & SVD", "Prof. Elena Rostova", "e.rostova@campus.edu", 4),
        ("CS-301", "Advanced Data Structures & Algorithms", "Prof. Sarah Jenkins", "s.jenkins@campus.edu", 4),
        ("AI-401", "Machine Learning & Neural Networks", "Dr. Clara Zhang", "c.zhang@campus.edu", 4),
        ("CS-305", "Operating Systems & Concurrency", "Prof. David Miller", "d.miller@campus.edu", 3),
        ("CS-312", "Distributed Database Systems", "Prof. Amit Verma", "a.verma@campus.edu", 3),
    ]

    created_courses = {}
    for code, title, instr, email, creds in courses_info:
        crs = Course(
            course_code=code,
            course_name=title,
            instructor=instr,
            instructor_email=email,
            credits=creds,
            semester="Spring 2026",
            faculty_id=faculty_user.id
        )
        db.add(crs)
        db.flush()
        created_courses[code] = crs

    # 7. Enrollments for Alex Rivera
    alex_enrollment_data = [
        ("MA-204", 67.4, "C+", "B-", 71.0, 71.4, "critical", "Attendance dropped below 75% threshold; missed Quiz #3 on Singular Value Decomposition.", 5, 7, "Midterm Examination (35%)", "March 18, 2026"),
        ("CS-301", 78.8, "B", "A-", 82.5, 85.7, "moderate", "Performance drop in Dynamic Programming assignment; potential exam prep deficit.", 6, 7, "Algorithm Lab Practical", "March 22, 2026"),
        ("AI-401", 94.6, "A", "A", 95.0, 100.0, "low", None, 8, 8, "CNN Vision Mini-Project Submission", "March 26, 2026"),
        ("CS-305", 89.2, "A-", "A", 93.3, 100.0, "low", None, 6, 6, "Deadlock & Memory Management Quiz", "March 29, 2026"),
        ("CS-312", 96.1, "A", "A+", 96.5, 100.0, "low", None, 7, 7, "Raft Consensus Protocol Project", "April 04, 2026"),
    ]

    for code, gr, let, proj_let, att, asgn_rate, r_lvl, r_rsn, asg_comp, asg_tot, next_ev, ev_date in alex_enrollment_data:
        crs = created_courses[code]
        enr = Enrollment(
            student_id=alex_student.id,
            course_id=crs.id,
            grade_percent=gr,
            current_letter_grade=let,
            projected_letter_grade=proj_let,
            attendance_percent=att,
            assignment_rate=asgn_rate,
            risk_level=r_lvl,
            risk_reason=r_rsn,
            assignments_completed=asg_comp,
            total_assignments=asg_tot,
            next_evaluation=next_ev,
            evaluation_date=ev_date
        )
        db.add(enr)
        db.flush()

        # Add Assessments
        db.add(Assessment(enrollment_id=enr.id, title=f"{code} Quiz 1", assessment_type="quiz", score=88.0, due_date="Jan 30, 2026"))
        db.add(Assessment(enrollment_id=enr.id, title=f"{code} Quiz 2", assessment_type="quiz", score=75.0, due_date="Feb 15, 2026"))
        db.add(Assessment(enrollment_id=enr.id, title=next_ev, assessment_type="exam", score=None, due_date=ev_date))

    # 8. Digital Learning Twin Topic Mastery (Gaps, Needs Practice, Mastery & Not Assessed)
    mastery_seeds = [
        # MA-204 Linear Algebra
        ("MA-204", "Singular Value Decomposition (SVD)", 42.0, 2),  # priority learning gap
        ("MA-204", "Eigenvalues & Eigenvectors", 48.0, 3),          # priority learning gap
        ("MA-204", "Orthogonal Projections", 62.0, 1),              # needs practice
        ("MA-204", "Gaussian Elimination", 85.0, 4),                # provisional mastery
        ("MA-204", "Vector Spaces & Subspaces", 90.0, 5),           # provisional mastery
        ("MA-204", "Matrix Markov Chains", None, 0),                # NOT ASSESSED
        
        # CS-301 Data Structures & Algorithms
        ("CS-301", "Dynamic Programming with Bitmasking", 45.0, 2), # priority learning gap
        ("CS-301", "Red-Black Tree Rotations", 64.0, 1),            # needs practice
        ("CS-301", "Graph Traversals (BFS/DFS)", 88.0, 3),          # provisional mastery
        ("CS-301", "Dijkstra & Shortest Paths", 92.0, 4),           # provisional mastery
        ("CS-301", "Max Flow & Min Cut", None, 0),                  # NOT ASSESSED

        # AI-401 Machine Learning
        ("AI-401", "Loss Functions & Optimization", 86.0, 3),       # provisional mastery
        ("AI-401", "Backpropagation Calculus", 94.0, 4),            # provisional mastery
        ("AI-401", "Convolutional Neural Networks", 91.0, 2),       # provisional mastery
    ]

    for c_code, topic, score, attempts in mastery_seeds:
        crs = created_courses[c_code]
        db.add(TopicMastery(
            student_id=alex_student.id,
            course_id=crs.id,
            topic_name=topic,
            mastery_percent=score,
            attempt_count=attempts,
            last_assessed_at=datetime.utcnow() - timedelta(days=attempts * 2) if attempts > 0 else None
        ))

    # 9. Adaptive Quiz Question Bank (High-Fidelity Curated Questions)
    questions_bank = [
        # MA-204 SVD
        ("MA-204", "Singular Value Decomposition (SVD)", "beginner",
         "In the Singular Value Decomposition A = U Σ V^T, what do the diagonal elements of Σ represent?",
         "Eigenvectors of A", "Singular values of A, arranged in non-increasing order", "Determinants of submatrices", "Rank deficiency factors",
         "B", "The diagonal entries of the matrix Σ in SVD represent the singular values (square roots of non-negative eigenvalues of A^T A), conventionally arranged in non-increasing order."),

        ("MA-204", "Singular Value Decomposition (SVD)", "intermediate",
         "If matrix A has dimension 4x3, what are the respective dimensions of U, Σ, and V^T in its full SVD?",
         "4x4, 4x3, and 3x3", "4x3, 3x3, and 3x4", "3x3, 4x4, and 3x4", "4x4, 3x3, and 4x4",
         "A", "For a real m x n matrix (4x3), U is an m x m orthogonal matrix (4x4), Σ is m x n (4x3), and V^T is n x n (3x3)."),

        ("MA-204", "Singular Value Decomposition (SVD)", "advanced",
         "How is the Eckart-Young-Mirsky theorem utilized in low-rank matrix approximation via SVD?",
         "By inverting only the U matrix", "By keeping the k largest singular values in Σ and zeroing out the rest", "By computing the determinant of V", "By applying Gram-Schmidt to Σ",
         "B", "The Eckart-Young theorem states that the best rank-k approximation in both Frobenius and spectral norms is obtained by truncating SVD to the top k singular values."),

        # CS-301 Dynamic Programming
        ("CS-301", "Dynamic Programming with Bitmasking", "beginner",
         "What is the primary motivation for using bitmasks in Dynamic Programming?",
         "To encrypt memory states", "To represent compact subset states as binary integers in state transitions", "To speed up floating-point division", "To avoid recursion altogether",
         "B", "Bitmasking uses the binary representation of an integer to represent subsets of elements (0 = excluded, 1 = included), facilitating efficient DP transitions over small set universes."),

        ("CS-301", "Dynamic Programming with Bitmasking", "intermediate",
         "What is the standard time complexity of the Traveling Salesperson Problem (TSP) using Held-Karp Bitmask DP?",
         "O(N!)", "O(N^2 * 2^N)", "O(2^N)", "O(N^3)",
         "B", "Held-Karp dynamic programming with bitmasks solves TSP in O(N^2 * 2^N) time, a significant improvement over the naive O(N!) brute force."),

        # AI-401 Machine Learning
        ("AI-401", "Backpropagation Calculus", "intermediate",
         "What mathematical theorem forms the foundational computational mechanism of Backpropagation?",
         "Euler's Totient Theorem", "The Multivariate Chain Rule of Calculus", "Fourier Transform", "Bayes' Theorem",
         "B", "Backpropagation calculates gradients of composite neural network loss functions by iteratively applying the Multivariate Chain Rule backwards from the output layer."),
    ]

    for c_code, topic, diff, q_text, op_a, op_b, op_c, op_d, corr, expl in questions_bank:
        crs = created_courses[c_code]
        db.add(QuizQuestion(
            course_id=crs.id,
            topic_name=topic,
            difficulty=diff,
            question_text=q_text,
            option_a=op_a,
            option_b=op_b,
            option_c=op_c,
            option_d=op_d,
            correct_option=corr,
            explanation=expl
        ))

    # 10. Study Sessions (Planner)
    planner_tasks = [
        ("MA-204", "Singular Value Decomposition (SVD)", "Review SVD Decomposition Walkthrough", "Study 3D matrix visualization and solve 4 factorization problems.", 45, 45, "Today", "urgent", "completed"),
        ("MA-204", "Eigenvalues & Eigenvectors", "Solve Midterm Practice Proofs", "Practice characteristic polynomial derivations and diagonalization proofs.", 60, 0, "Tomorrow", "urgent", "planned"),
        ("CS-301", "Dynamic Programming with Bitmasking", "Solve Held-Karp Traveling Salesperson", "Code 3 bitmask DP state-space problems on LeetCode/HackerRank.", 50, 0, "In 3 Days", "recommended", "planned"),
        ("AI-401", "Backpropagation Calculus", "CNN Transfer Learning Milestone Prep", "Tune learning rate hyperparameters and verify validation loss.", 60, 60, "Yesterday", "optional", "completed"),
    ]

    for code, topic, title, desc, pl_min, act_min, pl_date, prio, stat in planner_tasks:
        db.add(StudySession(
            student_id=alex_student.id,
            course_code=code,
            topic_name=topic,
            title=title,
            description=desc,
            planned_minutes=pl_min,
            actual_minutes=act_min,
            planned_date=pl_date,
            priority=prio,
            status=stat,
            completed_at=datetime.utcnow() if stat == "completed" else None
        ))

    # 11. Recommendations
    db.add(Recommendation(
        student_id=alex_student.id,
        course_code="MA-204",
        title="Master Singular Value Decomposition (SVD)",
        description="AI model detects a 34% drop on matrix factorization questions. Complete the 25-minute interactive visual walkthrough before the midterm.",
        reason="Quiz #3 deficit and high exam weighting (35%)",
        priority="urgent",
        impact_estimate="+8.4% on Midterm exam",
        estimated_minutes=30,
        action_type="practice_quiz",
        status="pending",
        completed=False
    ))
    db.add(Recommendation(
        student_id=alex_student.id,
        course_code="MA-204",
        title="Attend Prof. Rostova's Office Hours",
        description="Attendance in Linear Algebra has fallen to 71%. Meeting with faculty can unlock attendance waiver credit and clarify complex homework proofs.",
        reason="Attendance below 75% threshold",
        priority="urgent",
        impact_estimate="Restore attendance standing & recover 5 quiz points",
        estimated_minutes=45,
        action_type="mentor_meeting",
        status="pending",
        completed=False
    ))

    # 12. Performance History (10 Weeks)
    perf_weeks = [
        ("W1", 88, 82, 18), ("W2", 90, 81, 20), ("W3", 86, 79, 19), ("W4", 92, 80, 25),
        ("W5", 84, 78, 21), ("W6", 76, 75, 14), ("W7", 79, 77, 17), ("W8", 85, 78, 23),
        ("W9", 89, 80, 26), ("W10", 91, 81, 28)
    ]
    for w, sc, avg, h in perf_weeks:
        db.add(PerformanceHistory(
            student_id=alex_student.id,
            week=w,
            student_score=sc,
            class_average=avg,
            study_hours=h,
            recorded_at=datetime.utcnow() - timedelta(weeks=10 - int(w[1:]))
        ))

    # 13. Interventions
    db.add(Intervention(
        student_id=alex_student.id,
        faculty_id=faculty_user.id,
        action="Attendance Consultation & Midterm Review",
        notes="Student missed 2 lectures due to medical leave. Advised on SVD remediation and granted permission to submit makeup assignment.",
        status="in_progress",
        follow_up_date="March 20, 2026"
    ))

    # 14. 56 Days of LMS Activity Heatmap Data
    today = datetime.utcnow()
    for day_i in range(56):
        act_date = (today - timedelta(days=55 - day_i)).strftime("%Y-%m-%d")
        # Generate activity patterns (active weekdays, lighter weekends)
        weekday = (today - timedelta(days=55 - day_i)).weekday()
        if weekday in [5, 6]:
            logins = 1 if day_i % 3 == 0 else 0
            mins = 20 if logins > 0 else 0
        else:
            logins = 3 if day_i % 4 == 0 else 2
            mins = 45 if day_i % 2 == 0 else 80

        db.add(LMSActivity(
            student_id=alex_student.id,
            activity_date=act_date,
            login_count=logins,
            minutes_active=mins,
            submissions_on_time=True
        ))

    # 15. Audit Events
    db.add(AuditEvent(
        actor_user_id=admin_user.id,
        action="INITIAL_SEED_COMPLETED",
        entity_type="System",
        details="Initial synthetic student and cohort records seeded deterministically."
    ))

    db.commit()
    print("[Database Seed] Complete CampusIQ dataset seeded successfully!")

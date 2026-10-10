# CampusIQ — 5-Minute Hackathon Demonstration Script
**HacXLerate 2026 · KPMG in India · Team DEBUG MASTERS**

---

## ⏱️ Minute 0:00 – 1:00 | The Problem & Executive Pitch
* **The Pitch**: "Good morning judges. In higher education, 28% of undergraduate students drop out or fail to complete their degree. The primary failure is *lagging indicator syndrome*—professors only discover students are failing weeks after midterms are graded. CampusIQ solves this by converting continuous telemetry—attendance, quiz drop-offs, homework delays, and LMS logins—into an explainable early warning system and personalized digital learning twin."
* **Action**: Open browser at **`http://localhost:3000`**.
* **Visual**: Show the **CampusIQ Dashboard** for student Alex Rivera (Dean's Honor Roll, 3.78 CGPA).

---

## ⏱️ Minute 1:00 – 2:00 | Explainable Risk Engine & Course Diagnosis
* **The Pitch**: "Notice that Alex has a strong 3.78 GPA, but CampusIQ has flagged **MA-204 (Applied Linear Algebra)** with a critical risk warning. Why? Because our multi-variate formula:
  $$R = 0.38 \cdot \Delta_{\text{Grade}} + 0.32 \cdot \Delta_{\text{Attendance}} + 0.18 \cdot \Delta_{\text{Assignment}} + 0.12 \cdot \Delta_{\text{Study}}$$
  detected that Alex's attendance fell to **71.0%** (violating the institutional 75% threshold) after missing Quiz 3 on Singular Value Decomposition."
* **Action**: Click on **MA-204** row in the Course Risk Matrix to pop up the deep-dive modal showing concepts needing remediation (*Singular Value Decomposition*) vs mastered topics (*Gaussian Elimination*).

---

## ⏱️ Minute 2:00 – 3:00 | Digital Learning Twin & Adaptive Quiz
* **The Pitch**: "Rather than just labeling the student at-risk, CampusIQ maintains a **Digital Learning Twin** that tracks topic-level mastery. Let's navigate to the Learning Twin tab."
* **Action**: Click **Digital Learning Twin** on the sidebar.
* **Demonstration**:
  1. Show **Singular Value Decomposition** marked as `Priority Learning Gap` (42% mastery).
  2. Click **Adaptive Quiz**.
  3. Show the sanitized 3-question adaptive quiz (note that answer keys are kept strictly on the backend).
  4. Select answers (Option B) and click **Submit Answers**.
  5. The server grades the test, displays the explanation, and updates the Digital Learning Twin mastery score dynamically using our moving average formula:
     $$\text{New Mastery} = 0.7 \cdot \text{Old} + 0.3 \cdot \text{Quiz}$$

---

## ⏱️ Minute 3:00 – 4:00 | Personalized 7-Day Study Planner & AI Copilot
* **The Pitch**: "To help the student take action, CampusIQ automatically synthesizes a rolling 7-day study plan."
* **Action**:
  1. Switch to **7-Day Study Planner** tab. Show budgeted study hours (e.g. 3.6 hours planned) focused on weak topics.
  2. Check off the SVD review task—watch actual study minutes update to 45m.
  3. Click **Ask AI Advisor** to open the CampusIQ Copilot. Show how the Copilot answers *"How can I raise my GPA to 3.90?"* by calculating the exact +0.09 CGPA uplift from improving MA-204.

---

## ⏱️ Minute 4:00 – 5:00 | Faculty Intervention & Admin CSV Data Quality
* **The Pitch**: "Now let's switch perspectives to institutional governance."
* **Action**:
  1. Click the **Faculty View** toggle. Show the cohort risk leaderboard (Marcus Vance at 78% risk, Sophia Patel, Alex Rivera).
  2. Click **Intervene** next to Marcus Vance—fill out a *Tutoring Referral*, set a follow-up date, and save. Show the intervention recorded in the institutional database.
  3. Click the **Admin View** toggle. Go to **CSV Ingestion & Quality**.
  4. Upload `data/sample_students.csv`—demonstrate the pre-commit validator showing 6 valid rows and catching row 7's invalid CGPA (5.50) and invalid attendance (110%) with row-by-row error reporting!
  5. Click **Commit Valid Records**—show the audit event logged.

* **Closing**: "CampusIQ delivers transparent mathematics, actionable early intervention, role-based privacy, and complete full-stack integration. Thank you!"

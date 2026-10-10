# CampusIQ — Academic Risk & Retention Scoring Methodology
**HacXLerate 2026 · Team DEBUG MASTERS**  
**Document Version:** 1.0.0 (Prototype Specification)  

---

## 1. Mathematical Formulation

The CampusIQ Academic Risk Engine evaluates continuous student course telemetry through a linear multi-variate deficit model:

$$\text{Composite Risk} = 0.38 \cdot \Delta_G + 0.32 \cdot \Delta_A + 0.18 \cdot \Delta_S + 0.12 \cdot \Delta_H$$

Where the individual component deficits are defined as:

1. **Grade Deficit ($\Delta_G$)**:
   $$\Delta_G = \max(0.0, 100.0 - \text{grade\_percent})$$
   *Weight: 38%* — Evaluation performance reflects active concept mastery.

2. **Attendance Deficit ($\Delta_A$)**:
   $$\Delta_A = \max(0.0, 100.0 - \text{attendance\_percent})$$
   *Weight: 32%* — In-person and lecture session presence correlates directly with course completion.

3. **Assignment Deficit ($\Delta_S$)**:
   $$\Delta_S = \max\left(0.0, 100.0 - \frac{\text{assignments\_completed}}{\text{total\_assignments}} \times 100\right)$$
   *Weight: 18%* — Timely delivery of formative coursework and laboratory exercises.

4. **Study Hours Deficit ($\Delta_H$)**:
   $$\Delta_H = \min\left(100.0, \max\left(0.0, (25.0 - \text{weekly\_study\_hours}) \times 4.0\right)\right)$$
   *Weight: 12%* — Self-directed preparation relative to the normative 25 hours/week expectation.

---

## 2. Risk Classification Boundaries

* **Low Risk ($0 \le \text{Score} < 30$)**: Student is on track.
* **Moderate Risk ($30 \le \text{Score} < 55$)**: Performance or attendance is trending downward; self-directed remediation recommended.
* **High Risk ($55 \le \text{Score} < 75$)**: Noticeable deficits across multiple evaluation criteria; proactive intervention required.
* **Critical Risk ($\text{Score} \ge 75$ or $\text{Attendance} < 75.0\%$ or $\text{Grade} < 68.0\%$)**: Urgent academic distress requiring advisor outreach.

> **Institutional Threshold Override**: Regardless of high marks in homework or exams, if $\text{attendance\_percent} < 75.0\%$, an independent **Critical Attendance Breach Flag** is triggered due to statutory university accreditation rules.

---

## 3. Provisional Retention Estimation Formula

Longitudinal graduation and term retention is modeled using a calibrated logistic sigmoid function:

$$P(\text{retention}) = \frac{100}{1 + e^{-z}}$$

$$z = 1.20 \cdot (\text{CGPA} - 2.50) + 0.04 \cdot (\text{Attendance} - 75.0) + 0.03 \cdot (\text{AverageGrade} - 70.0) - 0.85 \cdot C_{\text{critical}}$$

### Prototype Model Limitations & Disclaimers:
1. **Rule-Based Prototype Heuristic**: This model is a transparent, explainable heuristic calibrated from institutional literature, **not** an opaque deep-learning model trained on real student outcomes.
2. **Scale Assumptions**: CGPA is calculated on a 0.0 – 4.0 scale.
3. **No Definitive Predictions**: The output represents decision-support telemetry, never an automated determination that a student will fail or drop out.

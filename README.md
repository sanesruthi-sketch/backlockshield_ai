# CampusIQ Backend — AI Student Success Platform
**HacXLerate 2026 · Team DEBUG MASTERS**

> **Enterprise-Grade FastAPI Backend & Predictive Retention Analytics Engine**  
> Built with **Python 3.10+**, **FastAPI**, **SQLAlchemy 2.0**, **SQLite / PostgreSQL**, and an integrated **ML Academic Risk Prediction Engine**.

---

## 🏛️ Architecture Overview

```text
backend/
├── app/
│   ├── api/
│   │   ├── deps.py             # Dependency injection (Auth, DB session, Roles)
│   │   └── v1/
│   │       ├── auth.py         # JWT Token Login, Register, Profile (/api/v1/auth)
│   │       ├── students.py     # Student profiles (/api/v1/students/me)
│   │       ├── analytics.py    # Retention probability & history (/api/v1/analytics)
│   │       ├── courses.py      # Course telemetry & risk flags (/api/v1/courses)
│   │       ├── recommendations.py # Prescriptive AI actions (/api/v1/recommendations)
│   │       ├── faculty.py      # Advisor cohort management (/api/v1/faculty)
│   │       ├── copilot.py      # Contextual AI Advisor Chatbot (/api/v1/ai/copilot)
│   │       └── health.py       # Healthcheck & latency ping (/api/v1/health)
│   ├── core/
│   │   ├── config.py           # Pydantic Settings & environment variables
│   │   └── security.py         # Bcrypt password hashing & JWT encoding/decoding
│   ├── db/
│   │   ├── database.py         # SQLAlchemy engine, session maker, Base
│   │   ├── models.py           # DB Entities (User, Student, Course, Enrollment, etc.)
│   │   └── seed.py             # Automatic database seeder for demo zero-setup
│   ├── ml/
│   │   ├── risk_engine.py      # Multi-variate Academic Risk Predictor
│   │   └── copilot_service.py  # RAG-grounded Academic Advisory Service
│   └── main.py                 # FastAPI application factory & router inclusion
├── main.py                     # Convenience root entry point
├── run.py                      # One-command runner script (`python backend/run.py`)
└── requirements.txt            # Production dependencies
```

---

## 🧠 Machine Learning Risk & Retention Engine

The engine in `backend/app/ml/risk_engine.py` implements an empirical multi-variate risk scoring algorithm:

$$RiskScore = 0.38 \cdot (100 - G) + 0.32 \cdot (100 - A) + 0.18 \cdot (100 - S) + 0.12 \cdot \max(0, 25 - H)$$

* **$G$**: Evaluation / Grade Percent ($0 - 100$)
* **$A$**: Biometric & LMS Attendance Rate ($0 - 100$)
* **$S$**: On-time Assignment Submission Rate ($0 - 100$)
* **$H$**: Weekly Dedicated Study Hours

### Retention Probability Calculation
A calibrated logistic sigmoid models overall institutional graduation probability:

$$P(\text{retention}) = \frac{1}{1 + e^{-z}} \quad \text{where} \quad z = 1.2(CGPA - 2.5) + 0.04(A - 75) + 0.03(G - 70) - 0.85 \cdot C_{\text{critical}}$$

---

## 🔒 Security & Authentication
- **Bcrypt Password Hashing**: Passwords stored as salted one-way hashes via `passlib[bcrypt]`.
- **JWT Bearer Tokens**: RFC 7519 compliant JSON Web Tokens with configurable expiration.
- **Role-Based Access Control (RBAC)**: Distinguishes between `student`, `faculty`, and `admin`.
- **CORS Middleware**: Explicitly whitelists Vite development ports (`localhost:3000`, `localhost:5173`).

---

## 🚀 How to Run

### 1. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 2. Start the Backend Server
```bash
python backend/run.py
```
*Or via Uvicorn:*
```bash
uvicorn backend.main:app --reload --port 8000
```

### 3. Interactive Documentation
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 👥 Hackathon Credits
- **Event**: HacXLerate 2026
- **Team**: DEBUG MASTERS
- **Project**: CampusIQ – AI Student Success Platform

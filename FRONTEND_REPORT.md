# CampusIQ — Frontend Technical & Architectural Report
**AI Student Success & Early Intervention Analytics Platform**  
**HacXLerate 2026 · Team DEBUG MASTERS**  
**Date:** October 2026  
**Stack:** React 18 · TypeScript 5.3 · Tailwind CSS 3.4 · Vite 5 · Python FastAPI

---

## 1. Executive Summary

**CampusIQ** is an AI-driven student success and retention platform engineered to transform reactive academic counseling into proactive, real-time intervention. Developed for **HacXLerate 2026** by **Team DEBUG MASTERS**, CampusIQ addresses the critical challenge of higher-education attrition, where students encounter academic distress weeks before midterms without institutional visibility.

The frontend is built with **React 18, TypeScript, and Tailwind CSS**, taking aesthetic and structural inspiration from modern learning platforms such as the **Sapphire Learning Management System**. It features:
- Continuous multi-factor risk diagnostics across grades, attendance, and LMS engagement.
- A zero-dependency, responsive SVG academic trajectory visualizer.
- An interactive **CampusIQ Academic Copilot** advisor.
- A dual-persona architecture supporting both **Student View** and **Faculty / Advisor View**.
- A fault-tolerant network layer that communicates seamlessly with a **Python FastAPI** backend while providing an offline, zero-setup demo mode for evaluators.

---

## 2. Design System & Visual Architecture

### 2.1 Aesthetic Inspiration & Principles
The user interface draws inspiration from modern enterprise EdTech platforms:
- **Clean Neomorphic & Glassmorphism Surfaces**: Frosted translucent backdrops (`glass-panel`, `backdrop-blur-md`) layered over neutral slate backgrounds (`#f8fafc`).
- **Curated Color Tokens**:
  - **Electric Indigo & Brand Primary** (`#4F46E5`, `#6366F1`): Anchor interface elements, navigational focus, and core brand assets.
  - **AI Violet & Radiant Glow** (`#8B5CF6`, `#A855F7`): Reserved for predictive insights, AI copilot responses, and automated actions.
  - **Emerald Tier** (`#10B981`): Designates Dean’s List standing, mastered competencies, and strong retention indicators.
  - **Amber Tier** (`#F59E0B`): Moderate risk indicators, late attendance warnings, and pending evaluations.
  - **Rose / Crimson Tier** (`#EF4444`, `#F43F5E`): Critical attrition risk, attendance breaches (&lt;75%), and urgent intervention flags.
- **Typography**: Built around **Plus Jakarta Sans** with tabular numeric data styled in JetBrains Mono for legibility during rapid scanning.

### 2.2 Visual Hierarchy & Layout Strategy
The platform utilizes a sticky two-column layout:
1. **Collapsible Navigation Sidebar (Left, 256px)**: Brand emblem, student/advisor persona toggle, section navigation with live notification counters, quick Copilot launch widget, and real-time backend connection status.
2. **Top Control Bar (Header, 80px)**: Universal keyboard-triggered search (`⌘K`), semester term selector, real-time FastAPI latency ping, notification center, and profile badge.
3. **Dynamic Viewport (Center-Right)**: Responsive grid reacting to active viewports (`dashboard`, `risk-predictor`, `analytics`, `action-plan`, `copilot`, `faculty-cohort`).

---

## 3. Component Architecture & Feature Breakdown

| Component | File Path | Functional Purpose | Interactive Capabilities |
| :--- | :--- | :--- | :--- |
| **Sidebar** | [`src/components/Sidebar.tsx`](./src/components/Sidebar.tsx) | Navigation & persona routing | Live badge counts, role toggle (`student`/`faculty`), backend modal launcher |
| **Header** | [`src/components/Header.tsx`](./src/components/Header.tsx) | App-wide controls & notifications | `⌘K` command palette toggle, notifications popover, FastAPI latency pill |
| **StatsGrid** | [`src/components/StatsGrid.tsx`](./src/components/StatsGrid.tsx) | High-level KPI telemetry cards | Animated progress bars, trend micro-badges, percentile benchmarks |
| **PerformanceChart** | [`src/components/PerformanceChart.tsx`](./src/components/PerformanceChart.tsx) | Academic trajectory comparison | Pure SVG Bezier curve, area gradient, week-by-week hover tooltips, metric switch |
| **CourseRiskTable** | [`src/components/CourseRiskTable.tsx`](./src/components/CourseRiskTable.tsx) | Early warning risk matrix | Multi-column sort, risk status tags, click-to-diagnose course trigger |
| **CourseModal** | [`src/components/CourseModal.tsx`](./src/components/CourseModal.tsx) | Deep-dive course analytics | Remediation vs mastered concept breakdown, instructor mailto, AI query button |
| **AiInsightsCard** | [`src/components/AiInsightsCard.tsx`](./src/components/AiInsightsCard.tsx) | Prescriptive intervention engine | One-click action completion, impact tags, model recalculation trigger |
| **AttendanceHeatmap** | [`src/components/AttendanceHeatmap.tsx`](./src/components/AttendanceHeatmap.tsx) | 56-day engagement matrix | GitHub-style day blocks, attendance status hover inspection, absence warnings |
| **UpcomingDeadlines**| [`src/components/UpcomingDeadlines.tsx`](./src/components/UpcomingDeadlines.tsx) | Evaluative milestone queue | Difficulty tags (Easy/Medium/Hard), prep-hour estimates, task checkboxes |
| **AiChatCopilot** | [`src/components/AiChatCopilot.tsx`](./src/components/AiChatCopilot.tsx) | Interactive AI Advisor | Dynamic query handling, markdown rendering, prompt suggestions |
| **FacultyView** | [`src/components/FacultyView.tsx`](./src/components/FacultyView.tsx) | Advisor cohort management | At-risk leaderboard, real-time search, risk-tier filtering, one-click alert dispatch |
| **BackendStatusModal**| [`src/components/BackendStatusModal.tsx`](./src/components/BackendStatusModal.tsx) | API diagnostics & control | Live endpoint testing (`/health`, `/courses`), raw JSON viewer, mock toggle |
| **SearchModal** | [`src/components/SearchModal.tsx`](./src/components/SearchModal.tsx) | Global Spotlight command palette | Rapid search across courses, recommendations, and workspace tabs |

---

## 4. State Management & API Integration Layer

```
                        ┌──────────────────────────────────┐
                        │      CampusIQ React App          │
                        │       (Vite Development)         │
                        └───────────────┬──────────────────┘
                                        │
                         HTTP / Fetch Client (/api/v1)
                                        │
              ┌─────────────────────────┴─────────────────────────┐
              ▼                                                   ▼
┌───────────────────────────┐                       ┌───────────────────────────┐
│     FastAPI Backend       │                       │  High-Fidelity Mock Mode  │
│    (http://localhost:8000)│                       │     (In-Memory Engine)    │
│                           │                       │                           │
│ • GET /health             │                       │ • Fully offline fallback  │
│ • GET /students/me        │      Fail / Offline   │ • Zero setup requirement  │
│ • GET /analytics/metrics  │ ────────────────────> │ • Identical schema match  │
│ • GET /courses            │                       │ • Instant responsiveness  │
│ • POST /ai/copilot        │                       │                           │
└───────────────────────────┘                       └───────────────────────────┘
```

### 4.1 Fault-Tolerant Resilience
The communication pipeline in [`src/services/api.ts`](./src/services/api.ts) utilizes an optimistic, non-blocking fallback strategy:
1. **Health Verification**: Periodic ping checks test the availability of `/api/v1/health`.
2. **Seamless Fallback**: If the FastAPI server is unreachable or offline, the platform transparently switches to the mock dataset in [`src/services/mockData.ts`](./src/services/mockData.ts) without unhandled exceptions or broken views.
3. **Manual Override**: Evaluators can explicitly toggle between **Live FastAPI Mode** and **Standalone Demo Mode** using the in-app modal.

---

## 5. Key Innovations & Hackathon Evaluation Criteria

### 5.1 Innovation & Prescriptive AI
* **Beyond Static Dashboards**: Traditional academic dashboards merely report historic grades. CampusIQ detects leading indicators (e.g., missed lab practicals + attendance dropping below 75% in MA-204) and generates targeted corrective actions (e.g., *“30-min SVD Matrix Factorization interactive drill to gain +8.4% on midterm”*).
* **Conversational Advisory**: The **CampusIQ Copilot** contextualizes the student's actual grades, calculating GPA swings and proposing revision schedules.

### 5.2 Technical Polish & Zero-Dependency Visualizations
* **Lightweight Performance**: Rather than importing heavy graphing libraries that bloat bundles and cause build fragility, the performance trajectory curve is rendered using a **custom responsive SVG path engine** with interactive coordinate math, gradient fills, and reactive hover nodes.
* **Full-Stack Preparedness**: The repository ships with both the complete frontend and a working Python FastAPI server ([`backend/main.py`](./backend/main.py)), enabling full end-to-end demonstrations.

### 5.3 Dual-Persona Workflow
* Switching between **Student View** and **Faculty/Advisor View** allows judges to evaluate the platform from both perspectives:
  * **Students** receive personalized encouragement, risk transparency, and self-directed recovery tools.
  * **Advisors** receive cohort risk breakdowns, attendance breach alerts, and batch intervention communication tools.

---

## 6. Quick Verification & Execution Commands

### Frontend Run Command
```powershell
# From c:\Users\Dell\Desktop\student
npm install
npm run dev
# Running on http://localhost:3000
```

### Backend Run Command
```powershell
# From c:\Users\Dell\Desktop\student
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
# API Docs on http://localhost:8000/docs
```

---

*Report compiled by Antigravity for Team DEBUG MASTERS · HacXLerate 2026.*

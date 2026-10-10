// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatsGrid } from './components/StatsGrid';
import { PerformanceChart } from './components/PerformanceChart';
import { CourseRiskTable } from './components/CourseRiskTable';
import { AiInsightsCard } from './components/AiInsightsCard';
import { AttendanceHeatmap } from './components/AttendanceHeatmap';
import { UpcomingDeadlines } from './components/UpcomingDeadlines';
import { AiChatCopilot } from './components/AiChatCopilot';
import { FacultyView } from './components/FacultyView';
import { LearningTwinView } from './components/LearningTwinView';
import { AdaptiveQuizModal } from './components/AdaptiveQuizModal';
import { StudyPlannerView } from './components/StudyPlannerView';
import { AdminView } from './components/AdminView';
import { LoginModal } from './components/LoginModal';
import { CourseModal } from './components/CourseModal';
import { BackendStatusModal } from './components/BackendStatusModal';
import { SearchModal } from './components/SearchModal';
import { 
  StudentProfile, 
  Course, 
  MetricSummary, 
  PerformanceHistoryItem, 
  AiRecommendation, 
  UpcomingTask,
  FacultyCohortStudent, 
  BackendHealth,
  TopicMasteryItem,
  StudyPlannerData,
  UserRole,
  UserAuth
} from './types';
import { 
  fetchStudentProfile, 
  fetchMetrics, 
  fetchCourses, 
  fetchPerformanceHistory, 
  fetchAiRecommendations, 
  completeRecommendationAction,
  fetchFacultyCohort, 
  fetchLearningTwin,
  fetchStudyPlanner,
  generateStudyPlan,
  completeStudyTask,
  checkBackendHealth,
  setAuthToken 
} from './services/api';
import { mockUpcomingTasks } from './services/mockData';
import { 
  Sparkles, 
  ShieldAlert, 
  GraduationCap, 
  ArrowRight,
  BrainCircuit,
  Calendar,
  Database
} from 'lucide-react';

export function App() {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('student');

  // Core Data State
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [metrics, setMetrics] = useState<MetricSummary | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [perfHistory, setPerfHistory] = useState<PerformanceHistoryItem[]>([]);
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);
  const [tasks, setTasks] = useState<UpcomingTask[]>(mockUpcomingTasks);
  const [cohort, setCohort] = useState<FacultyCohortStudent[]>([]);
  const [topics, setTopics] = useState<TopicMasteryItem[]>([]);
  const [plannerData, setPlannerData] = useState<StudyPlannerData | null>(null);

  // Loading States
  const [isRefreshingRecs, setIsRefreshingRecs] = useState<boolean>(false);
  const [isRefreshingTwin, setIsRefreshingTwin] = useState<boolean>(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);

  // Modals
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isCopilotModalOpen, setIsCopilotModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Quiz Modal State
  const [quizModalCourseId, setQuizModalCourseId] = useState<string | null>(null);
  const [quizModalTopicName, setQuizModalTopicName] = useState<string | null>(null);

  // Backend Health
  const [backendHealth, setBackendHealth] = useState<BackendHealth>({
    status: 'checking',
    endpoint: 'http://localhost:8000',
    message: 'Testing connection to FastAPI backend...',
  });

  // Initial Load
  const loadData = async () => {
    const [p, m, c, ph, r, coh, tw, pl, bh] = await Promise.all([
      fetchStudentProfile(),
      fetchMetrics(),
      fetchCourses(),
      fetchPerformanceHistory(),
      fetchAiRecommendations(),
      fetchFacultyCohort(),
      fetchLearningTwin(),
      fetchStudyPlanner(),
      checkBackendHealth(),
    ]);

    setStudent(p);
    setMetrics(m);
    setCourses(c);
    setPerfHistory(ph);
    setRecommendations(r);
    setCohort(coh);
    setTopics(tw);
    setPlannerData(pl);
    setBackendHealth(bh);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(async () => {
      const bh = await checkBackendHealth();
      setBackendHealth(bh);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Global Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleToggleRecommendation = async (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
    await completeRecommendationAction(id);
  };

  const handleRefreshRecommendations = () => {
    setIsRefreshingRecs(true);
    setTimeout(async () => {
      const r = await fetchAiRecommendations();
      setRecommendations(r);
      setIsRefreshingRecs(false);
    }, 800);
  };

  const handleRefreshTwin = async () => {
    setIsRefreshingTwin(true);
    try {
      const updated = await fetchLearningTwin();
      setTopics(updated);
    } finally {
      setIsRefreshingTwin(false);
    }
  };

  const handleOpenQuiz = (courseId: string, topicName: string) => {
    setQuizModalCourseId(courseId);
    setQuizModalTopicName(topicName);
  };

  const handleToggleStudyTask = async (taskId: string, minutes: number) => {
    await completeStudyTask(taskId, minutes);
    const updated = await fetchStudyPlanner();
    setPlannerData(updated);
  };

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const updated = await generateStudyPlan(45);
      setPlannerData(updated);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleLoginSuccess = (userAuth: UserAuth) => {
    setUserRole(userAuth.role);
    if (userAuth.role === 'admin') {
      setActiveTab('admin-csv');
    } else if (userAuth.role === 'faculty') {
      setActiveTab('faculty-cohort');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleSignOut = () => {
    fetch('http://localhost:5000/api/datas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: "Vite React Client",
        action: "STUDENT_SIGNOUT",
        timestamp: new Date().toISOString(),
        student: student
      })
    }).catch(() => {});
    setIsLoginModalOpen(true);
  };

  if (!student || !metrics) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center animate-bounce shadow-lg shadow-brand-500/25">
            <GraduationCap className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700">Loading CampusIQ Full-Stack Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col md:flex-row antialiased selection:bg-brand-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        backendHealth={backendHealth}
        onOpenBackendModal={() => setIsBackendModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          student={student}
          userRole={userRole}
          backendHealth={backendHealth}
          onOpenCopilot={() => setIsCopilotModalOpen(true)}
          onOpenBackendModal={() => setIsBackendModalOpen(true)}
          onSearchClick={() => setIsSearchModalOpen(true)}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-7">
          {/* ================= VIEW: ADMIN PORTAL ================= */}
          {userRole === 'admin' || activeTab.startsWith('admin') ? (
            <AdminView initialTab={activeTab} />
          ) : userRole === 'faculty' || activeTab === 'faculty-cohort' ? (
            /* ================= VIEW: FACULTY PORTAL ================= */
            <FacultyView cohort={cohort} />
          ) : (
            /* ================= VIEW: STUDENT PORTAL ================= */
            <>
              {/* TAB: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <>
                  {/* Hero Welcome Banner */}
                  <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-brand-500/30 text-brand-200 border border-brand-400/30">
                            Spring 2026 Academic Term
                          </span>
                          <span className="text-xs text-slate-300">· {student.major}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                          Welcome back, {student.name} 👋
                        </h2>
                        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                          Your overall academic health index is <strong className="text-emerald-400">88% (Strong)</strong>. 
                          The multi-variate risk engine flagged <strong className="text-rose-400">MA-204 (Linear Algebra)</strong> at 71% attendance with an SVD gap.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <button
                          onClick={() => setActiveTab('twin')}
                          className="px-4 py-2.5 rounded-xl bg-white text-brand-900 font-bold text-xs hover:bg-slate-100 transition-all shadow-md cursor-pointer flex items-center gap-2"
                        >
                          <BrainCircuit className="w-3.5 h-3.5 text-violet-600" />
                          <span>Digital Learning Twin</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('planner')}
                          className="px-4 py-2.5 rounded-xl bg-brand-600/40 hover:bg-brand-600/60 border border-white/20 text-white font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>7-Day Plan</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 4 Core KPI Cards */}
                  <StatsGrid metrics={metrics} />

                  {/* Trajectory Curve & Upcoming Milestones */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <PerformanceChart data={perfHistory} />
                    </div>
                    <div className="lg:col-span-1">
                      <UpcomingDeadlines tasks={tasks} onToggleTask={() => {}} />
                    </div>
                  </div>

                  {/* Course Risk & Early Warning Table */}
                  <CourseRiskTable
                    courses={courses}
                    onSelectCourse={(course) => setSelectedCourse(course)}
                  />

                  {/* AI Recommendations & 56-Day Heatmap */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AiInsightsCard
                      recommendations={recommendations}
                      onToggleComplete={handleToggleRecommendation}
                      onRefresh={handleRefreshRecommendations}
                      isRefreshing={isRefreshingRecs}
                    />
                    <AttendanceHeatmap />
                  </div>
                </>
              )}

              {/* TAB: DIGITAL LEARNING TWIN */}
              {activeTab === 'twin' && (
                <LearningTwinView
                  topics={topics}
                  onTakeQuiz={handleOpenQuiz}
                  onRefresh={handleRefreshTwin}
                  isRefreshing={isRefreshingTwin}
                />
              )}

              {/* TAB: 7-DAY STUDY PLANNER */}
              {activeTab === 'planner' && plannerData && (
                <StudyPlannerView
                  plannerData={plannerData}
                  onToggleTask={handleToggleStudyTask}
                  onGeneratePlan={handleGeneratePlan}
                  isGenerating={isGeneratingPlan}
                />
              )}

              {/* TAB: RISK PREDICTOR */}
              {activeTab === 'risk-predictor' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200/80 shadow-xs">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-500/20">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Explainable Academic Risk Prediction Engine
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                          Deterministic baseline formula: <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold text-slate-800">R = 0.38×Grade_Deficit + 0.32×Attendance_Deficit + 0.18×Assignment_Deficit + 0.12×Study_Deficit</code>.
                          Separate institutional attendance warning triggered if attendance &lt; 75.0%.
                        </p>
                      </div>
                    </div>
                  </div>

                  <CourseRiskTable
                    courses={courses}
                    onSelectCourse={(course) => setSelectedCourse(course)}
                  />

                  <AiInsightsCard
                    recommendations={recommendations}
                    onToggleComplete={handleToggleRecommendation}
                    onRefresh={handleRefreshRecommendations}
                    isRefreshing={isRefreshingRecs}
                  />
                </div>
              )}

              {/* TAB: ACADEMIC TRAJECTORY */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <StatsGrid metrics={metrics} />
                  <PerformanceChart data={perfHistory} />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AttendanceHeatmap />
                    <UpcomingDeadlines tasks={tasks} onToggleTask={() => {}} />
                  </div>
                </div>
              )}

              {/* TAB: AI COPILOT */}
              {activeTab === 'copilot' && (
                <div className="max-w-4xl mx-auto">
                  <AiChatCopilot student={student} onNavigateTab={setActiveTab} />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Course Detail Modal */}
      <CourseModal
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
        onAskCopilotAboutCourse={() => setActiveTab('copilot')}
      />

      {/* Adaptive Quiz Modal */}
      <AdaptiveQuizModal
        courseId={quizModalCourseId}
        topicName={quizModalTopicName}
        onClose={() => {
          setQuizModalCourseId(null);
          setQuizModalTopicName(null);
        }}
        onMasteryUpdated={handleRefreshTwin}
      />

      {/* Login & Demo Persona Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onSignOut={handleSignOut}
        currentUser={student}
      />

      {/* Backend Status & API Diagnostics Modal */}
      <BackendStatusModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        backendHealth={backendHealth}
        onRefreshHealth={async () => {
          const bh = await checkBackendHealth();
          setBackendHealth(bh);
        }}
      />

      {/* Spotlight Search Command Modal (⌘K) */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        courses={courses}
        recommendations={recommendations}
        onSelectCourse={(course) => setSelectedCourse(course)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* AI Advisor Modal Drawer */}
      {isCopilotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <AiChatCopilot
              student={student}
              isOpenAsModal={true}
              onCloseModal={() => setIsCopilotModalOpen(false)}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                setIsCopilotModalOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

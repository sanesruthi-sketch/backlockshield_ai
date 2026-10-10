import React from 'react';
import { Course } from '../types';
import { 
  X, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  Calendar, 
  Mail, 
  ExternalLink,
  GraduationCap
} from 'lucide-react';

interface CourseModalProps {
  course: Course | null;
  onClose: () => void;
  onAskCopilotAboutCourse: (courseCode: string) => void;
}

export const CourseModal: React.FC<CourseModalProps> = ({
  course,
  onClose,
  onAskCopilotAboutCourse,
}) => {
  if (!course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header banner */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-brand-50/40 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-md ${
                course.riskLevel === 'critical'
                  ? 'bg-rose-600 shadow-rose-500/20'
                  : course.riskLevel === 'moderate'
                  ? 'bg-amber-600 shadow-amber-500/20'
                  : 'bg-brand-600 shadow-brand-500/20'
              }`}
            >
              <GraduationCap className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200/80 text-slate-800">
                  {course.code}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {course.credits} Credits
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{course.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>{course.instructor}</span>
                <span>·</span>
                <a
                  href={`mailto:${course.instructorEmail}`}
                  className="text-brand-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <Mail className="w-3 h-3" />
                  {course.instructorEmail}
                </a>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Current Grade</p>
              <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                {course.gradePercent}% <span className="text-xs text-slate-400">({course.currentGrade})</span>
              </p>
            </div>
            <div className="border-x border-slate-200">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Projected</p>
              <p className="text-lg font-extrabold text-brand-600 mt-0.5">
                {course.projectedGrade}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Attendance</p>
              <p className={`text-lg font-extrabold mt-0.5 ${course.attendancePercent < 75 ? 'text-rose-600' : 'text-slate-900'}`}>
                {course.attendancePercent}%
              </p>
            </div>
          </div>

          {/* Risk Diagnostic note if present */}
          {course.riskReason && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-950 text-xs">CampusIQ Risk Diagnosis</h4>
                <p className="text-rose-800 text-xs mt-1 leading-relaxed">
                  {course.riskReason}
                </p>
              </div>
            </div>
          )}

          {/* Concept Mastery Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Struggling topics */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70">
              <div className="flex items-center gap-2 mb-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-amber-950 text-xs">Concepts Needing Remediation</h4>
              </div>
              {course.topicsStruggling.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-amber-900">
                  {course.topicsStruggling.map((topic, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-amber-700 italic">No struggling concepts detected!</p>
              )}
            </div>

            {/* Mastered topics */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70">
              <div className="flex items-center gap-2 mb-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-emerald-950 text-xs">Mastered Competencies</h4>
              </div>
              <ul className="space-y-1.5 text-xs text-emerald-900">
                {course.topicsMastered.map((topic, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Next Milestone */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-brand-600" />
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Upcoming Assessment</p>
                <p className="text-xs font-bold text-slate-800">{course.nextEvaluation}</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
              {course.evaluationDate}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-semibold"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              onAskCopilotAboutCourse(course.code);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI Advisor about {course.code}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

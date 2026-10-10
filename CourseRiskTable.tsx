import React from 'react';
import { Course, RiskLevel } from '../types';
import { 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ChevronRight,
  BookOpen,
  Calendar
} from 'lucide-react';

interface CourseRiskTableProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
}

export const CourseRiskTable: React.FC<CourseRiskTableProps> = ({
  courses,
  onSelectCourse,
}) => {
  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
            Critical Risk
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Moderate Risk
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            On Track
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">Course Performance & Early Warning Matrix</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {courses.length} Enrolled Courses
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-factor academic risk detection updated daily
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Click any course for diagnostic breakdown</span>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-5">Course</th>
              <th className="py-3 px-4">Current Grade</th>
              <th className="py-3 px-4">Projected</th>
              <th className="py-3 px-4">Attendance</th>
              <th className="py-3 px-4">AI Risk Status</th>
              <th className="py-3 px-4">Next Evaluation</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {courses.map((course) => (
              <tr
                key={course.id}
                onClick={() => onSelectCourse(course)}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                {/* Course Name & Code */}
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        course.riskLevel === 'critical'
                          ? 'bg-rose-100 text-rose-700'
                          : course.riskLevel === 'moderate'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-brand-100 text-brand-700'
                      }`}
                    >
                      {course.code.split('-')[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                          {course.title}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {course.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {course.instructor} · {course.credits} Credits
                      </p>
                    </div>
                  </div>
                </td>

                {/* Current Grade */}
                <td className="py-4 px-4 font-semibold text-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{course.gradePercent}%</span>
                    <span className="text-[11px] font-semibold text-slate-400">({course.currentGrade})</span>
                  </div>
                  <div className="w-20 bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        course.gradePercent < 70
                          ? 'bg-rose-500'
                          : course.gradePercent < 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${course.gradePercent}%` }}
                    />
                  </div>
                </td>

                {/* Projected Grade */}
                <td className="py-4 px-4">
                  <span
                    className={`inline-block font-extrabold px-2.5 py-1 rounded-lg text-xs ${
                      course.projectedGrade.startsWith('A')
                        ? 'bg-emerald-100 text-emerald-800'
                        : course.projectedGrade.startsWith('B')
                        ? 'bg-brand-100 text-brand-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {course.projectedGrade}
                  </span>
                </td>

                {/* Attendance */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-bold ${
                        course.attendancePercent < 75 ? 'text-rose-600' : 'text-slate-700'
                      }`}
                    >
                      {course.attendancePercent}%
                    </span>
                    {course.attendancePercent < 75 && (
                      <span className="text-[10px] text-rose-600 bg-rose-50 px-1 rounded font-semibold">
                        &lt;75%
                      </span>
                    )}
                  </div>
                  <div className="w-16 bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        course.attendancePercent < 75 ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${course.attendancePercent}%` }}
                    />
                  </div>
                </td>

                {/* AI Risk Status */}
                <td className="py-4 px-4">
                  {getRiskBadge(course.riskLevel)}
                </td>

                {/* Next Evaluation */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1 text-slate-700 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.nextEvaluation}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{course.evaluationDate}</p>
                </td>

                {/* Action button */}
                <td className="py-4 px-5 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCourse(course);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-semibold transition-all group-hover:border-brand-200"
                  >
                    <Sparkles className="w-3 h-3 text-brand-600" />
                    <span>AI Diagnosis</span>
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

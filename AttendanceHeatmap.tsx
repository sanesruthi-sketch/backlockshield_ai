import React, { useState } from 'react';
import { CalendarCheck, AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';

export const AttendanceHeatmap: React.FC = () => {
  const [hoveredDay, setHoveredDay] = useState<{ day: number; status: string; date: string; course: string } | null>(null);

  // Generate 8 weeks (56 days) of attendance patterns
  const weeks = 8;
  const daysPerWeek = 7;
  const daysData = Array.from({ length: weeks * daysPerWeek }, (_, index) => {
    const isWeekend = index % 7 === 0 || index % 7 === 6;
    let status = 'present';
    if (isWeekend) {
      status = 'weekend';
    } else if (index === 18 || index === 32 || index === 45) {
      status = 'absent';
    } else if (index === 25 || index === 38) {
      status = 'late';
    }

    const dateObj = new Date(2026, 0, 15);
    dateObj.setDate(dateObj.getDate() + index);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      day: index,
      status,
      date: dateStr,
      course: status === 'absent' ? 'MA-204 Linear Algebra' : 'Lecture & Lab Sessions',
    };
  });

  const getColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-emerald-500 hover:ring-2 hover:ring-emerald-400';
      case 'absent':
        return 'bg-rose-500 hover:ring-2 hover:ring-rose-400';
      case 'late':
        return 'bg-amber-400 hover:ring-2 hover:ring-amber-300';
      default:
        return 'bg-slate-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">Classroom Attendance & LMS Engagement Log</h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              87.5% Semester Average
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            56-day rolling biometric & LMS login frequency tracker
          </p>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
            <span>Late</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span>Absent</span>
          </div>
        </div>
      </div>

      {/* Grid Heatmap */}
      <div className="mt-4">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-2">
          {daysData.map((d) => (
            <div
              key={d.day}
              onMouseEnter={() => setHoveredDay(d)}
              onMouseLeave={() => setHoveredDay(null)}
              className={`w-4 h-4 rounded-sm transition-all cursor-pointer ${getColor(d.status)}`}
              title={`${d.date}: ${d.status}`}
            />
          ))}
        </div>

        {/* Dynamic Tooltip Bar */}
        <div className="mt-3 flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          {hoveredDay ? (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">{hoveredDay.date}:</span>
              <span className="capitalize font-semibold text-brand-600">{hoveredDay.status}</span>
              <span className="text-slate-400">({hoveredDay.course})</span>
            </div>
          ) : (
            <span className="text-slate-400">Hover over any day square to inspect lecture record</span>
          )}

          <div className="flex items-center gap-2 text-slate-600 font-semibold text-[11px]">
            <span>Present: <strong>52 sessions</strong></span>
            <span>·</span>
            <span className="text-rose-600">Absences: <strong>3 sessions</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

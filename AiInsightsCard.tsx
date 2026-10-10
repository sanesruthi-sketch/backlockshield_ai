import React from 'react';
import { AiRecommendation } from '../types';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Target, 
  BookOpen, 
  UserCheck, 
  FileQuestion,
  RefreshCw
} from 'lucide-react';

interface AiInsightsCardProps {
  recommendations: AiRecommendation[];
  onToggleComplete: (id: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const AiInsightsCard: React.FC<AiInsightsCardProps> = ({
  recommendations,
  onToggleComplete,
  onRefresh,
  isRefreshing,
}) => {
  const getActionIcon = (type: AiRecommendation['actionType']) => {
    switch (type) {
      case 'practice_quiz':
        return <FileQuestion className="w-4 h-4 text-violet-600" />;
      case 'mentor_meeting':
        return <UserCheck className="w-4 h-4 text-rose-600" />;
      case 'study_session':
        return <BookOpen className="w-4 h-4 text-brand-600" />;
      default:
        return <Target className="w-4 h-4 text-emerald-600" />;
    }
  };

  const completedCount = recommendations.filter(r => r.completed).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-100 text-violet-700">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">CampusIQ AI Early Warning & Action Engine</h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                {completedCount}/{recommendations.length} Done
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Targeted behavioral and academic interventions computed by ML retention model
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
          <span>{isRefreshing ? 'Analyzing...' : 'Recalculate'}</span>
        </button>
      </div>

      {/* Recommendations List */}
      <div className="flex flex-col gap-3 mt-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className={`p-4 rounded-xl border transition-all ${
              rec.completed
                ? 'bg-slate-50/60 border-slate-200/60 opacity-60'
                : rec.priority === 'urgent'
                ? 'bg-gradient-to-r from-rose-50/40 to-white border-rose-200/80 shadow-xs hover:border-rose-300'
                : 'bg-white border-slate-200 hover:border-brand-200 shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <button
                  onClick={() => onToggleComplete(rec.id)}
                  className={`mt-0.5 p-1 rounded-lg transition-colors cursor-pointer ${
                    rec.completed
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-slate-300 hover:text-brand-600 hover:bg-brand-50'
                  }`}
                  title={rec.completed ? 'Mark incomplete' : 'Mark completed'}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {rec.courseCode}
                    </span>
                    <h4
                      className={`text-sm font-bold ${
                        rec.completed ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {rec.title}
                    </h4>
                    {rec.priority === 'urgent' && !rec.completed && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        Urgent Action
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {rec.description}
                  </p>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px]">
                    <div className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>{rec.impactEstimate}</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{rec.estimatedTimeMinutes} mins</span>
                    </div>

                    <span className="text-slate-400">·</span>
                    <span className="text-slate-400">{rec.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {!rec.completed && (
                <button
                  onClick={() => onToggleComplete(rec.id)}
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors shrink-0 cursor-pointer"
                >
                  <span>Resolve</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

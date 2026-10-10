// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Award, 
  ArrowRight, 
  RefreshCw, 
  BrainCircuit,
  Sparkles
} from 'lucide-react';
import { QuizSessionData, QuizSubmitResult } from '../types';
import { startAdaptiveQuiz, submitAdaptiveQuiz } from '../services/api';

interface AdaptiveQuizModalProps {
  courseId: string | null;
  topicName: string | null;
  onClose: () => void;
  onMasteryUpdated?: () => void;
}

export const AdaptiveQuizModal: React.FC<AdaptiveQuizModalProps> = ({
  courseId,
  topicName,
  onClose,
  onMasteryUpdated,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [quizData, setQuizData] = useState<QuizSessionData | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizSubmitResult | null>(null);

  useEffect(() => {
    if (courseId && topicName) {
      loadQuiz();
    }
  }, [courseId, topicName]);

  const loadQuiz = async () => {
    if (!courseId || !topicName) return;
    setLoading(true);
    setResult(null);
    setSelectedAnswers({});
    try {
      const data = await startAdaptiveQuiz(courseId, topicName);
      setQuizData(data);
    } catch {
      // handled by fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionKey: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  };

  const handleSubmit = async () => {
    if (!quizData || !courseId || !topicName) return;
    setSubmitting(true);

    const submissions = quizData.questions.map((q) => ({
      question_id: q.id,
      selected_option: selectedAnswers[q.id] || 'A',
    }));

    try {
      const res = await submitAdaptiveQuiz(courseId, topicName, submissions);
      setResult(res);
      if (onMasteryUpdated) {
        onMasteryUpdated();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!courseId || !topicName) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-indigo-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-200/80 text-violet-800">
                  Adaptive Diagnostic
                </span>
                {quizData && (
                  <span className="text-xs text-slate-500 font-semibold">
                    {quizData.total_questions} Questions · {quizData.difficulty}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-base mt-0.5">{topicName}</h3>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin text-violet-600" />
              <p className="font-bold text-sm">Selecting optimal adaptive question bank...</p>
            </div>
          ) : result ? (
            /* Results View */
            <div className="space-y-5 animate-in fade-in">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">Evaluation Completed</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                    Score: {result.score_percent}% ({result.correct_answers}/{result.total_questions})
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 font-medium">{result.feedback}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-medium">Updated Mastery:</span>
                  <p className="text-xl font-extrabold text-brand-600">
                    {result.updated_mastery_percent !== null ? `${result.updated_mastery_percent}%` : 'Updated'}
                  </p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {result.mastery_status_label}
                  </span>
                </div>
              </div>

              {/* Question Breakdown with Explanations */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-xs">Question-by-Question Diagnostic Proofs:</h4>
                {result.questions_result.map((qr, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border ${
                      qr.is_correct ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {qr.is_correct ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-xs">{qr.question_text}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                          <span className={qr.is_correct ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                            Selected: Option {qr.selected_option}
                          </span>
                          {!qr.is_correct && (
                            <span className="text-emerald-700 font-bold">
                              Correct: Option {qr.correct_option}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-2 bg-white/70 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                          <strong>Theoretical Explanation:</strong> {qr.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : quizData ? (
            /* Active Question Runner */
            <div className="space-y-6">
              {quizData.questions.map((q, idx) => {
                const selected = selectedAnswers[q.id];
                return (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 text-xs leading-relaxed">
                        <span className="text-violet-600 mr-1.5 font-extrabold">Q{idx + 1}.</span>
                        {q.question_text}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-600 uppercase shrink-0">
                        {q.difficulty}
                      </span>
                    </div>

                    {/* Options A, B, C, D */}
                    <div className="space-y-2 mt-2">
                      {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                        const optText = q.options[optKey];
                        const isChosen = selected === optKey;
                        return (
                          <button
                            key={optKey}
                            onClick={() => handleSelectOption(q.id, optKey)}
                            className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                              isChosen
                                ? 'bg-violet-100/70 border-violet-400 text-violet-950 font-semibold shadow-xs'
                                : 'bg-white border-slate-200 hover:bg-slate-100/80 text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                isChosen ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {optKey}
                            </span>
                            <span className="text-xs leading-tight">{optText}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500">No questions found for this topic.</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          {result ? (
            <>
              <button
                onClick={loadQuiz}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-xs text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Retest Topic
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Done
              </button>
            </>
          ) : (
            <>
              <span className="text-[11px] text-slate-400">
                {Object.keys(selectedAnswers).length} of {quizData?.total_questions || 0} answered
              </span>
              <button
                onClick={handleSubmit}
                disabled={submitting || (quizData && Object.keys(selectedAnswers).length === 0)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-violet-500/20 transition-all cursor-pointer"
              >
                <span>{submitting ? 'Evaluating on Server...' : 'Submit Answers'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

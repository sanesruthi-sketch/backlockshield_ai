import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ArrowRight, 
  RefreshCw, 
  Zap, 
  Lightbulb, 
  CheckCircle2, 
  HelpCircle,
  X
} from 'lucide-react';
import { ChatMessage, StudentProfile } from '../types';
import { sendAiCopilotMessage } from '../services/api';

interface AiChatCopilotProps {
  student: StudentProfile;
  isOpenAsModal?: boolean;
  onCloseModal?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const AiChatCopilot: React.FC<AiChatCopilotProps> = ({
  student,
  isOpenAsModal = false,
  onCloseModal,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'ai',
      text: `Hello ${student.name}! I am **CampusIQ Copilot**, your dedicated AI academic advisor. I've analyzed your Spring 2026 course records, attendance logs, and quiz performances.\n\nYou have strong momentum in **AI-401 (Machine Learning)** and **CS-312 (Databases)**, but **MA-204 (Linear Algebra)** has been flagged as **Critical Risk** due to a 71% attendance rate and recent Singular Value Decomposition quizzes.\n\nWhat would you like to focus on today?`,
      timestamp: 'Just now',
      suggestions: [
        'How can I raise my GPA to 3.90?',
        'Why is MA-204 Linear Algebra flagged as critical?',
        'Check my attendance across all subjects',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendAiCopilotMessage(text.trim(), {
        studentName: student.name,
        currentGpa: student.cgpa,
        criticalCourses: ['MA-204 Linear Algebra'],
      });

      const aiMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        sender: 'ai',
        text: response.reply,
        timestamp: 'Just now',
        suggestions: response.suggestions,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'ai',
        text: 'Sorry, I encountered an issue processing your request. Please try again or inspect your backend connection.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Why is MA-204 Linear Algebra flagged as critical?',
    'How can I raise my GPA to 3.90?',
    'Check my attendance across all subjects',
    'What should I prioritize before Midterms?',
  ];

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col ${
        isOpenAsModal ? 'h-[85vh] max-h-[750px] w-full' : 'h-[650px] w-full'
      }`}
    >
      {/* Copilot Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-violet-50/50 to-indigo-50/50 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">CampusIQ Academic Copilot</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                GPT-4o Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Personalized Retention & Study Advisory Model
            </p>
          </div>
        </div>

        {isOpenAsModal && onCloseModal && (
          <button
            onClick={onCloseModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Message History */}
      <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${
              m.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-white text-xs ${
                m.sender === 'user'
                  ? 'bg-brand-600'
                  : 'bg-violet-600 shadow-xs shadow-violet-500/20'
              }`}
            >
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-4 leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-brand-600 text-white rounded-tr-none shadow-xs'
                  : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none shadow-xs'
              }`}
            >
              {/* Message Content with simple Markdown rendering */}
              <div className="whitespace-pre-line font-normal space-y-2">
                {m.text.split('\n\n').map((paragraph, idx) => {
                  return (
                    <p key={idx} className="leading-relaxed">
                      {paragraph.split('**').map((part, pIdx) =>
                        pIdx % 2 === 1 ? (
                          <strong key={pIdx} className={m.sender === 'user' ? 'font-bold text-white' : 'font-bold text-slate-950'}>
                            {part}
                          </strong>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  );
                })}
              </div>

              {/* Suggestions chips */}
              {m.suggestions && m.suggestions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                  <p className="w-full text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Suggested Next Steps
                  </p>
                  {m.suggestions.map((s, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSend(s)}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white hover:bg-violet-50 text-violet-700 border border-violet-200 hover:border-violet-300 transition-all text-left flex items-center gap-1 cursor-pointer"
                    >
                      <span>{s}</span>
                      <ArrowRight className="w-3 h-3 text-violet-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2 text-slate-500">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-600" />
              <span className="text-xs font-medium">CampusIQ is evaluating student model & generating response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips (Quick access) */}
      <div className="px-4 py-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto bg-slate-50/50">
        <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
          Quick Prompts:
        </span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-brand-600 hover:border-brand-200 shrink-0 transition-colors cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3.5 border-t border-slate-100 flex items-center gap-2 bg-white rounded-b-2xl"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about grades, risk predictions, study plans..."
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold transition-all shadow-md shadow-violet-500/20 cursor-pointer"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

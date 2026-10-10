// @ts-nocheck
import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Calendar, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  ChevronDown,
  LogOut,
  UserCheck
} from 'lucide-react';
import { StudentProfile, BackendHealth, UserRole } from '../types';

interface HeaderProps {
  student: StudentProfile;
  userRole: UserRole;
  backendHealth: BackendHealth;
  onOpenCopilot: () => void;
  onOpenBackendModal: () => void;
  onSearchClick: () => void;
  onOpenLoginModal: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  student,
  userRole,
  backendHealth,
  onOpenCopilot,
  onOpenBackendModal,
  onSearchClick,
  onOpenLoginModal,
  onSignOut,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const mockNotifications = [
    {
      id: 1,
      type: 'warning',
      title: 'MA-204 Linear Algebra Attendance Alert',
      message: 'Attendance dropped to 71.0%. Below institutional 75% threshold.',
      time: '10m ago',
      unread: true,
    },
    {
      id: 2,
      type: 'success',
      title: 'Digital Learning Twin Updated',
      message: 'Gaussian Elimination mastery confirmed at 85.0% (Provisional Mastery).',
      time: '2h ago',
      unread: false,
    },
  ];

  const unreadCount = mockNotifications.filter(n => n.unread).length;

  const getUserDisplayName = () => {
    if (userRole === 'admin') return 'Dean Jonathan Hayes';
    if (userRole === 'faculty') return 'Dr. Evelyn Vance';
    return student.name;
  };

  const getUserSubtitle = () => {
    if (userRole === 'admin') return 'Institutional Administrator';
    if (userRole === 'faculty') return 'Faculty Academic Advisor';
    return `${student.rollNo} · ${student.major.split('&')[0]}`;
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 px-6 sm:px-8 flex items-center justify-between transition-all">
      {/* Left: Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onSearchClick}
          className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-slate-100/70 hover:bg-slate-100 border border-slate-200/60 text-slate-400 hover:text-slate-600 transition-all text-xs sm:text-sm group cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
            <span className="text-slate-500 font-medium">Search courses, topics, risk predictions, or ask AI...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 rounded-md">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Controls & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Backend status pill */}
        <button
          onClick={onOpenBackendModal}
          title="Click to inspect Python FastAPI endpoints"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            backendHealth.status === 'online'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              backendHealth.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="hidden md:inline">
            {backendHealth.status === 'online' ? 'FastAPI Connected' : 'Demo Mode (Offline)'}
          </span>
        </button>

        {/* Quick Copilot Trigger Button */}
        {userRole === 'student' && (
          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-700 hover:to-violet-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-200" />
            <span className="hidden sm:inline">Ask AI Advisor</span>
          </button>
        )}

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-bold text-xs text-slate-800">Alerts & System Notifications</h4>
                <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-2 mt-3 max-h-72 overflow-y-auto text-xs">
                {mockNotifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">{n.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{n.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Chip */}
        <div 
          onClick={onOpenLoginModal}
          className="flex items-center gap-2.5 pl-2 border-l border-slate-200 cursor-pointer group"
          title="Click to Switch Demo Account"
        >
          <div className="relative">
            <img
              src={student.avatar}
              alt="User"
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-brand-100 shadow-2xs group-hover:ring-brand-300 transition-all"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900 leading-tight group-hover:text-brand-600 transition-colors">
              {getUserDisplayName()}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              {userRole} · {getUserSubtitle()}
            </span>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={onSignOut || onOpenLoginModal}
          title="Sign out of active session"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

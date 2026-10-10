import React, { useState } from 'react';
import { 
  X, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Code2, 
  Terminal, 
  ExternalLink,
  Zap,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { BackendHealth } from '../types';
import { checkBackendHealth, setForceMockMode, getForceMockMode } from '../services/api';

interface BackendStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  backendHealth: BackendHealth;
  onRefreshHealth: () => void;
}

export const BackendStatusModal: React.FC<BackendStatusModalProps> = ({
  isOpen,
  onClose,
  backendHealth,
  onRefreshHealth,
}) => {
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);
  const [endpointResponse, setEndpointResponse] = useState<any | null>(null);
  const [isForcedMock, setIsForcedMockState] = useState<boolean>(getForceMockMode());

  if (!isOpen) return null;

  const handleToggleMock = () => {
    const nextVal = !isForcedMock;
    setIsForcedMockState(nextVal);
    setForceMockMode(nextVal);
    onRefreshHealth();
  };

  const testEndpoint = async (path: string) => {
    setTestingEndpoint(path);
    try {
      const res = await fetch(`/api/v1${path}`);
      if (res.ok) {
        const json = await res.json();
        setEndpointResponse({ status: res.status, ok: true, data: json });
      } else {
        setEndpointResponse({ status: res.status, ok: false, error: 'Endpoint returned error' });
      }
    } catch (e: any) {
      setEndpointResponse({
        status: 0,
        ok: false,
        error: `Could not reach /api/v1${path}. Running mock fallback.`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Python FastAPI Backend Integration</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                CampusIQ Architecture Bridge & Endpoint Diagnostics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Status Box */}
          <div
            className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
              backendHealth.status === 'online'
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/60 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-start gap-3">
              {backendHealth.status === 'online' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm">
                    {backendHealth.status === 'online'
                      ? 'FastAPI Server Connected'
                      : 'Standalone High-Fidelity Demo Mode'}
                  </h4>
                  {backendHealth.responseTimeMs && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200">
                      {backendHealth.responseTimeMs}ms ping
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {backendHealth.message}
                </p>
              </div>
            </div>

            <button
              onClick={onRefreshHealth}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-brand-600 transition-colors shrink-0 shadow-2xs cursor-pointer"
              title="Ping Backend"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 text-xs">Force Standalone Demo Mode</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Disable live network calls to FastAPI and run 100% on high-fidelity local student data
              </p>
            </div>
            <button
              onClick={handleToggleMock}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              {isForcedMock ? (
                <>
                  <ToggleRight className="w-5 h-5 text-brand-600" />
                  <span className="text-brand-600 font-bold">Enabled</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-500">Live API</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Endpoint Tester */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs mb-2">Live FastAPI Endpoint Tester</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Health Check', path: '/health' },
                { label: 'Student Profile', path: '/students/me' },
                { label: 'Courses Matrix', path: '/courses' },
                { label: 'ML Recommendations', path: '/recommendations' },
              ].map((ep) => (
                <button
                  key={ep.path}
                  onClick={() => testEndpoint(ep.path)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 font-mono text-[11px] text-slate-700 transition-colors border border-transparent hover:border-brand-200 text-center cursor-pointer"
                >
                  {ep.label}
                </button>
              ))}
            </div>

            {endpointResponse && (
              <div className="mt-3 p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800">
                <div className="flex items-center justify-between pb-1 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
                  <span>Endpoint: /api/v1{testingEndpoint}</span>
                  <span>HTTP {endpointResponse.status}</span>
                </div>
                <pre>{JSON.stringify(endpointResponse.data || endpointResponse.error, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Python Backend Setup Instructions */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-brand-600" />
              <span>How to launch the Python FastAPI Backend</span>
            </h4>
            <div className="bg-slate-900 rounded-xl p-3.5 text-slate-200 font-mono text-xs space-y-1.5 border border-slate-800">
              <p className="text-slate-400"># 1. Install FastAPI & Uvicorn</p>
              <p className="text-emerald-400">pip install fastapi uvicorn</p>
              <p className="text-slate-400 mt-2"># 2. Start backend server at port 8000</p>
              <p className="text-emerald-400">uvicorn backend.main:app --reload --port 8000</p>
            </div>
            <p className="text-[11px] text-slate-500">
              The project comes pre-configured with <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">backend/main.py</code> serving all CampusIQ endpoints!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

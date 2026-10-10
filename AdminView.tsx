// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { CSVPreviewData, AuditEventItem, AdminUserItem } from '../types';
import { 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  RefreshCw,
  Users,
  History,
  Database,
  ArrowRight
} from 'lucide-react';
import { previewCsvFile, commitCsvImport, fetchAuditEvents, fetchAdminUsers } from '../services/api';

interface AdminViewProps {
  initialTab?: string;
}

export const AdminView: React.FC<AdminViewProps> = ({ initialTab }) => {
  const [activeTab, setActiveTab] = useState<'csv' | 'users' | 'audit'>('csv');
  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [committing, setCommitting] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<CSVPreviewData | null>(null);
  const [commitMessage, setCommitMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEventItem[]>([]);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loadingAudits, setLoadingAudits] = useState<boolean>(false);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  useEffect(() => {
    if (initialTab === 'admin-users' || initialTab === 'users') {
      setActiveTab('users');
    } else if (initialTab === 'admin-audit' || initialTab === 'audit') {
      setActiveTab('audit');
    } else if (initialTab === 'admin-csv' || initialTab === 'csv') {
      setActiveTab('csv');
    }
  }, [initialTab]);

  useEffect(() => {
    loadAudits();
    loadUsers();
  }, []);

  const loadAudits = async () => {
    setLoadingAudits(true);
    try {
      const data = await fetchAuditEvents();
      setAuditEvents(data || []);
    } catch (err: any) {
      console.error('Failed to load audit events:', err);
    } finally {
      setLoadingAudits(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await fetchAdminUsers();
      setUsers(data || []);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingFile(true);
    setCommitMessage(null);
    setErrorMessage(null);

    try {
      const result = await previewCsvFile(file);
      setPreviewData(result);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to parse CSV file. Please verify column headers.');
      setPreviewData(null);
    } finally {
      setLoadingFile(false);
      // Reset input value so the same file can be re-selected if modified
      e.target.value = '';
    }
  };

  const handleCommit = async () => {
    if (!previewData || previewData.valid_rows.length === 0) return;
    setCommitting(true);
    setErrorMessage(null);
    setCommitMessage(null);

    try {
      const success = await commitCsvImport(previewData.valid_rows);
      if (success) {
        setCommitMessage(
          `Successfully committed ${previewData.valid_rows.length} verified student records into the institutional database.`
        );
        setPreviewData(null);
        await loadAudits();
      } else {
        setErrorMessage('Import failed. Transaction was safely rolled back with zero changes.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Database error occurred during commit. Transaction was safely rolled back.');
    } finally {
      setCommitting(false);
    }
  };

  const handleDownloadSample = () => {
    const csvContent = `roll_number,full_name,email,department,semester,cgpa,attendance_percent,avg_grade_percent
23CS012,Marcus Vance,m.vance@campus.edu,Computer Science,Semester 6,2.65,62.4,58.2
23CS035,Sophia Patel,s.patel@campus.edu,Computer Science,Semester 6,2.90,69.1,64.0
23CS048,Alex Rivera,a.rivera@campus.edu,Computer Science,Semester 6,3.78,87.5,85.2
23CS051,Liam Chen,l.chen@campus.edu,Computer Science,Semester 6,3.15,74.0,73.5
23CS019,Emma Watson,e.watson@campus.edu,Computer Science,Semester 6,3.95,96.0,94.8
23CS077,Jordan Taylor,j.taylor@campus.edu,Computer Science,Semester 6,3.82,93.5,91.2
23CS099,David Kim,d.kim@campus.edu,Computer Science,Semester 6,3.65,88.0,84.5`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_students.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-bold tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Administrative Control Tier · Institutional Governance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
              Institutional Administration & Data Quality
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Verify pre-commit CSV data quality, audit institutional modifications, and manage role-based authorization parameters.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSample}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs text-xs font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('csv')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'csv' ? 'bg-indigo-50 text-indigo-700 shadow-sm font-extrabold' : 'hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4 text-indigo-600" />
          <span>CSV Data Quality & Ingestion</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'users' ? 'bg-indigo-50 text-indigo-700 shadow-sm font-extrabold' : 'hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-600" />
          <span>Institutional Roles ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'audit' ? 'bg-indigo-50 text-indigo-700 shadow-sm font-extrabold' : 'hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4 text-indigo-600" />
          <span>Audit Log Events ({auditEvents.length})</span>
        </button>
      </div>

      {/* TAB 1: CSV DATA QUALITY */}
      {activeTab === 'csv' && (
        <div className="space-y-5">
          {commitMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 text-xs font-bold transition-all">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{commitMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3 text-xs font-bold transition-all">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Upload Area */}
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-8 text-center hover:border-indigo-400 transition-colors">
            <input
              type="file"
              accept=".csv"
              id="csvFileInput"
              className="hidden"
              onChange={handleFileUpload}
            />
            <label htmlFor="csvFileInput" className="cursor-pointer flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {loadingFile ? 'Validating CSV Schema...' : 'Click to Upload Student Telemetry CSV'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Validates required columns, ranges (CGPA 0.0–4.0, Attendance 0.0–100.0%), and detects duplicate roll numbers prior to commit.
                </p>
              </div>
            </label>
          </div>

          {/* Preview Results */}
          {previewData && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Pre-Commit Validation Results</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    File: <strong className="text-slate-700">{previewData.filename}</strong> · Total Rows: {previewData.total_rows}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    {previewData.valid_count} Valid Rows
                  </span>
                  {previewData.invalid_count > 0 && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
                      {previewData.invalid_count} Invalid Rows
                    </span>
                  )}
                </div>
              </div>

              {/* Row Errors Table */}
              {previewData.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-rose-700 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Row-by-Row Data Quality Errors (Excluded from Commit):</span>
                  </h4>
                  <div className="border border-rose-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-rose-50 text-rose-900 font-bold">
                        <tr>
                          <th className="p-2.5">Row #</th>
                          <th className="p-2.5">Column</th>
                          <th className="p-2.5">Provided Value</th>
                          <th className="p-2.5">Validation Failure Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-100 text-slate-700">
                        {previewData.errors.map((err, i) => (
                          <tr key={i} className="hover:bg-rose-50/40">
                            <td className="p-2.5 font-mono font-bold text-rose-600">Row {err.row}</td>
                            <td className="p-2.5 font-semibold text-slate-800">{err.column}</td>
                            <td className="p-2.5 font-mono text-slate-500">
                              {err.value !== undefined && err.value !== null && String(err.value).trim() !== '' 
                                ? String(err.value) 
                                : <span className="text-slate-400 italic">(empty)</span>}
                            </td>
                            <td className="p-2.5 text-rose-700 font-medium">{err.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Valid Rows Preview */}
              {previewData.valid_rows && previewData.valid_rows.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-emerald-800 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Valid Records Ready to Import ({previewData.valid_count}):</span>
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-600 font-bold">
                        <tr>
                          <th className="p-2.5">Roll No</th>
                          <th className="p-2.5">Full Name</th>
                          <th className="p-2.5">Email</th>
                          <th className="p-2.5">Department</th>
                          <th className="p-2.5">CGPA</th>
                          <th className="p-2.5">Attendance</th>
                          <th className="p-2.5">Avg Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {previewData.valid_rows.map((row: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2.5 font-mono font-bold text-slate-800">{row.roll_number}</td>
                            <td className="p-2.5 font-semibold">{row.full_name}</td>
                            <td className="p-2.5 font-mono text-slate-500">{row.email}</td>
                            <td className="p-2.5">{row.department}</td>
                            <td className="p-2.5 font-bold text-indigo-600">{row.cgpa}</td>
                            <td className="p-2.5">{row.attendance_percent}%</td>
                            <td className="p-2.5">{row.avg_grade_percent}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Commit Action */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">
                  {previewData.valid_count} records ready for transactional commit into database.
                </span>
                <button
                  onClick={handleCommit}
                  disabled={committing || previewData.valid_count === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  <span>{committing ? 'Committing...' : `Commit ${previewData.valid_count} Valid Records`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USERS AND ROLES */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Authorized Institutional User Accounts</h3>
              <p className="text-xs text-slate-500 mt-0.5">Role-based access credentials configured in database</p>
            </div>
            <button
              onClick={loadUsers}
              disabled={loadingUsers}
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Refresh User List"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">Full Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">System Role</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((u, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-900">{u.name || u.full_name}</td>
                  <td className="p-4 font-mono text-slate-500">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      u.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : u.role === 'faculty' 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-emerald-600 font-semibold">{u.status || 'Active'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Institutional Audit Trail</h3>
              <p className="text-xs text-slate-500 mt-0.5">Chronological record of sensitive administrative commits</p>
            </div>
            <button
              onClick={loadAudits}
              disabled={loadingAudits}
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Refresh Audit Trail"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAudits ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {auditEvents.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No audit events recorded yet.
              </div>
            ) : (
              auditEvents.map((ev) => (
                <div key={ev.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {ev.action}
                      </span>
                      <span className="text-xs text-slate-400">Actor: {ev.actor_email || 'System'}</span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1 font-medium">{ev.details}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">{ev.created_at}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

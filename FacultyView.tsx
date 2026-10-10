// @ts-nocheck
import React, { useState } from 'react';
import { FacultyCohortStudent, RiskLevel, InterventionRecord } from '../types';
import { 
  Users, 
  AlertTriangle, 
  ShieldAlert, 
  Search, 
  Mail, 
  Download, 
  Filter, 
  UserCheck, 
  CheckCircle2, 
  Plus,
  X,
  Calendar,
  FileText
} from 'lucide-react';
import { createFacultyIntervention, fetchInterventions } from '../services/api';

interface FacultyViewProps {
  cohort: FacultyCohortStudent[];
}

export const FacultyView: React.FC<FacultyViewProps> = ({ cohort }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'all' | RiskLevel>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Intervention Modal State
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [selectedStudentForIntervention, setSelectedStudentForIntervention] = useState<FacultyCohortStudent | null>(null);
  const [interventionAction, setInterventionAction] = useState('Tutoring Referral (Peer Assisted Study)');
  const [interventionNotes, setInterventionNotes] = useState('');
  const [interventionFollowUp, setInterventionFollowUp] = useState('Within 7 Days');
  const [interventionsList, setInterventionsList] = useState<InterventionRecord[]>([]);

  const filteredStudents = cohort.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk =
      selectedRiskFilter === 'all' || student.riskLevel === selectedRiskFilter;
    return matchesSearch && matchesRisk;
  });

  const criticalCount = cohort.filter((s) => s.riskLevel === 'critical').length;
  const moderateCount = cohort.filter((s) => s.riskLevel === 'moderate').length;
  const lowCount = cohort.filter((s) => s.riskLevel === 'low').length;

  const handleOpenIntervention = (student: FacultyCohortStudent) => {
    setSelectedStudentForIntervention(student);
    setInterventionNotes(`Targeted support action initiated for ${student.name} (${student.rollNo}) due to ${student.flags.join(', ')}.`);
    setIsInterventionModalOpen(true);
  };

  const handleSaveIntervention = async () => {
    if (!selectedStudentForIntervention) return;
    await createFacultyIntervention(
      selectedStudentForIntervention.id,
      interventionAction,
      interventionNotes,
      interventionFollowUp
    );
    setActionNotice(`Institutional Intervention created & recorded for ${selectedStudentForIntervention.name}!`);
    setIsInterventionModalOpen(false);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const exportReport = () => {
    // Generate CSV
    const headers = "roll_number,full_name,department,attendance_percent,avg_grade,risk_score,risk_level\n";
    const rows = cohort.map(s => `${s.rollNo},"${s.name}","${s.major}",${s.attendance},${s.avgGrade},${s.riskScore},${s.riskLevel}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campusiq_cohort_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setActionNotice('CampusIQ Retention Analytics Report exported as CSV.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-white hover:text-emerald-100 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Cohort KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cohort Enrolled</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{cohort.length} Students</h3>
          <p className="text-xs text-slate-400 mt-0.5">CS Department · Class of 2026</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Critical At-Risk</span>
          <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{criticalCount} Students</h3>
          <p className="text-xs text-slate-400 mt-0.5">Immediate intervention required</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Moderate Watch</span>
          <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{moderateCount} Students</h3>
          <p className="text-xs text-slate-400 mt-0.5">Attendance or quiz deficit</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">On Track</span>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{lowCount} Students</h3>
          <p className="text-xs text-slate-400 mt-0.5">Dean's Honor Roll trajectory</p>
        </div>
      </div>

      {/* Cohort Table & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student by name or roll number..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-bold text-slate-600">
              <button
                onClick={() => setSelectedRiskFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedRiskFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                All ({cohort.length})
              </button>
              <button
                onClick={() => setSelectedRiskFilter('critical')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedRiskFilter === 'critical' ? 'bg-white text-rose-700 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Critical ({criticalCount})
              </button>
              <button
                onClick={() => setSelectedRiskFilter('moderate')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedRiskFilter === 'moderate' ? 'bg-white text-amber-700 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Moderate ({moderateCount})
              </button>
            </div>

            <button
              onClick={exportReport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-5">Student</th>
                <th className="py-3 px-4">AI Risk Score</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Average Grade</th>
                <th className="py-3 px-4">Contributing Telemetry Flags</th>
                <th className="py-3 px-5 text-right">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{student.name}</h4>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {student.rollNo} · {student.major}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-extrabold ${
                          student.riskLevel === 'critical'
                            ? 'text-rose-600'
                            : student.riskLevel === 'moderate'
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {student.riskScore}%
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          student.riskLevel === 'critical'
                            ? 'bg-rose-100 text-rose-700'
                            : student.riskLevel === 'moderate'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {student.riskLevel}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-semibold text-slate-700">
                    <span className={student.attendance < 75 ? 'text-rose-600 font-bold' : ''}>
                      {student.attendance}%
                    </span>
                    {student.attendance < 75 && (
                      <span className="text-[10px] ml-1 text-rose-600 font-bold">(&lt;75%)</span>
                    )}
                  </td>

                  <td className="py-4 px-4 font-semibold text-slate-700">
                    <span>{student.avgGrade}%</span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {student.flags.map((flag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => handleOpenIntervention(student)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Intervene</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Intervention Creation Modal */}
      {isInterventionModalOpen && selectedStudentForIntervention && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div 
            className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Create Faculty Support Action</h3>
                <p className="text-xs text-slate-500">Student: {selectedStudentForIntervention.name} ({selectedStudentForIntervention.rollNo})</p>
              </div>
              <button onClick={() => setIsInterventionModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">Intervention Action</label>
                <select
                  value={interventionAction}
                  onChange={(e) => setInterventionAction(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800"
                >
                  <option value="Tutoring Referral (Peer Assisted Study)">Tutoring Referral (Peer Assisted Study)</option>
                  <option value="Attendance Warning & Institutional Counseling">Attendance Warning & Institutional Counseling</option>
                  <option value="Topic-Specific Practice (Digital Twin Remediation)">Topic-Specific Practice (Digital Twin Remediation)</option>
                  <option value="Makeup Evaluation Authorization">Makeup Evaluation Authorization</option>
                  <option value="Academic Counselor Direct Referral">Academic Counselor Direct Referral</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Follow-Up Target Date</label>
                <input
                  type="text"
                  value={interventionFollowUp}
                  onChange={(e) => setInterventionFollowUp(e.target.value)}
                  placeholder="e.g. March 25, 2026"
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Advisor Case Notes</label>
                <textarea
                  rows={3}
                  value={interventionNotes}
                  onChange={(e) => setInterventionNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsInterventionModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveIntervention}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20"
              >
                Record Intervention
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

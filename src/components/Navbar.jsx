import React, { useState, useEffect } from 'react';
import { ShieldCheck, GraduationCap, Users, Cloud, Activity, Building2, LogOut } from 'lucide-react';

export default function Navbar({ 
  currentRole = 'HOME', 
  onRoleChange = () => {}, 
  blockchainHeight = 0, 
  isChainValid = true, 
  activeStudent = null, 
  onStudentChange = () => {}, 
  students = [] 
}) {
  const [syncStatus, setSyncStatus] = useState('SYNCED');

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus('SYNCING');
      setTimeout(() => setSyncStatus('SYNCED'), 1200);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-sm">
      
      {/* Institutional Top Bar */}
      <div className="bg-sky-900 px-4 py-1.5 text-[11px] font-mono text-sky-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="flex items-center gap-2 text-white font-semibold tracking-wide">
            <Building2 className="w-3.5 h-3.5 text-sky-300" /> Department of Information Science & Engineering (ISE) • MCE Hassan
          </span>
          <span className="hidden sm:inline-block text-sky-200">
            Smart Attendance System 2025-26 • Blockchain & Cloud Campus Platform
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-3">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onRoleChange('HOME')}>
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-extrabold shadow-md flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl text-slate-900 tracking-tight">
                Block<span className="text-sky-600">Attend</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 border border-sky-200 text-sky-700 font-mono text-[10px] font-bold">
                ISE 2025-26
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Smart Attendance & Blockchain Ledger</p>
          </div>
        </div>

        {/* Strictly Isolated Portal Nav Tab */}
        {currentRole !== 'HOME' && (
          <div className="hidden md:flex items-center p-1 rounded-xl bg-sky-50 border border-sky-100">
            {currentRole === 'STUDENT' && (
              <span className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-sky-600 text-white shadow-sm">
                <GraduationCap className="w-4 h-4" /> Student Authorized Portal
              </span>
            )}

            {currentRole === 'TEACHER' && (
              <span className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-sky-600 text-white shadow-sm">
                <Users className="w-4 h-4" /> Faculty Authorized Portal
              </span>
            )}

            {currentRole === 'ADMIN' && (
              <span className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-sky-600 text-white shadow-sm">
                <ShieldCheck className="w-4 h-4" /> Administrator CRM & Auditor
              </span>
            )}
          </div>
        )}

        {/* Status Pills */}
        <div className="flex items-center space-x-3">
          
          {currentRole === 'STUDENT' && (
            <select
              value={activeStudent?.id || ''}
              onChange={(e) => onStudentChange(students.find(s => s.id === e.target.value))}
              className="px-3 py-1.5 rounded-lg glass-input text-xs font-semibold text-slate-800 cursor-pointer bg-white border border-sky-200"
            >
              {(students || []).map(s => (
                <option key={s.id} value={s.id} className="bg-white text-slate-900">
                  👤 {s.name} ({s.rollNumber})
                </option>
              ))}
            </select>
          )}

          {/* Firebase Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-100 text-[11px] font-mono">
            <Cloud className={`w-3.5 h-3.5 ${syncStatus === 'SYNCING' ? 'text-amber-500 animate-spin' : 'text-emerald-600'}`} />
            <span className="text-sky-800">Firebase:</span>
            <span className={syncStatus === 'SYNCING' ? 'text-amber-600 font-bold' : 'text-emerald-700 font-bold'}>
              {syncStatus === 'SYNCING' ? 'Syncing...' : 'Connected'}
            </span>
          </div>

          {/* Blockchain Node Status Pill */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-mono font-semibold ${
            isChainValid 
              ? 'bg-sky-50 border-sky-200 text-sky-800'
              : 'bg-rose-50 border-rose-300 text-rose-800 animate-pulse'
          }`}>
            <Activity className="w-3.5 h-3.5 text-sky-600" />
            <span>Block #{blockchainHeight}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{isChainValid ? 'SHA-256 Validated' : 'Ledger Tampered!'}</span>
          </div>

          {currentRole !== 'HOME' && (
            <button
              onClick={() => onRoleChange('HOME')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 transition-all text-xs shadow-sm"
              title="Sign Out to Gateway"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          )}

        </div>

      </div>
    </header>
  );
}

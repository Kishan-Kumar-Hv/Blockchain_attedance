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
      <div className="bg-sky-900 px-3 sm:px-4 py-1.5 text-[10px] sm:text-[11px] font-mono text-sky-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-white font-semibold truncate">
            <Building2 className="w-3.5 h-3.5 text-sky-300 shrink-0" /> 
            <span className="truncate">Dept. of ISE • MCE Hassan</span>
          </span>
          <span className="hidden sm:inline-block text-sky-200 shrink-0">
            Smart Attendance System 2025-26 • Blockchain Node
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between py-2.5 sm:py-3 gap-2">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer shrink-0" onClick={() => onRoleChange('HOME')}>
          <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-extrabold shadow-md flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-extrabold text-base sm:text-xl text-slate-900 tracking-tight">
                Block<span className="text-sky-600">Attend</span>
              </h1>
              <span className="hidden xs:inline-block px-2 py-0.5 rounded-full bg-sky-100 border border-sky-200 text-sky-700 font-mono text-[9px] sm:text-[10px] font-bold">
                ISE 2025-26
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden sm:block">Smart Attendance & Blockchain</p>
          </div>
        </div>

        {/* Portal Role Badge */}
        {currentRole !== 'HOME' && (
          <div className="hidden md:flex items-center p-1 rounded-xl bg-sky-50 border border-sky-100">
            {currentRole === 'STUDENT' && (
              <span className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold bg-sky-600 text-white shadow-sm">
                <GraduationCap className="w-4 h-4" /> Student Portal
              </span>
            )}

            {currentRole === 'TEACHER' && (
              <span className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold bg-sky-600 text-white shadow-sm">
                <Users className="w-4 h-4" /> Faculty Portal
              </span>
            )}

            {currentRole === 'ADMIN' && (
              <span className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold bg-sky-600 text-white shadow-sm">
                <ShieldCheck className="w-4 h-4" /> Admin CRM
              </span>
            )}
          </div>
        )}

        {/* Status & Actions Bar */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {currentRole === 'STUDENT' && students && students.length > 0 && (
            <select
              value={activeStudent?.id || ''}
              onChange={(e) => onStudentChange(students.find(s => s.id === e.target.value))}
              className="max-w-[130px] sm:max-w-[180px] px-2 sm:px-3 py-1.5 rounded-lg glass-input text-xs font-semibold text-slate-800 cursor-pointer bg-white border border-sky-200 truncate"
            >
              {students.map(s => (
                <option key={s.id} value={s.id} className="bg-white text-slate-900">
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {/* Firebase Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-50 border border-sky-100 text-[11px] font-mono">
            <Cloud className={`w-3.5 h-3.5 ${syncStatus === 'SYNCING' ? 'text-amber-500 animate-spin' : 'text-emerald-600'}`} />
            <span className="text-sky-800">Cloud:</span>
            <span className={syncStatus === 'SYNCING' ? 'text-amber-600 font-bold' : 'text-emerald-700 font-bold'}>
              {syncStatus === 'SYNCING' ? 'Syncing' : 'Live'}
            </span>
          </div>

          {/* Blockchain Node Status Pill */}
          <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg border text-[10px] sm:text-[11px] font-mono font-semibold ${
            isChainValid 
              ? 'bg-sky-50 border-sky-200 text-sky-800'
              : 'bg-rose-50 border-rose-300 text-rose-800 animate-pulse'
          }`}>
            <Activity className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="hidden xs:inline">Block</span>
            <span>#{blockchainHeight}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          </div>

          {currentRole !== 'HOME' && (
            <button
              onClick={() => onRoleChange('HOME')}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 transition-all text-xs shadow-sm shrink-0"
              title="Sign Out to Gateway"
            >
              <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}

import React, { useState } from 'react';
import { ShieldCheck, GraduationCap, Users, Lock, Key, ArrowRight, Building2, CheckCircle2, ShieldAlert, Sparkles, UserPlus } from 'lucide-react';

export default function HomePortalGateway({ onLogin = () => {}, students = [], teachers = [] }) {
  const safeStudents = students && students.length > 0 ? students : [];
  const safeTeachers = teachers && teachers.length > 0 ? teachers : [];

  // Default to ADMIN if no students or faculty exist
  const [selectedPortal, setSelectedPortal] = useState(() => {
    if (safeStudents.length > 0) return 'STUDENT';
    if (safeTeachers.length > 0) return 'TEACHER';
    return 'ADMIN';
  });

  const [studentId, setStudentId] = useState(safeStudents[0]?.id || '');
  const [studentPassword, setStudentPassword] = useState(safeStudents[0]?.password || '');

  const [teacherId, setTeacherId] = useState(safeTeachers[0]?.id || '');
  const [teacherPassword, setTeacherPassword] = useState(safeTeachers[0]?.password || '');

  const [adminCode, setAdminCode] = useState('ADM-ISE-2026');
  const [adminPassword, setAdminPassword] = useState('admin123');

  const [error, setError] = useState('');

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (safeStudents.length === 0) {
      setError('No students registered yet. Please log in as Admin to add students.');
      return;
    }
    const found = safeStudents.find(s => s.id === studentId || s.rollNumber === studentId);
    if (!found) {
      setError('Invalid Student Roll Number / ID');
      return;
    }
    if (found.password && studentPassword !== found.password) {
      setError('Incorrect password credential.');
      return;
    }
    setError('');
    onLogin({ role: 'STUDENT', user: found });
  };

  const handleTeacherSubmit = (e) => {
    e.preventDefault();
    if (safeTeachers.length === 0) {
      setError('No faculty registered yet. Please log in as Admin to add teachers.');
      return;
    }
    const found = safeTeachers.find(t => t.id === teacherId);
    if (!found) {
      setError('Invalid Faculty ID');
      return;
    }
    if (found.password && teacherPassword !== found.password) {
      setError('Incorrect password credential.');
      return;
    }
    setError('');
    onLogin({ role: 'TEACHER', user: found });
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    if (!adminCode.trim()) {
      setError('Please enter valid Admin Master Passcode');
      return;
    }
    if (adminPassword !== 'admin123') {
      setError('Incorrect Admin security key password.');
      return;
    }
    setError('');
    onLogin({ role: 'ADMIN', user: { name: 'System Administrator', department: 'ISE Dept. MCE Hassan' } });
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-10 px-4 animate-fadeIn">
      
      {/* Title */}
      <div className="text-center max-w-3xl space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-800 text-xs font-mono font-semibold">
          <Building2 className="w-3.5 h-3.5 text-sky-600" /> Dept. of Information Science & Engineering (ISE) • MCE Hassan
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Smart Attendance & Blockchain Portal
        </h1>

        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed font-normal">
          Select your institutional portal role below to authenticate via Web3 SHA-256 Cryptographic Access.
        </p>
      </div>

      {/* 3 Centered Portal Cards */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* CARD 1: Student */}
        <div 
          onClick={() => setSelectedPortal('STUDENT')}
          className={`cursor-pointer rounded-2xl p-6 border transition-all flex flex-col justify-between ${
            selectedPortal === 'STUDENT'
              ? 'bg-white border-sky-500 shadow-xl ring-2 ring-sky-400/30 scale-[1.02]'
              : 'bg-white/80 border-sky-100 hover:border-sky-300 shadow-sm hover:shadow-md'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${selectedPortal === 'STUDENT' ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white' : 'bg-sky-50 text-sky-700 border border-sky-100'}`}>
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono text-sky-800 bg-sky-100 px-2 py-0.5 rounded border border-sky-200 font-bold">
                PORTAL #01
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Student Portal</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Scan dynamic classroom QR codes (5-min validity & 50m geofence), perform AI face scans, and view ledger history.
            </p>
          </div>

          <div className="pt-3 border-t border-sky-100 flex items-center justify-between text-xs font-bold">
            <span className={selectedPortal === 'STUDENT' ? 'text-sky-700' : 'text-slate-500'}>
              {safeStudents.length === 0 ? '0 Enrolled' : `${safeStudents.length} Active Students`}
            </span>
            <ArrowRight className={`w-4 h-4 ${selectedPortal === 'STUDENT' ? 'text-sky-600 translate-x-1' : 'text-slate-400'} transition-transform`} />
          </div>
        </div>

        {/* CARD 2: Teacher */}
        <div 
          onClick={() => setSelectedPortal('TEACHER')}
          className={`cursor-pointer rounded-2xl p-6 border transition-all flex flex-col justify-between ${
            selectedPortal === 'TEACHER'
              ? 'bg-white border-sky-500 shadow-xl ring-2 ring-sky-400/30 scale-[1.02]'
              : 'bg-white/80 border-sky-100 hover:border-sky-300 shadow-sm hover:shadow-md'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${selectedPortal === 'TEACHER' ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white' : 'bg-sky-50 text-sky-700 border border-sky-100'}`}>
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono text-sky-800 bg-sky-100 px-2 py-0.5 rounded border border-sky-200 font-bold">
                PORTAL #02
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Faculty / Teacher Portal</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              View assigned subjects & students, generate 5-minute dynamic QR codes, track live check-ins, and mine blocks.
            </p>
          </div>

          <div className="pt-3 border-t border-sky-100 flex items-center justify-between text-xs font-bold">
            <span className={selectedPortal === 'TEACHER' ? 'text-sky-700' : 'text-slate-500'}>
              {safeTeachers.length === 0 ? '0 Enrolled' : `${safeTeachers.length} Active Faculty`}
            </span>
            <ArrowRight className={`w-4 h-4 ${selectedPortal === 'TEACHER' ? 'text-sky-600 translate-x-1' : 'text-slate-400'} transition-transform`} />
          </div>
        </div>

        {/* CARD 3: Admin */}
        <div 
          onClick={() => setSelectedPortal('ADMIN')}
          className={`cursor-pointer rounded-2xl p-6 border transition-all flex flex-col justify-between ${
            selectedPortal === 'ADMIN'
              ? 'bg-white border-sky-500 shadow-xl ring-2 ring-sky-400/30 scale-[1.02]'
              : 'bg-white/80 border-sky-100 hover:border-sky-300 shadow-sm hover:shadow-md'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${selectedPortal === 'ADMIN' ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white' : 'bg-sky-50 text-sky-700 border border-sky-100'}`}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono text-sky-800 bg-sky-100 px-2 py-0.5 rounded border border-sky-200 font-bold">
                PORTAL #03
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Admin CRM & Auditor</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Institutional CRM: Add/Edit students, faculty, subjects & passwords. Audit SHA-256 blocks & test tamper detection.
            </p>
          </div>

          <div className="pt-3 border-t border-sky-100 flex items-center justify-between text-xs font-bold">
            <span className={selectedPortal === 'ADMIN' ? 'text-sky-700' : 'text-slate-500'}>
              Master Access Ready
            </span>
            <ArrowRight className={`w-4 h-4 ${selectedPortal === 'ADMIN' ? 'text-sky-600 translate-x-1' : 'text-slate-400'} transition-transform`} />
          </div>
        </div>

      </div>

      {/* Centered Login Box */}
      <div className="w-full max-w-md bg-white border border-sky-200 rounded-2xl p-6 sm:p-8 shadow-lg space-y-5">
        
        <div className="border-b border-sky-100 pb-4">
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-sky-600" />
            {selectedPortal === 'STUDENT' && 'Student Login & Credential'}
            {selectedPortal === 'TEACHER' && 'Faculty Login & Credential'}
            {selectedPortal === 'ADMIN' && 'System Administrator Passcode'}
          </h4>
          <p className="text-xs text-slate-500 mt-1">Enter your credentials to authenticate into your portal.</p>
        </div>

        {error && (
          <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-lg border border-rose-200 flex items-center gap-2 font-medium">
            <ShieldAlert className="w-4 h-4 text-rose-600" /> {error}
          </p>
        )}

        {/* STUDENT LOGIN FORM */}
        {selectedPortal === 'STUDENT' && (
          safeStudents.length > 0 ? (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Student Profile</label>
                <select
                  value={studentId}
                  onChange={(e) => {
                    const sId = e.target.value;
                    setStudentId(sId);
                    const found = safeStudents.find(s => s.id === sId);
                    if (found) setStudentPassword(found.password || '');
                  }}
                  className="w-full p-2.5 rounded-xl glass-input text-xs font-semibold text-slate-900 bg-white border border-sky-200"
                >
                  {safeStudents.map(s => (
                    <option key={s.id} value={s.id} className="bg-white text-slate-900">
                      👤 {s.name} ({s.rollNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Password Credential</label>
                <input
                  type="password"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full p-2.5 rounded-xl glass-input text-xs font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold hover:brightness-110 transition-all text-xs flex items-center justify-center gap-2 shadow-md"
              >
                Sign In to Student Portal <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center mx-auto text-sky-600">
                <GraduationCap className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-600 font-medium">
                No student accounts registered in the database yet.
              </p>
              <button
                onClick={() => setSelectedPortal('ADMIN')}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 transition-all text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <ShieldCheck className="w-4 h-4" /> Sign In as Admin to Add Students
              </button>
            </div>
          )
        )}

        {/* TEACHER LOGIN FORM */}
        {selectedPortal === 'TEACHER' && (
          safeTeachers.length > 0 ? (
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Faculty Profile</label>
                <select
                  value={teacherId}
                  onChange={(e) => {
                    const tId = e.target.value;
                    setTeacherId(tId);
                    const found = safeTeachers.find(t => t.id === tId);
                    if (found) setTeacherPassword(found.password || '');
                  }}
                  className="w-full p-2.5 rounded-xl glass-input text-xs font-semibold text-slate-900 bg-white border border-sky-200"
                >
                  {safeTeachers.map(t => (
                    <option key={t.id} value={t.id} className="bg-white text-slate-900">
                      👨‍🏫 {t.name} ({t.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Faculty Password</label>
                <input
                  type="password"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full p-2.5 rounded-xl glass-input text-xs font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold hover:brightness-110 transition-all text-xs flex items-center justify-center gap-2 shadow-md"
              >
                Sign In to Faculty Portal <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center mx-auto text-sky-600">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-600 font-medium">
                No faculty accounts registered in the database yet.
              </p>
              <button
                onClick={() => setSelectedPortal('ADMIN')}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 transition-all text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <ShieldCheck className="w-4 h-4" /> Sign In as Admin to Add Faculty
              </button>
            </div>
          )
        )}

        {/* ADMIN LOGIN FORM */}
        {selectedPortal === 'ADMIN' && (
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Admin Master Access Code</label>
              <input
                type="text"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                placeholder="e.g. ADM-ISE-2026"
                className="w-full p-2.5 rounded-xl glass-input text-xs font-mono font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Security Key Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter security key (default: admin123)"
                className="w-full p-2.5 rounded-xl glass-input text-xs font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold hover:brightness-110 transition-all text-xs flex items-center justify-center gap-2 shadow-md"
            >
              Sign In as Auditor / Admin <ArrowRight className="w-4 h-4" />
            </button>

            <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-100 text-[11px] font-mono text-sky-900 text-center">
              Passcode: <strong className="text-slate-900">ADM-ISE-2026</strong> • Pass: <strong className="text-slate-900">admin123</strong>
            </div>
          </form>
        )}

      </div>

    </div>
  );
}

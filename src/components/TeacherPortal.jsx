import React, { useState } from 'react';
import { 
  Users, QrCode, Cpu, Database, CheckCircle2, XCircle, Clock, 
  AlertTriangle, RefreshCw, ShieldCheck, Play, Plus, Search, ChevronRight, Radio
} from 'lucide-react';
import TeacherQRModal from './TeacherQRModal';
import confetti from 'canvas-confetti';
import { getInitials } from '../services/mockData';

export default function TeacherPortal({ 
  teacher, 
  courses, 
  students, 
  blockchain, 
  activeQRSessions = {}, 
  onLaunchQRSession = () => {}, 
  onCommitBlock 
}) {
  const teacherCourses = courses.filter(c => c.instructorId === teacher.id || true);
  const [selectedCourse, setSelectedCourse] = useState(teacherCourses[0]);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [mining, setMining] = useState(false);
  const [miningProgress, setMiningProgress] = useState({ nonce: 0, hash: '' });

  const [attendanceState, setAttendanceState] = useState(() => {
    const initial = {};
    students.forEach(s => {
      initial[s.id] = {
        studentId: s.id,
        studentName: s.name,
        rollNumber: s.rollNumber,
        status: 'ABSENT',
        method: 'AWAITING_SCAN',
        score: '0%'
      };
    });
    return initial;
  });

  const toggleStudentStatus = (studentId) => {
    setAttendanceState(prev => {
      const current = prev[studentId];
      const newStatus = current?.status === 'PRESENT' ? 'ABSENT' : 'PRESENT';
      return {
        ...prev,
        [studentId]: {
          ...current,
          status: newStatus,
          method: newStatus === 'PRESENT' ? 'MANUAL_VERIFIED' : 'NONE',
          score: newStatus === 'PRESENT' ? '100%' : '0%'
        }
      };
    });
  };

  const handleOpenQRStream = () => {
    setIsQRModalOpen(true);
    const token = `${selectedCourse?.code || 'CS101'}-5MIN-${Math.floor(1000 + Math.random() * 9000)}`;
    onLaunchQRSession({
      courseId: selectedCourse.id,
      courseCode: selectedCourse.code,
      courseName: selectedCourse.name,
      teacherId: teacher.id,
      qrToken: token,
      geoCoordinates: { lat: '13.0067° N', lng: '76.1022° E', radius: 50 }
    });
  };

  const handleMineBlock = async () => {
    setMining(true);
    setMiningProgress({ nonce: 0, hash: 'Calculating Genesis Hash...' });

    const records = Object.values(attendanceState).map(item => ({
      studentId: item.studentId,
      studentName: item.studentName,
      status: item.status,
      verificationMethod: item.method,
      score: item.score
    }));

    const sessionData = {
      courseId: selectedCourse.id,
      courseName: selectedCourse.name,
      teacherId: teacher.id,
      date: new Date().toISOString().split('T')[0],
      timeSlot: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      method: 'HYBRID_AI_QR',
      records
    };

    try {
      await blockchain.addBlock(sessionData, (nonce, hash) => {
        setMiningProgress({ nonce, hash });
      });

      setMining(false);

      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}

      if (onCommitBlock) {
        onCommitBlock();
      }
    } catch (err) {
      console.error(err);
      setMining(false);
    }
  };

  const presentCount = Object.values(attendanceState).filter(s => s.status === 'PRESENT').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Teacher Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-sky-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-extrabold text-2xl flex items-center justify-center border-2 border-sky-300 shadow-md">
            {getInitials(teacher.name)}
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{teacher.name}</h2>
            <p className="text-xs text-slate-600 font-medium">{teacher.designation} • {teacher.department}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 border border-sky-200 text-sky-800 font-mono text-xs font-bold">
                Faculty Node Verified
              </span>
            </div>
          </div>
        </div>

        {/* Quick Launch Button */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleOpenQRStream}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold hover:brightness-110 transition-all shadow-md flex items-center gap-2 text-xs"
          >
            <QrCode className="w-4 h-4 text-white" /> Launch 5-Min Dynamic QR Stream to Students
          </button>
        </div>
      </div>

      {/* Active Session Broadcast Indicator */}
      {activeQRSessions[selectedCourse.id] && (
        <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between font-mono text-xs text-sky-900 shadow-sm animate-pulse">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-sky-600" />
            <span>Active Live QR Attendance Stream: <strong className="text-slate-900 font-bold">{activeQRSessions[selectedCourse.id].qrToken}</strong></span>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-sky-600 text-white text-[11px] font-bold">
            Dispatched to All Enrolled Students
          </span>
        </div>
      )}

      {/* Course Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {teacherCourses.map(course => {
          const isSelected = selectedCourse.id === course.id;
          return (
            <button
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className={`p-5 rounded-xl text-left border transition-all ${
                isSelected
                  ? 'bg-white border-sky-600 shadow-md ring-2 ring-sky-400/30'
                  : 'bg-white/80 border-sky-100 hover:border-sky-300 text-slate-700 shadow-sm'
              }`}
            >
              <span className="px-2 py-0.5 rounded bg-sky-100 border border-sky-200 text-sky-800 font-mono text-[10px] font-bold">
                {course.code}
              </span>
              <h4 className="text-sm font-extrabold text-slate-900 mt-2 line-clamp-1">{course.name}</h4>
              <p className="text-xs text-slate-500 mt-1">{course.schedule}</p>
            </button>
          );
        })}
      </div>

      {/* Active Session Console */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-sky-100 shadow-sm space-y-6">
        
        {/* Console Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-sky-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-lg font-bold text-slate-900">Live Classroom Attendance Session</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Subject: <span className="text-slate-900 font-bold">{selectedCourse.name}</span> ({selectedCourse.room})</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-500 font-semibold block">Verified Check-ins</span>
              <span className="text-lg font-black text-slate-900">{presentCount} / {students.length} Present</span>
            </div>

            <button
              onClick={handleMineBlock}
              disabled={mining}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all text-xs flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {mining ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" /> Mining Block...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 text-white" /> Mine Session Block to Blockchain
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mining Block Banner */}
        {mining && (
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-2 font-mono text-xs text-sky-900">
            <div className="flex justify-between font-bold">
              <span>SHA-256 Proof-of-Work Mining...</span>
              <span>Nonce: #{miningProgress.nonce}</span>
            </div>
            <div className="w-full h-1.5 bg-sky-200 rounded-full overflow-hidden">
              <div className="h-full bg-sky-600 animate-shimmer" style={{ width: '100%' }} />
            </div>
            <p className="text-[11px] text-sky-700 truncate">
              Candidate Hash: <span className="font-bold">{miningProgress.hash}</span>
            </p>
          </div>
        )}

        {/* Roster Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-sky-50 text-sky-900 uppercase tracking-wider border-b border-sky-100 font-bold">
              <tr>
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Roll Number</th>
                <th className="px-6 py-3.5">Auth Method</th>
                <th className="px-6 py-3.5">Biometric Confidence</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100">
              {students.slice(0, 20).map(student => {
                const record = attendanceState[student.id];
                const isPresent = record?.status === 'PRESENT';

                return (
                  <tr key={student.id} className="hover:bg-sky-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-extrabold text-xs flex items-center justify-center">
                          {getInitials(student.name)}
                        </div>
                        <div>
                          <span className="font-sans font-bold text-slate-900 text-xs block">{student.name}</span>
                          <span className="text-slate-500 text-[10px]">{student.department}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-800 font-bold">{student.rollNumber}</td>

                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-800 text-[10px] font-bold">
                        {record?.method === 'AI_FACE_SCAN' ? '🤖 AI Face ID' : (record?.method?.includes('GEOFENCE') ? '📱 50m Dynamic QR' : '✍️ Manual')}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-800 font-bold">
                      {record?.score} Match
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                        isPresent
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {isPresent ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                        {record?.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleStudentStatus(student.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all ${
                          isPresent
                            ? 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        {isPresent ? 'Mark Absent' : 'Mark Present'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Teacher QR Modal */}
      <TeacherQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        course={selectedCourse}
        checkedInCount={presentCount}
        onCommitSession={() => {
          setIsQRModalOpen(false);
          handleMineBlock();
        }}
      />

    </div>
  );
}

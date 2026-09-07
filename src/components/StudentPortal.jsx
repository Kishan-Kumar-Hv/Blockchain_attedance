import React, { useState } from 'react';
import { 
  Scan, QrCode, Award, ShieldCheck, CheckCircle2, XCircle, Clock, 
  BookOpen, AlertTriangle, FileText, Check, Copy, ExternalLink, User, Fingerprint, Radio, Sparkles
} from 'lucide-react';
import FaceRecognitionModal from './FaceRecognitionModal';
import QRScannerModal from './QRScannerModal';
import { getInitials } from '../services/mockData';

export default function StudentPortal({ 
  student, 
  courses, 
  blockchain, 
  activeQRSessions = {}, 
  onAttendanceMarked,
  onUpdateBiometric
}) {
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(courses[0]);
  const [presetQRToken, setPresetQRToken] = useState('');
  const [copiedHash, setCopiedHash] = useState('');

  // Extract all block records for active student
  const studentHistory = [];
  blockchain.chain.forEach((block) => {
    if (block.sessionData && block.sessionData.records) {
      block.sessionData.records.forEach((record) => {
        if (record.studentId === student.id) {
          studentHistory.push({
            blockIndex: block.index,
            blockHash: block.hash,
            timestamp: record.timestamp || block.timestamp,
            courseName: block.sessionData.courseName,
            courseCode: block.sessionData.courseId,
            teacherId: block.sessionData.teacherId,
            status: record.status,
            method: record.verificationMethod || block.sessionData.method || 'AI_FACE_SCAN',
            txHash: record.txHash || '0x' + block.hash.substring(0, 16),
            score: record.score || '100%'
          });
        }
      });
    }
  });

  const totalRequiredSessions = courses.reduce((acc, c) => acc + (c.totalSessions || 24), 0);
  const realAttendanceRate = totalRequiredSessions > 0
    ? Math.min(100, ((studentHistory.length / totalRequiredSessions) * 100)).toFixed(1)
    : (student.attendanceRate || 0.0);

  const activeSessionKeys = Object.keys(activeQRSessions);
  const currentActiveSession = activeSessionKeys.length > 0 ? activeQRSessions[activeSessionKeys[0]] : null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(''), 2000);
  };

  const handleScanSuccess = (verificationData) => {
    onAttendanceMarked({
      studentId: student.id,
      studentName: student.name,
      courseId: selectedCourse?.id || 'CS101',
      courseName: selectedCourse?.name || 'Applied Blockchain Systems',
      verificationData
    });
  };

  const launchLiveQRScan = (sessionObj) => {
    const courseObj = courses.find(c => c.id === sessionObj.courseId) || courses[0];
    setSelectedCourse(courseObj);
    setPresetQRToken(sessionObj.qrToken);
    setIsQRModalOpen(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Real-time Teacher Dynamic QR Session Banner */}
      {currentActiveSession && (
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl p-4 sm:p-5 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 sm:p-3 rounded-xl bg-white/20 backdrop-blur text-white shrink-0">
              <Radio className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div>
              <span className="px-2 py-0.5 rounded bg-white/20 text-white font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                LIVE CLASSROOM STREAM
              </span>
              <h3 className="text-sm sm:text-base font-extrabold mt-0.5">
                {currentActiveSession.courseName} Dynamic QR Active
              </h3>
              <p className="text-[11px] sm:text-xs text-sky-100 font-mono truncate max-w-xs sm:max-w-md">
                Token <span className="font-bold underline">{currentActiveSession.qrToken}</span> • 5-min timer active!
              </p>
            </div>
          </div>

          <button
            onClick={() => launchLiveQRScan(currentActiveSession)}
            className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-white text-sky-900 font-bold hover:bg-sky-50 transition-all text-xs flex items-center justify-center gap-2 shadow-md shrink-0"
          >
            <QrCode className="w-4 h-4 text-sky-600" /> Scan QR & Verify GPS
          </button>
        </div>
      )}

      {/* Student Profile Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-8 border border-sky-100 shadow-sm">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6">
          
          {/* Profile Header with Initials Badge */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-extrabold text-xl sm:text-3xl flex items-center justify-center border-2 border-sky-300 shadow-md shrink-0">
              {getInitials(student.name)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">{student.name}</h2>
                <span className="px-2 py-0.5 rounded-full bg-sky-100 border border-sky-200 text-sky-800 font-mono text-[11px] sm:text-xs font-bold shrink-0">
                  {student.rollNumber}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1 truncate">{student.department} • {student.className}</p>
              
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] sm:text-xs text-slate-500 font-mono flex items-center gap-1 truncate">
                  <Fingerprint className="w-3.5 h-3.5 text-sky-600 shrink-0" /> Biometrics: 
                  <span className="text-slate-800 font-semibold truncate max-w-[140px] sm:max-w-[200px]">{student.faceBiometricHash || 'Registered'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            
            <button
              onClick={() => {
                setSelectedCourse(courses[0]);
                setIsFaceModalOpen(true);
              }}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 transition-all shadow-md flex items-center justify-center gap-2 text-xs"
            >
              <Scan className="w-4 h-4 text-white" /> AI Face Scan
            </button>

            <button
              onClick={() => {
                setSelectedCourse(courses[0]);
                setPresetQRToken('');
                setIsQRModalOpen(true);
              }}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-xs shadow-md"
            >
              <QrCode className="w-4 h-4 text-white" /> Dynamic QR Scan
            </button>

          </div>

        </div>

        {/* Stats Grid Bar */}
        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-sky-100 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 sm:p-4 rounded-xl bg-sky-50/50 border border-sky-100">
            <span className="text-[11px] sm:text-xs text-slate-500 font-semibold block mb-1">Attendance Rate</span>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-2xl font-black text-slate-900">{realAttendanceRate}%</span>
              <span className={`text-[10px] sm:text-[11px] font-bold ${parseFloat(realAttendanceRate) >= 75 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {parseFloat(realAttendanceRate) >= 75 ? 'Eligible' : 'Tracking'}
              </span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-sky-50/50 border border-sky-100">
            <span className="text-[11px] sm:text-xs text-slate-500 font-semibold block mb-1">Mined Sessions</span>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-2xl font-black text-slate-900">{studentHistory.length}</span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-mono">Blocks</span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-sky-50/50 border border-sky-100">
            <span className="text-[11px] sm:text-xs text-slate-500 font-semibold block mb-1">Ledger Integrity</span>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-2xl font-black text-sky-600">SHA-256</span>
              <span className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold">Valid</span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-sky-50/50 border border-sky-100">
            <span className="text-[11px] sm:text-xs text-slate-500 font-semibold block mb-1">On-Chain Badge</span>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-2xl font-black text-slate-900">{studentHistory.length > 0 ? '1 Issued' : '0 Issued'}</span>
              <span className="text-[10px] sm:text-[11px] text-slate-500">ERC-721</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs (Scrollable on Mobile) */}
      <div className="flex border-b border-sky-100 space-x-4 sm:space-x-6 overflow-x-auto whitespace-nowrap pb-1 scrollbar-none">
        {[
          { id: 'DASHBOARD', label: 'Enrolled Courses', icon: BookOpen },
          { id: 'LEDGER', label: 'Blockchain Ledger', icon: ShieldCheck },
          { id: 'CREDENTIALS', label: 'Verifiable Credentials', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2.5 flex items-center gap-1.5 sm:gap-2 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD & COURSE BREAKDOWN */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h3 className="text-base font-bold text-slate-900">Academic Course Enrollment</h3>
            <span className="text-xs text-slate-500 font-medium">Dept. of ISE • Semester 6</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {courses.length > 0 ? (
              courses.map((course) => {
                const isSessionActive = activeQRSessions[course.id];
                return (
                  <div 
                    key={course.id} 
                    className={`bg-white rounded-2xl p-5 sm:p-6 border flex flex-col justify-between transition-all shadow-sm ${
                      isSessionActive ? 'border-sky-500 ring-2 ring-sky-400/20' : 'border-sky-100 hover:border-sky-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="px-2.5 py-0.5 rounded bg-sky-100 border border-sky-200 text-sky-800 font-mono text-[11px] font-bold">
                            {course.code}
                          </span>
                          <h4 className="text-base font-extrabold text-slate-900 mt-2 line-clamp-1">
                            {course.name}
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-600 bg-sky-50 px-2 py-1 rounded border border-sky-100 font-mono shrink-0">
                          {course.room}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-2">Instructor: <span className="text-slate-900 font-bold">{course.instructorName || 'Department Faculty'}</span></p>
                      <p className="text-xs text-slate-500 mt-0.5">Schedule: <span className="text-slate-700 font-mono">{course.schedule || 'Scheduled'}</span></p>

                      {/* Attendance Progress bar */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-500">Attendance</span>
                          <span className="font-bold text-slate-900">{studentHistory.filter(h => h.courseCode === course.id || h.courseCode === course.code).length} Sessions Verified</span>
                        </div>
                        <div className="w-full h-2 bg-sky-100 rounded-full overflow-hidden border border-sky-200">
                          <div className="h-full rounded-full bg-sky-600" style={{ width: `${Math.min(100, (studentHistory.length / (course.totalSessions || 24)) * 100)}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 pt-4 border-t border-sky-100 flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setIsFaceModalOpen(true);
                        }}
                        className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <Scan className="w-3.5 h-3.5 text-white" /> AI Face Scan
                      </button>

                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setPresetQRToken(isSessionActive ? isSessionActive.qrToken : '');
                          setIsQRModalOpen(true);
                        }}
                        className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold hover:bg-slate-800 text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <QrCode className="w-3.5 h-3.5 text-white" /> {isSessionActive ? 'Scan Live QR' : 'Dynamic QR Scan'}
                      </button>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-8 bg-white rounded-2xl border border-sky-100 text-slate-500 text-xs">
                No courses enrolled currently.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY BLOCKCHAIN LEDGER */}
      {activeTab === 'LEDGER' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">Personal Cryptographic Audit Trail</h3>
              <p className="text-xs text-slate-500">Immutable attendance records secured on the SHA-256 block ledger.</p>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-1 rounded-lg bg-sky-100 border border-sky-200 text-sky-800 font-mono text-[11px] sm:text-xs font-bold">
              SHA-256 Verified
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-sky-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono min-w-[620px]">
                <thead className="bg-sky-50 text-sky-900 uppercase tracking-wider border-b border-sky-100 font-bold">
                  <tr>
                    <th className="px-4 sm:px-6 py-3.5">Block #</th>
                    <th className="px-4 sm:px-6 py-3.5">Course</th>
                    <th className="px-4 sm:px-6 py-3.5">Method</th>
                    <th className="px-4 sm:px-6 py-3.5">Status</th>
                    <th className="px-4 sm:px-6 py-3.5">TxHash</th>
                    <th className="px-4 sm:px-6 py-3.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100">
                  {studentHistory.length > 0 ? (
                    studentHistory.map((row, idx) => (
                      <tr key={idx} className="hover:bg-sky-50/60 transition-colors">
                        <td className="px-4 sm:px-6 py-3.5 font-bold text-sky-600">#{row.blockIndex}</td>
                        <td className="px-4 sm:px-6 py-3.5">
                          <span className="text-slate-900 font-sans font-bold block">{row.courseName}</span>
                          <span className="text-slate-500 text-[10px]">{row.courseCode}</span>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5">
                          <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-bold whitespace-nowrap">
                            {row.method.includes('GEOFENCE') ? '📱 50m QR' : '🤖 AI Facial ID'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                            row.status.includes('PRESENT')
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-700 text-[11px] truncate max-w-[120px] font-semibold">{row.txHash}</span>
                            <button
                              onClick={() => handleCopy(row.txHash)}
                              className="p-1 text-slate-400 hover:text-sky-600 transition-colors"
                              title="Copy Tx Hash"
                            >
                              {copiedHash === row.txHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 text-slate-500 whitespace-nowrap">
                          {new Date(row.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                        No blockchain records logged yet for this student.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CREDENTIALS */}
      {activeTab === 'CREDENTIALS' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-8 border border-sky-100 shadow-sm space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-sky-100 border border-sky-200 text-sky-800 text-xs font-mono font-bold">
              Academic Attendance Certificate
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Verifiable Certificate of Academic Integrity
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Issued to <span className="text-slate-900 font-bold">{student.name}</span> for maintaining an attendance record verified by decentralized SHA-256 blocks.
            </p>

            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 font-mono text-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-slate-500">Issuer:</span>
                <span className="text-slate-900 font-bold">Dept. of ISE, MCE Hassan</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-slate-500">Standard:</span>
                <span className="text-slate-900">ERC-721 Verifiable Credential</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-slate-500">Consensus:</span>
                <span className="text-emerald-700 font-bold">SHA-256 Cryptographic Chaining</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <FaceRecognitionModal
        isOpen={isFaceModalOpen}
        onClose={() => setIsFaceModalOpen(false)}
        student={student}
        course={selectedCourse}
        onSuccess={handleScanSuccess}
        onEnrollBiometric={onUpdateBiometric}
      />

      <QRScannerModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        student={student}
        course={selectedCourse}
        initialToken={presetQRToken}
        onSuccess={handleScanSuccess}
      />

    </div>
  );
}

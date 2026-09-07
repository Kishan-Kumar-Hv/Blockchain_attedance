import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePortalGateway from './components/HomePortalGateway';
import StudentPortal from './components/StudentPortal';
import TeacherPortal from './components/TeacherPortal';
import AdminPortal from './components/AdminPortal';
import { globalBlockchain } from './services/blockchain';
import { INITIAL_STUDENTS, INITIAL_TEACHERS, INITIAL_COURSES, MOCK_SEED_BLOCKS } from './services/mockData';
import { 
  broadcastQRSessionToFirebase, 
  subscribeToQRSessions, 
  saveAttendanceBlockToFirebase, 
  syncStudentToFirebase 
} from './services/firebase';
import { ShieldCheck, LogOut, UserCheck } from 'lucide-react';

export default function App() {
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [teachers, setTeachers] = useState(INITIAL_TEACHERS);
  const [courses, setCourses] = useState(INITIAL_COURSES);

  // Global active classroom QR session state (Real-time sync between Teacher & Student)
  const [activeQRSessions, setActiveQRSessions] = useState({});

  const [authSession, setAuthSession] = useState(null);
  const [blockchainInstance, setBlockchainInstance] = useState(globalBlockchain);
  const [isChainValid, setIsChainValid] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function setupBlockchain() {
      await globalBlockchain.initialize();
      
      if (globalBlockchain.chain.length === 1) {
        for (const seedBlock of MOCK_SEED_BLOCKS) {
          await globalBlockchain.addBlock(seedBlock);
        }
      }

      const audit = await globalBlockchain.isChainValid();
      setIsChainValid(audit.valid);
      setIsInitialized(true);
    }

    setupBlockchain();

    // Subscribe to local blockchain updates
    const unsubscribeBlockchain = globalBlockchain.subscribe(async (updatedChain) => {
      setBlockchainInstance({ ...updatedChain });
      const audit = await updatedChain.isChainValid();
      setIsChainValid(audit.valid);
    });

    // Subscribe to real-time Firebase Firestore active QR sessions
    const unsubscribeFirebase = subscribeToQRSessions((remoteSessions) => {
      if (remoteSessions && Object.keys(remoteSessions).length > 0) {
        setActiveQRSessions(prev => ({ ...prev, ...remoteSessions }));
      }
    });

    return () => {
      unsubscribeBlockchain();
      if (unsubscribeFirebase) unsubscribeFirebase();
    };
  }, []);

  const handleLaunchQRSession = async (sessionData) => {
    const payload = {
      ...sessionData,
      expiresAt: Date.now() + 300 * 1000 // 5 minutes
    };

    setActiveQRSessions(prev => ({
      ...prev,
      [sessionData.courseId]: payload
    }));

    // Broadcast to Firebase Firestore in real time
    await broadcastQRSessionToFirebase(payload);
  };

  const handleStudentAttendanceMarked = async (payload) => {
    // 1. Update student attendance rate locally
    setStudents(prev => prev.map(s => {
      if (s.id === payload.studentId) {
        const updatedStudent = {
          ...s,
          attendanceRate: Math.min(100.0, parseFloat((s.attendanceRate + 0.5).toFixed(1)))
        };
        // Sync updated student to Firebase Cloud
        syncStudentToFirebase(updatedStudent);
        return updatedStudent;
      }
      return s;
    }));

    // 2. Add block transaction to SHA-256 Blockchain Ledger
    const sessionData = {
      courseId: payload.courseId,
      courseName: payload.courseName,
      teacherId: "TCH-001",
      date: new Date().toISOString().split('T')[0],
      timeSlot: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      method: payload.verificationData.method,
      records: [
        {
          studentId: payload.studentId,
          studentName: payload.studentName,
          status: payload.verificationData.status || "PRESENT",
          verificationMethod: payload.verificationData.method,
          score: payload.verificationData.score || "99.1%",
          txHash: payload.verificationData.txHash
        }
      ]
    };

    const addedBlock = await globalBlockchain.addBlock(sessionData);

    // 3. Backup mined block to Firebase Firestore Cloud
    if (addedBlock) {
      await saveAttendanceBlockToFirebase(addedBlock);
    }
  };

  const handleLogin = (session) => {
    setAuthSession(session);
  };

  const handleUpdateStudentBiometric = (studentId, newVector) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const updated = { ...s, faceBiometricHash: newVector };
        syncStudentToFirebase(updated);
        return updated;
      }
      return s;
    }));
    if (authSession?.user?.id === studentId) {
      setAuthSession(prev => ({
        ...prev,
        user: { ...prev.user, faceBiometricHash: newVector }
      }));
    }
  };

  const handleSignOut = () => {
    setAuthSession(null);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4 font-mono text-sky-800">
        <div className="relative w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
        <p className="text-xs font-bold tracking-wider">Initializing Web3 Cryptographic SHA-256 Ledger Node...</p>
        <p className="text-[11px] text-slate-500">Dept. of ISE • MCE Hassan • Session 2025-26</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-sky-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        currentRole={authSession?.role || 'HOME'}
        onRoleChange={(role) => {
          if (role === 'HOME') handleSignOut();
        }}
        blockchainHeight={blockchainInstance.chain.length - 1}
        isChainValid={isChainValid}
        activeStudent={authSession?.role === 'STUDENT' ? authSession.user : students[0]}
        onStudentChange={(s) => setAuthSession({ role: 'STUDENT', user: s })}
        students={students}
      />

      {/* Authenticated User Session Banner */}
      {authSession && (
        <div className="bg-sky-50 border-b border-sky-200 px-3 sm:px-4 py-2 text-xs font-mono text-sky-900 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <UserCheck className="w-4 h-4 text-sky-700 shrink-0" />
              <span className="truncate">Session: <strong className="text-slate-900 font-sans font-bold">{authSession.user?.name}</strong></span>
              <span className="px-2 py-0.5 rounded bg-sky-200 border border-sky-300 text-[10px] text-sky-900 font-bold shrink-0">
                {authSession.role}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="self-start sm:self-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-sky-300 text-sky-900 font-bold hover:bg-sky-100 transition-colors text-[11px] shadow-sm shrink-0"
            >
              <LogOut className="w-3.5 h-3.5 text-sky-700" /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {!authSession ? (
          /* HOME PAGE PORTAL GATEWAY */
          <HomePortalGateway
            onLogin={handleLogin}
            students={students}
            teachers={teachers}
          />
        ) : (
          /* STRICTLY ISOLATED PORTAL VIEWS */
          <>
            {authSession.role === 'STUDENT' && (
              <StudentPortal
                student={authSession.user}
                courses={courses.filter(c => authSession.user.enrolledCourses?.includes(c.id) || true)}
                blockchain={blockchainInstance}
                activeQRSessions={activeQRSessions}
                onAttendanceMarked={handleStudentAttendanceMarked}
                onUpdateBiometric={(newVector) => handleUpdateStudentBiometric(authSession.user.id, newVector)}
              />
            )}

            {authSession.role === 'TEACHER' && (
              <TeacherPortal
                teacher={authSession.user}
                courses={courses.filter(c => c.instructorId === authSession.user.id || authSession.user.assignedCourses?.includes(c.id) || true)}
                students={students}
                blockchain={blockchainInstance}
                activeQRSessions={activeQRSessions}
                onLaunchQRSession={handleLaunchQRSession}
                onCommitBlock={() => console.log('Block Mined by Teacher')}
              />
            )}

            {authSession.role === 'ADMIN' && (
              <AdminPortal
                blockchain={blockchainInstance}
                students={students}
                setStudents={setStudents}
                teachers={teachers}
                setTeachers={setTeachers}
                courses={courses}
                setCourses={setCourses}
              />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-600 font-mono shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>BlockAttend • Dept. of ISE, Malnad College of Engineering (MCE), Hassan</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px] text-slate-500 font-medium">
            <span>Project 2025-26</span>
            <span>SHA-256 Consensus</span>
            <span>Firebase Cloud Synchronized</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

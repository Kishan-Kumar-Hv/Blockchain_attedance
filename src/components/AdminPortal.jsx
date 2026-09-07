import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, Database, Cpu, Activity, AlertTriangle, 
  CheckCircle2, RefreshCw, Layers, Server, Cloud, Sliders, Users, GraduationCap, 
  BookOpen, Plus, Edit, Trash2, Key, Eye, EyeOff, Search, X, Check, ChevronLeft, ChevronRight, RotateCcw, Sparkles, Code, Binary, ArrowRight, FileCode
} from 'lucide-react';
import { getInitials, generateTestRoster, INITIAL_STUDENTS, INITIAL_TEACHERS, INITIAL_COURSES } from '../services/mockData';
import { encodeAttendanceHash, decodeAttendanceHash } from '../services/blockchain';

export default function AdminPortal({ 
  blockchain, 
  students, 
  setStudents, 
  teachers, 
  setTeachers, 
  courses, 
  setCourses 
}) {
  const [activeAdminTab, setActiveAdminTab] = useState('CRM');
  const [crmSubTab, setCrmSubTab] = useState('STUDENTS');

  // Interactive Encoder & Decoder Tool state
  const [inputHashPayload, setInputHashPayload] = useState(JSON.stringify({
    studentId: "STU-101",
    studentName: "Alex Rivera",
    courseId: "CS101",
    status: "PRESENT",
    verificationMethod: "AI_FACE_RECOGNITION",
    score: "99.4%",
    txHash: "0x7f83b2a194c"
  }, null, 2));
  const [encodedResultToken, setEncodedResultToken] = useState('');

  const [inputTokenToDecode, setInputTokenToDecode] = useState('');
  const [decodedResultOutput, setDecodedResultOutput] = useState(null);

  // Search & Pagination State
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const STUDENTS_PER_PAGE = 10;

  // Modals state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const [showPasswordMap, setShowPasswordMap] = useState({});

  // Audit state
  const [auditResult, setAuditResult] = useState(null);
  const [tampering, setTampering] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [minThreshold, setMinThreshold] = useState(75);
  const [qrDecayTime, setQrDecayTime] = useState(300);
  const [autoLockPolicy, setAutoLockPolicy] = useState(true);

  // Form States
  const [studentForm, setStudentForm] = useState({
    name: '',
    rollNumber: '',
    email: '',
    department: 'Information Science & Engg',
    className: '6th Sem ISE A',
    password: 'password123',
    enrolledCourses: ['CS101']
  });

  const [teacherForm, setTeacherForm] = useState({
    name: '',
    id: '',
    email: '',
    department: 'Information Science & Engg',
    designation: 'Assistant Professor',
    password: 'teacher123',
    assignedCourses: ['CS101']
  });

  const [subjectForm, setSubjectForm] = useState({
    code: '',
    name: '',
    instructorId: teachers[0]?.id || '',
    schedule: 'Mon/Wed 10:00 AM',
    room: 'Lab 402',
    department: 'Information Science & Engg',
    className: '6th Sem ISE A'
  });

  const handleEncodeClick = () => {
    try {
      const parsed = JSON.parse(inputHashPayload);
      const token = encodeAttendanceHash(parsed);
      setEncodedResultToken(token);
    } catch (e) {
      alert('Invalid JSON input formatting. Please check syntax.');
    }
  };

  const handleDecodeClick = () => {
    if (!inputTokenToDecode.trim()) {
      alert('Please enter a valid BLK-TOKEN string.');
      return;
    }
    const result = decodeAttendanceHash(inputTokenToDecode);
    setDecodedResultOutput(result);
  };

  const toggleShowPassword = (id) => {
    setShowPasswordMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Database Seed Actions
  const handleSeed10Students = () => {
    setStudents(generateTestRoster());
    setStudentPage(1);
  };

  const handleResetToCleanState = () => {
    if (confirm('Reset database to clean initial institutional state?')) {
      setStudents(INITIAL_STUDENTS);
      setTeachers(INITIAL_TEACHERS);
      setCourses(INITIAL_COURSES);
      setStudentPage(1);
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    s.className.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE) || 1;
  const paginatedStudents = filteredStudents.slice(
    (studentPage - 1) * STUDENTS_PER_PAGE,
    studentPage * STUDENTS_PER_PAGE
  );

  // Handlers
  const handleCreateStudent = (e) => {
    e.preventDefault();
    const newStudent = {
      id: `STU-${Math.floor(100 + Math.random() * 900)}`,
      ...studentForm,
      initials: getInitials(studentForm.name),
      faceBiometricHash: '0x' + Math.floor(Math.random() * 10000000000000000).toString(16),
      attendanceRate: 100.0
    };
    setStudents(prev => [newStudent, ...prev]);
    setIsAddStudentOpen(false);
    resetStudentForm();
  };

  const handleUpdateStudent = (e) => {
    e.preventDefault();
    setStudents(prev => prev.map(s => s.id === editingStudent.id ? { 
      ...s, 
      ...studentForm, 
      initials: getInitials(studentForm.name) 
    } : s));
    setIsEditStudentOpen(false);
    setEditingStudent(null);
    resetStudentForm();
  };

  const handleDeleteStudent = (id) => {
    if (confirm('Are you sure you want to remove this student?')) {
      setStudents(prev => prev.filter(s => s.id !== id));
    }
  };

  const resetStudentForm = () => {
    setStudentForm({
      name: '',
      rollNumber: '',
      email: '',
      department: 'Information Science & Engg',
      className: '6th Sem ISE A',
      password: 'password123',
      enrolledCourses: ['CS101']
    });
  };

  const handleCreateTeacher = (e) => {
    e.preventDefault();
    const newTeacher = {
      id: teacherForm.id || `TCH-${Math.floor(100 + Math.random() * 900)}`,
      ...teacherForm,
      initials: getInitials(teacherForm.name)
    };
    setTeachers(prev => [...prev, newTeacher]);
    setIsAddTeacherOpen(false);
    resetTeacherForm();
  };

  const handleUpdateTeacher = (e) => {
    e.preventDefault();
    setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? { 
      ...t, 
      ...teacherForm, 
      initials: getInitials(teacherForm.name) 
    } : t));
    setIsEditTeacherOpen(false);
    setEditingTeacher(null);
    resetTeacherForm();
  };

  const handleDeleteTeacher = (id) => {
    if (confirm('Are you sure you want to remove this faculty member?')) {
      setTeachers(prev => prev.filter(t => t.id !== id));
    }
  };

  const resetTeacherForm = () => {
    setTeacherForm({
      name: '',
      id: '',
      email: '',
      department: 'Information Science & Engg',
      designation: 'Assistant Professor',
      password: 'teacher123',
      assignedCourses: ['CS101']
    });
  };

  const handleCreateSubject = (e) => {
    e.preventDefault();
    const teacherObj = teachers.find(t => t.id === subjectForm.instructorId) || teachers[0];
    const newSubject = {
      id: subjectForm.code.replace('-', '').toUpperCase(),
      ...subjectForm,
      instructorName: teacherObj?.name || 'Assigned Instructor',
      totalSessions: 24
    };
    setCourses(prev => [...prev, newSubject]);
    setIsAddSubjectOpen(false);
  };

  const handleUpdateSubject = (e) => {
    e.preventDefault();
    const teacherObj = teachers.find(t => t.id === subjectForm.instructorId) || teachers[0];
    setCourses(prev => prev.map(c => c.id === editingSubject.id ? { 
      ...c, 
      ...subjectForm, 
      instructorName: teacherObj?.name || c.instructorName 
    } : c));
    setIsEditSubjectOpen(false);
    setEditingSubject(null);
  };

  const handleDeleteSubject = (id) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      setCourses(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleAuditChain = async () => {
    const result = await blockchain.isChainValid();
    setAuditResult(result);
  };

  const handleSimulateTamper = async () => {
    setTampering(true);
    const blockToAlter = blockchain.chain.length > 1 ? 1 : 0;
    const audit = await blockchain.simulateTampering(blockToAlter, 'STU-101');
    setAuditResult(audit);
    setTampering(false);
  };

  const handleRestore = async () => {
    setRestoring(true);
    await blockchain.restoreIntegrity();
    const audit = await blockchain.isChainValid();
    setAuditResult(audit);
    setRestoring(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Admin Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-sky-100 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-extrabold shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Institutional Administration CRM</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-100 border border-sky-200 text-sky-800 font-mono text-xs font-bold">
                  Dept of ISE • MCE Hassan
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Manage real students, faculty members, subject assignments, passwords, and SHA-256 blockchain audit logs.
              </p>
            </div>
          </div>

          {/* Database Operations Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSeed10Students}
              className="px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 transition-colors text-xs font-bold flex items-center gap-1.5"
              title="Seed 10 Test Students"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Seed 10 Test Students
            </button>

            <button
              onClick={handleResetToCleanState}
              className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors text-xs font-bold flex items-center gap-1.5"
              title="Reset Database"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" /> Reset Database
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-sky-100 flex gap-2 sm:gap-3 overflow-x-auto whitespace-nowrap pb-1 scrollbar-none">
          <button
            onClick={() => setActiveAdminTab('CRM')}
            className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 ${
              activeAdminTab === 'CRM'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-sky-50 border border-sky-100 text-sky-900 hover:bg-sky-100'
            }`}
          >
            <Users className="w-4 h-4" /> Academic CRM
          </button>

          <button
            onClick={() => setActiveAdminTab('ENCODER')}
            className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 ${
              activeAdminTab === 'ENCODER'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-sky-50 border border-sky-100 text-sky-900 hover:bg-sky-100'
            }`}
          >
            <Binary className="w-4 h-4" /> Token Encoder/Decoder
          </button>

          <button
            onClick={() => setActiveAdminTab('EXPLORER')}
            className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 ${
              activeAdminTab === 'EXPLORER'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-sky-50 border border-sky-100 text-sky-900 hover:bg-sky-100'
            }`}
          >
            <Layers className="w-4 h-4" /> Blockchain Explorer
          </button>

          <button
            onClick={() => setActiveAdminTab('LEDGER')}
            className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 ${
              activeAdminTab === 'LEDGER'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-sky-50 border border-sky-100 text-sky-900 hover:bg-sky-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Tamper Auditor
          </button>

          <button
            onClick={() => setActiveAdminTab('POLICIES')}
            className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 ${
              activeAdminTab === 'POLICIES'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-sky-50 border border-sky-100 text-sky-900 hover:bg-sky-100'
            }`}
          >
            <Sliders className="w-4 h-4" /> System Policies
          </button>
        </div>
      </div>

      {/* TAB 1: ACADEMIC CRM */}
      {activeAdminTab === 'CRM' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-sky-100 pb-4">
            <div className="flex space-x-3">
              <button
                onClick={() => setCrmSubTab('STUDENTS')}
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${
                  crmSubTab === 'STUDENTS'
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-white border-sky-200 text-sky-900 hover:bg-sky-50'
                }`}
              >
                <GraduationCap className="w-4 h-4" /> Students Directory ({students.length})
              </button>

              <button
                onClick={() => setCrmSubTab('TEACHERS')}
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${
                  crmSubTab === 'TEACHERS'
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-white border-sky-200 text-sky-900 hover:bg-sky-50'
                }`}
              >
                <Users className="w-4 h-4" /> Faculty Directory ({teachers.length})
              </button>

              <button
                onClick={() => setCrmSubTab('SUBJECTS')}
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${
                  crmSubTab === 'SUBJECTS'
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-white border-sky-200 text-sky-900 hover:bg-sky-50'
                }`}
              >
                <BookOpen className="w-4 h-4" /> Subjects ({courses.length})
              </button>
            </div>

            <div>
              {crmSubTab === 'STUDENTS' && (
                <button
                  onClick={() => { resetStudentForm(); setIsAddStudentOpen(true); }}
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 transition-all text-xs flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4 text-white" /> Add New Student
                </button>
              )}

              {crmSubTab === 'TEACHERS' && (
                <button
                  onClick={() => { resetTeacherForm(); setIsAddTeacherOpen(true); }}
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 transition-all text-xs flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4 text-white" /> Add New Faculty Member
                </button>
              )}

              {crmSubTab === 'SUBJECTS' && (
                <button
                  onClick={() => {
                    setSubjectForm({
                      code: '',
                      name: '',
                      instructorId: teachers[0]?.id || '',
                      schedule: 'Mon/Wed 10:00 AM',
                      room: 'Lab 402',
                      department: 'Information Science & Engg',
                      className: '6th Sem ISE A'
                    });
                    setIsAddSubjectOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 transition-all text-xs flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4 text-white" /> Add New Subject
                </button>
              )}
            </div>
          </div>

          {/* CRM SUB-TAB 1: STUDENTS DIRECTORY */}
          {crmSubTab === 'STUDENTS' && (
            <div className="space-y-4">
              
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-sky-100 shadow-sm">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={studentSearchTerm}
                    onChange={(e) => {
                      setStudentSearchTerm(e.target.value);
                      setStudentPage(1);
                    }}
                    placeholder="Search by student name, USN, or class..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-xs font-medium"
                  />
                </div>

                <div className="text-xs font-mono text-slate-600 flex items-center gap-3">
                  <span>Showing <strong>{paginatedStudents.length}</strong> of <strong>{filteredStudents.length}</strong> Students</span>
                </div>
              </div>

              {/* Students Table */}
              <div className="bg-white rounded-2xl border border-sky-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-sky-50 text-sky-900 uppercase tracking-wider border-b border-sky-100 font-bold">
                      <tr>
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Roll Number / USN</th>
                        <th className="px-6 py-4">Class / Department</th>
                        <th className="px-6 py-4">Enrolled Subjects</th>
                        <th className="px-6 py-4">Password Credential</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-100">
                      {paginatedStudents.length > 0 ? (
                        paginatedStudents.map(student => (
                          <tr key={student.id} className="hover:bg-sky-50/60 transition-colors">
                            <td className="px-6 py-4 font-sans font-bold text-slate-900">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-extrabold text-xs flex items-center justify-center">
                                  {getInitials(student.name)}
                                </div>
                                <div>
                                  <span className="block text-slate-900 text-xs">{student.name}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">{student.email}</span>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 font-bold text-sky-800">{student.rollNumber}</td>
                            <td className="px-6 py-4 text-slate-600">{student.className}</td>
                            
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {student.enrolledCourses?.map(cId => (
                                  <span key={cId} className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-800 text-[10px] font-bold">
                                    {cId}
                                  </span>
                                ))}
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-800 font-bold">
                                  {showPasswordMap[student.id] ? student.password : '••••••••'}
                                </span>
                                <button 
                                  onClick={() => toggleShowPassword(student.id)}
                                  className="text-slate-400 hover:text-sky-600 transition-colors"
                                >
                                  {showPasswordMap[student.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </td>

                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setEditingStudent(student);
                                  setStudentForm({
                                    name: student.name,
                                    rollNumber: student.rollNumber,
                                    email: student.email,
                                    department: student.department,
                                    className: student.className,
                                    password: student.password,
                                    enrolledCourses: student.enrolledCourses || ['CS101']
                                  });
                                  setIsEditStudentOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition-all font-bold"
                                title="Edit Student & Password"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              
                              <button
                                onClick={() => handleDeleteStudent(student.id)}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-all font-bold"
                                title="Delete Student"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-slate-500 font-sans">
                            No students match your search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Bar */}
                <div className="p-4 bg-sky-50/50 border-t border-sky-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600">Page <strong>{studentPage}</strong> of <strong>{totalPages}</strong></span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={studentPage <= 1}
                      onClick={() => setStudentPage(p => p - 1)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-sky-200 text-sky-800 hover:bg-sky-100 font-bold disabled:opacity-50 flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Prev
                    </button>
                    <button
                      disabled={studentPage >= totalPages}
                      onClick={() => setStudentPage(p => p + 1)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-sky-200 text-sky-800 hover:bg-sky-100 font-bold disabled:opacity-50 flex items-center gap-1"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* CRM SUB-TAB 2: FACULTY DIRECTORY */}
          {crmSubTab === 'TEACHERS' && (
            <div className="bg-white rounded-2xl border border-sky-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-sky-50 text-sky-900 uppercase tracking-wider border-b border-sky-100 font-bold">
                    <tr>
                      <th className="px-6 py-4">Faculty Name</th>
                      <th className="px-6 py-4">Faculty ID</th>
                      <th className="px-6 py-4">Designation & Department</th>
                      <th className="px-6 py-4">Assigned Subjects</th>
                      <th className="px-6 py-4">Password Credential</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100">
                    {teachers.map(teacher => (
                      <tr key={teacher.id} className="hover:bg-sky-50/60 transition-colors">
                        <td className="px-6 py-4 font-sans font-bold text-slate-900">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-extrabold text-xs flex items-center justify-center">
                              {getInitials(teacher.name)}
                            </div>
                            <div>
                              <span className="block text-slate-900 text-xs">{teacher.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{teacher.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-bold text-sky-800">{teacher.id}</td>
                        <td className="px-6 py-4 text-slate-600">{teacher.designation} • {teacher.department}</td>
                        
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {teacher.assignedCourses?.map(cId => (
                              <span key={cId} className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-800 text-[10px] font-bold">
                                {cId}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-800 font-bold">
                              {showPasswordMap[teacher.id] ? teacher.password : '••••••••'}
                            </span>
                            <button 
                              onClick={() => toggleShowPassword(teacher.id)}
                              className="text-slate-400 hover:text-sky-600 transition-colors"
                            >
                              {showPasswordMap[teacher.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingTeacher(teacher);
                              setTeacherForm({
                                name: teacher.name,
                                id: teacher.id,
                                email: teacher.email,
                                department: teacher.department,
                                designation: teacher.designation,
                                password: teacher.password,
                                assignedCourses: teacher.assignedCourses || ['CS101']
                              });
                              setIsEditTeacherOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition-all font-bold"
                            title="Edit Faculty & Password"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteTeacher(teacher.id)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-all font-bold"
                            title="Delete Faculty"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CRM SUB-TAB 3: SUBJECTS DIRECTORY */}
          {crmSubTab === 'SUBJECTS' && (
            <div className="bg-white rounded-2xl border border-sky-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-sky-50 text-sky-900 uppercase tracking-wider border-b border-sky-100 font-bold">
                    <tr>
                      <th className="px-6 py-4">Subject Code</th>
                      <th className="px-6 py-4">Subject Name</th>
                      <th className="px-6 py-4">Assigned Faculty</th>
                      <th className="px-6 py-4">Schedule & Room</th>
                      <th className="px-6 py-4">Class / Semester</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100">
                    {courses.map(course => (
                      <tr key={course.id} className="hover:bg-sky-50/60 transition-colors">
                        <td className="px-6 py-4 font-bold text-sky-800">{course.code}</td>
                        <td className="px-6 py-4 font-sans font-bold text-slate-900">{course.name}</td>
                        <td className="px-6 py-4 text-slate-800 font-bold">{course.instructorName}</td>
                        <td className="px-6 py-4 text-slate-600">{course.schedule} • {course.room}</td>
                        <td className="px-6 py-4 text-slate-600">{course.className || '6th Sem ISE A'}</td>

                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingSubject(course);
                              setSubjectForm({
                                code: course.code,
                                name: course.name,
                                instructorId: course.instructorId,
                                schedule: course.schedule,
                                room: course.room,
                                department: course.department || 'Information Science & Engg',
                                className: course.className || '6th Sem ISE A'
                              });
                              setIsEditSubjectOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition-all font-bold"
                            title="Edit Subject"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteSubject(course.id)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-all font-bold"
                            title="Delete Subject"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: HASH ENCODER & DECODER TOOL */}
      {activeAdminTab === 'ENCODER' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-sky-100 shadow-sm space-y-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Binary className="w-5 h-5 text-sky-600" /> Cryptographic Attendance Hash Encoder & Decoder Tool
            </h3>
            <p className="text-xs text-slate-500">Encode attendance transaction metadata into Base64 cryptographic tokens or decode tokens back into verified metadata.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* ENCODER PANEL */}
            <div className="bg-sky-50/50 p-6 rounded-2xl border border-sky-100 space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Code className="w-4 h-4 text-sky-600" /> 1. Encode Attendance Record to Token
              </h4>
              
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">JSON Metadata Payload</label>
                <textarea
                  rows="6"
                  value={inputHashPayload}
                  onChange={(e) => setInputHashPayload(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input font-mono text-xs"
                />
              </div>

              <button
                onClick={handleEncodeClick}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 transition-all text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                Encode Hash Payload <ArrowRight className="w-4 h-4" />
              </button>

              {encodedResultToken && (
                <div className="p-3 bg-white rounded-xl border border-sky-200 space-y-1 font-mono text-xs">
                  <span className="text-slate-500 text-[10px] block font-bold">Encoded Token String:</span>
                  <div className="p-2 bg-sky-50 text-sky-900 rounded border border-sky-200 break-all font-bold">
                    {encodedResultToken}
                  </div>
                </div>
              )}
            </div>

            {/* DECODER PANEL */}
            <div className="bg-sky-50/50 p-6 rounded-2xl border border-sky-100 space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileCode className="w-4 h-4 text-sky-600" /> 2. Decode & Inspect Token Payload
              </h4>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Paste Encoded `BLK-TOKEN-...` String</label>
                <input
                  type="text"
                  value={inputTokenToDecode}
                  onChange={(e) => setInputTokenToDecode(e.target.value)}
                  placeholder="Paste BLK-TOKEN-... string here"
                  className="w-full p-3 rounded-xl glass-input font-mono text-xs"
                />
              </div>

              <button
                onClick={handleDecodeClick}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                Decode Token Metadata <Binary className="w-4 h-4" />
              </button>

              {decodedResultOutput && (
                <div className="p-3 bg-white rounded-xl border border-sky-200 space-y-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Decode Status:</span>
                    <span className={`font-bold ${decodedResultOutput.success ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {decodedResultOutput.success ? '✓ VERIFIED ENCODED TOKEN' : '❌ INVALID TOKEN'}
                    </span>
                  </div>
                  {decodedResultOutput.success ? (
                    <pre className="p-3 bg-sky-50 text-sky-900 rounded border border-sky-200 text-[11px] overflow-x-auto">
                      {decodedResultOutput.rawJson}
                    </pre>
                  ) : (
                    <p className="text-rose-600 text-xs">{decodedResultOutput.error}</p>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: BLOCK EXPLORER */}
      {activeAdminTab === 'EXPLORER' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-sky-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-600" /> SHA-256 Blockchain Explorer Stream
              </h3>
              <p className="text-xs text-slate-500">Inspect blocks, Merkle roots, nonces, and cryptographic attendance receipts.</p>
            </div>
            <span className="text-xs font-mono text-sky-800 bg-sky-50 px-3 py-1 rounded border border-sky-200 font-bold">
              Chain Height: #{blockchain.chain.length - 1}
            </span>
          </div>

          <div className="space-y-4">
            {blockchain.chain.map((block, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 border border-sky-100 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-sky-100 border border-sky-200 text-xs font-mono text-sky-900 font-bold">
                    Block #{block.index} {block.index === 0 ? '(Genesis)' : ''}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{block.timestamp}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-2">
                  <p className="text-slate-500 truncate">Hash: <span className="text-slate-900 font-bold">{block.hash}</span></p>
                  <p className="text-slate-500 truncate">Prev Hash: <span className="text-slate-700">{block.prevHash}</span></p>
                  <p className="text-slate-500 truncate">Merkle Root: <span className="text-slate-700">{block.merkleRoot}</span></p>
                  <p className="text-slate-500">Nonce: <span className="text-slate-900 font-bold">{block.nonce}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LEDGER TAMPER AUDITOR */}
      {activeAdminTab === 'LEDGER' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-sky-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" /> Ledger Integrity & Tamper Auditor
              </h3>
              <p className="text-xs text-slate-500">Test cryptographic verification and automatic attack detection.</p>
            </div>
            <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
              blockchain.isTampered ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              {blockchain.isTampered ? '🔴 CORRUPTED BLOCK DETECTED' : '🟢 LEDGER VALIDATED'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAuditChain}
              className="px-4 py-2.5 rounded-xl bg-sky-600 text-white font-mono text-xs font-bold hover:bg-sky-700 shadow-sm"
            >
              Verify Ledger Hashes
            </button>

            {!blockchain.isTampered ? (
              <button
                onClick={handleSimulateTamper}
                disabled={tampering}
                className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-mono text-xs font-bold hover:bg-rose-100"
              >
                Simulate Data Tamper
              </button>
            ) : (
              <button
                onClick={handleRestore}
                disabled={restoring}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-mono text-xs font-bold hover:bg-emerald-700 shadow-sm"
              >
                Restore Chain Integrity
              </button>
            )}
          </div>

          {auditResult && (
            <div className={`p-4 rounded-xl border text-xs font-mono space-y-1 ${
              auditResult.valid ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}>
              {auditResult.reason}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SMART CONTRACT POLICIES */}
      {activeAdminTab === 'POLICIES' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-sky-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-600" /> Institution Smart Contract Rules
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-sky-50/50 border border-sky-100 space-y-3">
              <label className="text-xs font-bold text-slate-900 block">Minimum Attendance Threshold</label>
              <div className="flex items-center gap-3">
                <input 
                  type="range" 
                  min="60" 
                  max="90" 
                  value={minThreshold} 
                  onChange={(e) => setMinThreshold(e.target.value)}
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <span className="text-base font-mono font-bold text-sky-900">{minThreshold}%</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-sky-50/50 border border-sky-100 space-y-3">
              <label className="text-xs font-bold text-slate-900 block">Dynamic QR Code Validity Timer</label>
              <div className="flex items-center gap-3">
                <input 
                  type="range" 
                  min="60" 
                  max="600" 
                  step="60"
                  value={qrDecayTime} 
                  onChange={(e) => setQrDecayTime(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <span className="text-base font-mono font-bold text-sky-900">{Math.floor(qrDecayTime / 60)} Mins</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-sky-50/50 border border-sky-100 space-y-3">
              <label className="text-xs font-bold text-slate-900 block">Proxy Auto-Lock Policy</label>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-600 font-medium">Lock on GPS mismatch</span>
                <button
                  onClick={() => setAutoLockPolicy(!autoLockPolicy)}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-bold ${
                    autoLockPolicy ? 'bg-sky-600 text-white font-bold' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {autoLockPolicy ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT STUDENT */}
      {(isAddStudentOpen || isEditStudentOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg overflow-hidden bg-white rounded-2xl border border-sky-200 shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-sky-100 pb-4 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {isEditStudentOpen ? 'Edit Student Details & Password' : 'Add New Student Record'}
              </h3>
              <button 
                onClick={() => { setIsAddStudentOpen(false); setIsEditStudentOpen(false); }} 
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isEditStudentOpen ? handleUpdateStudent : handleCreateStudent} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Student Name</label>
                <input
                  type="text"
                  required
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  placeholder="e.g. Alex Rivera"
                  className="w-full p-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Roll Number / USN</label>
                  <input
                    type="text"
                    required
                    value={studentForm.rollNumber}
                    onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                    placeholder="e.g. 2024-ISE-042"
                    className="w-full p-2.5 rounded-xl glass-input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Class / Semester</label>
                  <input
                    type="text"
                    required
                    value={studentForm.className}
                    onChange={(e) => setStudentForm({ ...studentForm, className: e.target.value })}
                    placeholder="e.g. 6th Sem ISE A"
                    className="w-full p-2.5 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  placeholder="student@mcehassan.ac.in"
                  className="w-full p-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Account Password (Editable)</label>
                <input
                  type="text"
                  required
                  value={studentForm.password}
                  onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                  placeholder="Create student password"
                  className="w-full p-2.5 rounded-xl glass-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assign Enrolled Subjects</label>
                <div className="grid grid-cols-2 gap-2 bg-sky-50/60 p-3 rounded-xl border border-sky-100">
                  {courses.map(course => (
                    <label key={course.id} className="flex items-center space-x-2 text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={studentForm.enrolledCourses.includes(course.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setStudentForm(prev => ({
                            ...prev,
                            enrolledCourses: checked
                              ? [...prev.enrolledCourses, course.id]
                              : prev.enrolledCourses.filter(cId => cId !== course.id)
                          }));
                        }}
                        className="accent-sky-600 cursor-pointer"
                      />
                      <span className="font-mono text-[11px] font-bold">{course.code}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 transition-all text-xs shadow-md"
              >
                {isEditStudentOpen ? 'Save Student Changes & Password' : 'Create Student Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT TEACHER */}
      {(isAddTeacherOpen || isEditTeacherOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg overflow-hidden bg-white rounded-2xl border border-sky-200 shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-sky-100 pb-4 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {isEditTeacherOpen ? 'Edit Faculty Details & Password' : 'Add New Faculty Member'}
              </h3>
              <button 
                onClick={() => { setIsAddTeacherOpen(false); setIsEditTeacherOpen(false); }} 
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isEditTeacherOpen ? handleUpdateTeacher : handleCreateTeacher} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Faculty Full Name</label>
                <input
                  type="text"
                  required
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  placeholder="e.g. Dr. Evelyn Wright"
                  className="w-full p-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Faculty ID</label>
                  <input
                    type="text"
                    required
                    value={teacherForm.id}
                    onChange={(e) => setTeacherForm({ ...teacherForm, id: e.target.value })}
                    placeholder="e.g. TCH-001"
                    className="w-full p-2.5 rounded-xl glass-input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={teacherForm.designation}
                    onChange={(e) => setTeacherForm({ ...teacherForm, designation: e.target.value })}
                    placeholder="e.g. Professor & HOD"
                    className="w-full p-2.5 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={teacherForm.email}
                  onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                  placeholder="faculty@mcehassan.ac.in"
                  className="w-full p-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Account Password (Editable)</label>
                <input
                  type="text"
                  required
                  value={teacherForm.password}
                  onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                  placeholder="Create faculty password"
                  className="w-full p-2.5 rounded-xl glass-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assign Teaching Subjects</label>
                <div className="grid grid-cols-2 gap-2 bg-sky-50/60 p-3 rounded-xl border border-sky-100">
                  {courses.map(course => (
                    <label key={course.id} className="flex items-center space-x-2 text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={teacherForm.assignedCourses.includes(course.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setTeacherForm(prev => ({
                            ...prev,
                            assignedCourses: checked
                              ? [...prev.assignedCourses, course.id]
                              : prev.assignedCourses.filter(cId => cId !== course.id)
                          }));
                        }}
                        className="accent-sky-600 cursor-pointer"
                      />
                      <span className="font-mono text-[11px] font-bold">{course.code} ({course.name})</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 transition-all text-xs shadow-md"
              >
                {isEditTeacherOpen ? 'Save Faculty Changes & Password' : 'Create Faculty Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SUBJECT */}
      {(isAddSubjectOpen || isEditSubjectOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg overflow-hidden bg-white rounded-2xl border border-sky-200 shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-sky-100 pb-4 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {isEditSubjectOpen ? 'Edit Subject Details' : 'Add New Subject'}
              </h3>
              <button 
                onClick={() => { setIsAddSubjectOpen(false); setIsEditSubjectOpen(false); }} 
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isEditSubjectOpen ? handleUpdateSubject : handleCreateSubject} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    placeholder="e.g. CS-501"
                    className="w-full p-2.5 rounded-xl glass-input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Class / Semester</label>
                  <input
                    type="text"
                    required
                    value={subjectForm.className}
                    onChange={(e) => setSubjectForm({ ...subjectForm, className: e.target.value })}
                    placeholder="e.g. 6th Sem ISE A"
                    className="w-full p-2.5 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Subject Title / Name</label>
                <input
                  type="text"
                  required
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="e.g. Applied Blockchain Systems"
                  className="w-full p-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assign Faculty Instructor</label>
                <select
                  value={subjectForm.instructorId}
                  onChange={(e) => setSubjectForm({ ...subjectForm, instructorId: e.target.value })}
                  className="w-full p-2.5 rounded-xl glass-input text-xs font-medium text-slate-900 bg-white border border-sky-200"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id} className="bg-white text-slate-900">
                      {t.name} ({t.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Schedule</label>
                  <input
                    type="text"
                    required
                    value={subjectForm.schedule}
                    onChange={(e) => setSubjectForm({ ...subjectForm, schedule: e.target.value })}
                    placeholder="Mon/Wed 09:30 AM"
                    className="w-full p-2.5 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Classroom / Room</label>
                  <input
                    type="text"
                    required
                    value={subjectForm.room}
                    onChange={(e) => setSubjectForm({ ...subjectForm, room: e.target.value })}
                    placeholder="Lab 402"
                    className="w-full p-2.5 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 transition-all text-xs shadow-md"
              >
                {isEditSubjectOpen ? 'Save Subject Changes' : 'Create New Subject'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

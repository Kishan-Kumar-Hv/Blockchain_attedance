// Institutional Production Database Module
// Department of Information Science & Engineering (ISE), MCE Hassan

export function getInitials(name = '') {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Initial Institutional Database (Admin only, 0 pre-existing students or teachers)
export const INITIAL_STUDENTS = [];
export const INITIAL_TEACHERS = [];
export const INITIAL_COURSES = [];

export const MOCK_SEED_BLOCKS = [];

export function generateTestRoster() {
  const names = [
    'Alex Rivera', 'Evelyn Wright', 'Marcus Chen', 'Sophia Sharma', 'Liam Vance',
    'Olivia Rao', 'Noah Kulkarni', 'Ava Deshmukh', 'Ethan Gowda', 'Isabella Bhat'
  ];

  return names.map((name, idx) => {
    const pad = (idx + 1).toString().padStart(3, '0');
    return {
      id: `STU-${pad}`,
      name,
      rollNumber: `2024-ISE-${pad}`,
      email: `${name.toLowerCase().replace(' ', '.')}@mcehassan.ac.in`,
      department: 'Information Science & Engg',
      className: '6th Sem ISE A',
      password: `password${idx + 1}`,
      enrolledCourses: [],
      faceBiometricHash: `0x7f${(idx * 9999999).toString(16).padEnd(10, '0')}`,
      initials: getInitials(name),
      attendanceRate: 0.0
    };
  });
}

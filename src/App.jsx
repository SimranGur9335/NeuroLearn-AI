import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StudentProvider } from './context/StudentContext';
import PlatformLayout from './components/PlatformLayout';
import TeacherLayout from './components/TeacherLayout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import InstitutionRequests from "./pages/platform-admin/InstitutionRequests";

// Public & Selection Pages
import LandingPage from './pages/LandingPage';
import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Student Portal Pages
import Dashboard from './pages/Dashboard';
import LearningDomains from './pages/LearningDomains';
import Roadmap from './pages/Roadmap';
import Quiz from './pages/Quiz';
import Analytics from './pages/Analytics';
import CareerGuidance from './pages/CareerGuidance';
import Leaderboard from './pages/Leaderboard';

// Student Portal AI Module Pages
import AiMentorChat from './pages/ai/AiMentorChat';
import PerformancePrediction from './pages/ai/PerformancePrediction';
import EmotionAnalysis from './pages/ai/EmotionAnalysis';
import RecommendationEngine from './pages/ai/RecommendationEngine';

// Teacher Portal Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentPerformance from './pages/teacher/StudentPerformance';
import TeacherAnalytics from './pages/teacher/TeacherAnalytics';
import RiskPrediction from './pages/teacher/RiskPrediction';
import AttendanceTracking from './pages/teacher/AttendanceTracking';
import ClassSelection from './pages/teacher/ClassSelection';
import TeacherAnnouncement from "./pages/teacher/TeacherAnnouncement";
import AssignmentManagement from "./pages/teacher/AssignmentManagement";
import MarksGradebook from "./pages/teacher/MarksGradebook";

// Admin Portal Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseManagement from './pages/admin/CourseManagement';
import SubjectManagement from "./pages/admin/SubjectManagement";
import AdminReports from './pages/admin/AdminReports';
import SystemMonitoring from './pages/admin/SystemMonitoring';
import SecurityCenter from './pages/admin/SecurityCenter';
import FacultyMapping from "./pages/admin/FacultyMapping";
import StudentProfile from './pages/admin/StudentProfile';
import FacultyProfile from './pages/admin/FacultyProfile';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import ClassManagement from './pages/admin/ClassManagement';
import EnrollmentManagement from './pages/admin/EnrollmentManagement';
import CourseSubjectMapping from './pages/admin/CourseSubjectMapping';
import AnnouncementCenter from './pages/admin/AnnouncementCenter';
import AcademicStructure from './pages/admin/AcademicStructure';
import FacultyWorkload from './pages/admin/FacultyWorkload';
import AuditLogs from './pages/admin/AuditLogs';
import AdminSettings from './pages/admin/AdminSettings';


function App() {
  return (
    <AuthProvider>
      <StudentProvider>
        <Router>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Authentication Screens */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Role Selection Screen */}
            <Route path="/select-role" element={<RoleSelection />} />

            {/* Student Portal Layout & Routes */}
            <Route element={
              <ProtectedRoute allowedRoles={['student']}>
                <PlatformLayout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/domains" element={<LearningDomains />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/career" element={<CareerGuidance />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<Profile />} />

              {/* AI Module nested routes */}
              <Route path="/ai/chat" element={<AiMentorChat />} />
              <Route path="/ai/predictions" element={<PerformancePrediction />} />
              <Route path="/ai/emotions" element={<EmotionAnalysis />} />
              <Route path="/ai/recommendations" element={<RecommendationEngine />} />
            </Route>

            {/* Class Selection Page */}
            <Route
              path="/teacher/select-class"
              element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <ClassSelection />
                </ProtectedRoute>
              }
            />

            {/* Teacher Portal Layout & Routes */}
            <Route element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <TeacherLayout />
              </ProtectedRoute>
            }>
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/performance" element={<StudentPerformance />} />
              <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
              <Route path="/teacher/risk" element={<RiskPrediction />} />
              <Route path="/teacher/attendance" element={<AttendanceTracking />} />
              <Route path="teacher/teacherAnnouncement" element={<TeacherAnnouncement />} />
              <Route path="/teacher/assignments" element={<AssignmentManagement />} />
              <Route path="/teacher/gradebook" element={<MarksGradebook />} />
            </Route>

            {/* Admin Portal Layout & Routes */}
            <Route element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/courses" element={<CourseManagement />} />
              <Route path="/admin/subjects" element={<SubjectManagement />}/>
              <Route path="/admin/faculty-mapping" element={<FacultyMapping />}/>
              <Route path="/admin/students/:id" element={<StudentProfile />} />
              <Route path="/admin/faculty/:id" element={<FacultyProfile />} />
              <Route path="/admin/departments" element={<DepartmentManagement />} />
              <Route path="/admin/classes" element={<ClassManagement />} />
              <Route path="/admin/enrollments" element={<EnrollmentManagement />} />
              <Route path="/admin/course-subject" element={<CourseSubjectMapping />} />
              <Route path="/admin/announcements" element={<AnnouncementCenter />} />
              <Route path="/admin/academic-structure" element={<AcademicStructure />} />
              <Route path="/admin/workload" element={<FacultyWorkload />} />
              <Route path="/admin/audit-logs" element={<AuditLogs />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/system" element={<SystemMonitoring />} />
              <Route path="/admin/security" element={<SecurityCenter />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />

            {/* Platform Admin Routes */}
            <Route
              path="/platform-admin/requests"
              element={<InstitutionRequests />}
            />
          </Routes>
        </Router>
      </StudentProvider>
    </AuthProvider>

    
  );
  
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BrandingProvider } from './context/BrandingContext';
import { StudentProvider } from './context/StudentContext';
import PlatformLayout from './components/PlatformLayout';
import FacultyLayout from './components/TeacherLayout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PlatformAdminLayout from './components/PlatformAdminLayout';
import InstitutionRequests from "./pages/platform-admin/InstitutionRequests";
import PlatformDashboard from './pages/platform-admin/Dashboard';
import PlatformInstitutions from './pages/platform-admin/Institutions';
import PlatformUsers from './pages/platform-admin/Users';
import PlatformSettings from './pages/platform-admin/Settings';

// Public & Selection Pages
import LandingPage from './pages/LandingPage';
import RoleSelection from './pages/RoleSelection';
import SelectInstitution from './pages/SelectInstitution';
import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import Profile from './pages/Profile';
import ApplyInstitution from './pages/ApplyInstitution';

// Student Portal Pages
import Dashboard from './pages/Dashboard';
import LearningDomains from './pages/LearningDomains';
import DomainDetail from './pages/domains/DomainDetail';
import Roadmap from './pages/Roadmap';
import Quiz from './pages/Quiz';
import Analytics from './pages/Analytics';
import CareerGuidance from './pages/CareerGuidance';
import Leaderboard from './pages/Leaderboard';

// Career Journey Module Pages
import CareerDashboard from './pages/career/CareerDashboard';
import CareerProfile from './pages/career/CareerProfile';
import ExploreCareers from './pages/career/careers/ExploreCareers';
import CareerDetail from './pages/career/careers/CareerDetail';
import CareerRoadmap from './pages/career/CareerRoadmap';
import SkillsList from './pages/career/skills/SkillsList';
import SkillDetail from './pages/career/skills/SkillDetail';
import ProjectStudio from './pages/career/projects/ProjectStudio';
import ProjectDetail from './pages/career/projects/ProjectDetail';
import CompaniesList from './pages/career/companies/CompaniesList';
import CertificationsList from './pages/career/certifications/CertificationsList';
import ResumeReview from './pages/career/resume/ResumeReview';
import InterviewPractice from './pages/career/interview/InterviewPractice';
import PlacementPrep from './pages/career/placement/PlacementPrep';
import LearningHub from './pages/career/learning/LearningHub';
import SalaryInsights from './pages/career/salary/SalaryInsights';
import TechTrends from './pages/career/trends/TechTrends';

// Student Portal AI Module Pages
import AiMentorChat from './pages/ai/AiMentorChat';
import EmotionAnalysis from './pages/ai/EmotionAnalysis';

// Student Hub Pages
import StudentHubHome from './pages/student-hub/StudentHubHome';
import CoursesPage from './pages/student-hub/CoursesPage';
import AssignmentsPage from './pages/student-hub/AssignmentsPage';
import AttendancePage from './pages/student-hub/AttendancePage';
import GradesPage from './pages/student-hub/GradesPage';
import AnnouncementsPage from './pages/student-hub/AnnouncementsPage';
import CalendarPage from './pages/student-hub/CalendarPage';
import PredictionsPage from './pages/student-hub/PredictionsPage';
import CollegeNotes from './pages/student-hub/CollegeNotes';
import ProgrammingHub from './pages/student-hub/ProgrammingHub';

// Faculty Portal Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import StudentPerformance from './pages/faculty/StudentPerformance';
import FacultyAnalytics from './pages/faculty/FacultyAnalytics';
import RiskPrediction from './pages/faculty/RiskPrediction';
import AttendanceTracking from './pages/faculty/AttendanceTracking';
import ClassSelection from './pages/faculty/ClassSelection';
import FacultyAnnouncement from "./pages/faculty/FacultyAnnouncement";
import AssignmentManagement from "./pages/faculty/AssignmentManagement";
import MarksGradebook from "./pages/faculty/MarksGradebook";
import RemedialSessions from "./pages/faculty/RemedialSessions";
import FacultySelfProfile from './pages/faculty/FacultyProfile';
import FacultyActivityStream from './pages/faculty/FacultyActivityStream';

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
      <BrandingProvider>
        <StudentProvider>
        <Router>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Authentication Screens */}
            <Route path="/login" element={<Login />} />
            <Route path="/select-institution" element={<SelectInstitution />} />
            <Route path="/register" element={<Register />} />
            <Route path="/apply-institution" element={<ApplyInstitution />} />
            <Route path="/change-password" element={
              <ProtectedRoute allowedRoles={['student', 'faculty', 'admin', 'super_admin']}>
                <ChangePassword />
              </ProtectedRoute>
            } />

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
              <Route path="/domains/:domainKey" element={<DomainDetail />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/analytics" element={<Analytics />} />
              
              {/* Career Journey Routes */}
              <Route path="/career" element={<CareerDashboard />} />
              <Route path="/career/profile" element={<CareerProfile />} />
              <Route path="/career/explore" element={<ExploreCareers />} />
              <Route path="/career/explore/:careerId" element={<CareerDetail />} />
              <Route path="/career/roadmap" element={<CareerRoadmap />} />
              <Route path="/career/skills" element={<SkillsList />} />
              <Route path="/career/skills/:skillId" element={<SkillDetail />} />
              <Route path="/career/projects" element={<ProjectStudio />} />
              <Route path="/career/projects/:projectId" element={<ProjectDetail />} />
              <Route path="/career/companies" element={<CompaniesList />} />
              <Route path="/career/certifications" element={<CertificationsList />} />
              <Route path="/career/resume" element={<ResumeReview />} />
              <Route path="/career/interview" element={<InterviewPractice />} />
              <Route path="/career/placement" element={<PlacementPrep />} />
              <Route path="/career/learning" element={<LearningHub />} />
              <Route path="/career/salary" element={<SalaryInsights />} />
              <Route path="/career/trends" element={<TechTrends />} />
              <Route path="/career/legacy-guidance" element={<CareerGuidance />} />

              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<Profile />} />

              {/* AI Module nested routes */}
              <Route path="/ai/chat" element={<AiMentorChat />} />
              <Route path="/ai/emotions" element={<EmotionAnalysis />} />

              {/* Student Hub Routes */}
              <Route path="/student-hub" element={<StudentHubHome />} />
              <Route path="/student-hub/courses" element={<CoursesPage />} />
              <Route path="/student-hub/notes" element={<CollegeNotes />} />
              <Route path="/student-hub/programming" element={<ProgrammingHub />} />
              <Route path="/student-hub/assignments" element={<AssignmentsPage />} />
              <Route path="/student-hub/attendance" element={<AttendancePage />} />
              <Route path="/student-hub/grades" element={<GradesPage />} />
              <Route path="/student-hub/announcements" element={<AnnouncementsPage />} />
              <Route path="/student-hub/calendar" element={<CalendarPage />} />
              <Route path="/student-hub/predictions" element={<PredictionsPage />} />
            </Route>

            {/* Class Selection Page */}
            <Route
              path="/faculty/select-class"
              element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <ClassSelection />
                </ProtectedRoute>
              }
            />

            {/* Faculty Portal Layout & Routes */}
            <Route element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyLayout />
              </ProtectedRoute>
            }>
              <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
              <Route path="/faculty/performance" element={<StudentPerformance />} />
              <Route path="/faculty/analytics" element={<FacultyAnalytics />} />
              <Route path="/faculty/risk" element={<RiskPrediction />} />
              <Route path="/faculty/attendance" element={<AttendanceTracking />} />
              <Route path="/faculty/announcements" element={<FacultyAnnouncement />} />
              <Route path="/faculty/assignments" element={<AssignmentManagement />} />
              <Route path="/faculty/gradebook" element={<MarksGradebook />} />
              <Route path="/faculty/remedial" element={<RemedialSessions />} />
              <Route path="/faculty/profile" element={<FacultySelfProfile />} />
              <Route path="/faculty/activity" element={<FacultyActivityStream />} />

            </Route>

            {/* Admin Portal Layout & Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />

              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="courses" element={<CourseManagement />} />
              <Route path="subjects" element={<SubjectManagement />} />
              <Route path="faculty-mapping" element={<FacultyMapping />} />
              <Route path="departments" element={<DepartmentManagement />} />
              <Route path="classes" element={<ClassManagement />} />
              <Route path="enrollments" element={<EnrollmentManagement />} />
              <Route path="course-subject" element={<CourseSubjectMapping />} />
              <Route path="announcements" element={<AnnouncementCenter />} />
              <Route path="academic-structure" element={<AcademicStructure />} />
              <Route path="workload" element={<FacultyWorkload />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="system" element={<SystemMonitoring />} />
              <Route path="security" element={<SecurityCenter />} />

              <Route path="students/:id" element={<StudentProfile />} />
              <Route path="faculty/:id" element={<FacultyProfile />} />
            </Route>

            {/* Platform Admin Layout & Routes */}
            <Route element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <PlatformAdminLayout />
              </ProtectedRoute>
            }>
              <Route path="/platform-admin/dashboard" element={<PlatformDashboard />} />
              <Route path="/platform-admin/requests" element={<InstitutionRequests />} />
              <Route path="/platform-admin/institutions" element={<PlatformInstitutions />} />
              <Route path="/platform-admin/users" element={<PlatformUsers />} />
              <Route path="/platform-admin/settings" element={<PlatformSettings />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </StudentProvider>
      </BrandingProvider>
    </AuthProvider>


  );

}

export default App;

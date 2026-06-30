import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BrandingProvider } from './context/BrandingContext';
import { StudentProvider } from './context/StudentContext';
import PlatformLayout from './components/PlatformLayout';
import FacultyLayout from './components/TeacherLayout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PlatformAdminLayout from './components/PlatformAdminLayout';
const InstitutionRequests = lazy(() => import('./pages/platform-admin/InstitutionRequests'));
const PlatformDashboard = lazy(() => import('./pages/platform-admin/Dashboard'));
const PlatformInstitutions = lazy(() => import('./pages/platform-admin/Institutions'));
const PlatformUsers = lazy(() => import('./pages/platform-admin/Users'));
const PlatformSettings = lazy(() => import('./pages/platform-admin/Settings'));

// Public & Selection Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const RoleSelection = lazy(() => import('./pages/RoleSelection'));
const SelectInstitution = lazy(() => import('./pages/SelectInstitution'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const Profile = lazy(() => import('./pages/Profile'));
const ApplyInstitution = lazy(() => import('./pages/ApplyInstitution'));

// Student Portal Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LearningDomains = lazy(() => import('./pages/LearningDomains'));
const DomainDetail = lazy(() => import('./pages/domains/DomainDetail'));
const Roadmap = lazy(() => import('./pages/Roadmap'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Analytics = lazy(() => import('./pages/Analytics'));
const CareerGuidance = lazy(() => import('./pages/CareerGuidance'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));

// Career Journey Module Pages
const CareerDashboard = lazy(() => import('./pages/career/CareerDashboard'));
const CareerProfile = lazy(() => import('./pages/career/CareerProfile'));
const ExploreCareers = lazy(() => import('./pages/career/careers/ExploreCareers'));
const CareerDetail = lazy(() => import('./pages/career/careers/CareerDetail'));
const CareerRoadmap = lazy(() => import('./pages/career/CareerRoadmap'));
const SkillsList = lazy(() => import('./pages/career/skills/SkillsList'));
const SkillDetail = lazy(() => import('./pages/career/skills/SkillDetail'));
const ProjectStudio = lazy(() => import('./pages/career/projects/ProjectStudio'));
const ProjectDetail = lazy(() => import('./pages/career/projects/ProjectDetail'));
const CompaniesList = lazy(() => import('./pages/career/companies/CompaniesList'));
const CertificationsList = lazy(() => import('./pages/career/certifications/CertificationsList'));
const ResumeReview = lazy(() => import('./pages/career/resume/ResumeReview'));
const InterviewPractice = lazy(() => import('./pages/career/interview/InterviewPractice'));
const PlacementPrep = lazy(() => import('./pages/career/placement/PlacementPrep'));
const LearningHub = lazy(() => import('./pages/career/learning/LearningHub'));
const SalaryInsights = lazy(() => import('./pages/career/salary/SalaryInsights'));
const TechTrends = lazy(() => import('./pages/career/trends/TechTrends'));

// Student Portal AI Module Pages
const AiMentorChat = lazy(() => import('./pages/ai/AiMentorChat'));
const LearningWellness = lazy(() => import('./pages/ai/LearningWellness'));

// Student Hub Pages
const StudentHubHome = lazy(() => import('./pages/student-hub/StudentHubHome'));
const CoursesPage = lazy(() => import('./pages/student-hub/CoursesPage'));
const AssignmentsPage = lazy(() => import('./pages/student-hub/AssignmentsPage'));
const AttendancePage = lazy(() => import('./pages/student-hub/AttendancePage'));
const GradesPage = lazy(() => import('./pages/student-hub/GradesPage'));
const AnnouncementsPage = lazy(() => import('./pages/student-hub/AnnouncementsPage'));
const CalendarPage = lazy(() => import('./pages/student-hub/CalendarPage'));
const PredictionsPage = lazy(() => import('./pages/student-hub/PredictionsPage'));
const CollegeNotes = lazy(() => import('./pages/student-hub/CollegeNotes'));
const ProgrammingHub = lazy(() => import('./pages/student-hub/ProgrammingHub'));

// Faculty Portal Pages
const FacultyDashboard = lazy(() => import('./pages/faculty/FacultyDashboard'));
const StudentPerformance = lazy(() => import('./pages/faculty/StudentPerformance'));
const FacultyAnalytics = lazy(() => import('./pages/faculty/FacultyAnalytics'));
const RiskPrediction = lazy(() => import('./pages/faculty/RiskPrediction'));
const AttendanceTracking = lazy(() => import('./pages/faculty/AttendanceTracking'));
const ClassSelection = lazy(() => import('./pages/faculty/ClassSelection'));
const FacultyAnnouncement = lazy(() => import('./pages/faculty/FacultyAnnouncement'));
const AssignmentManagement = lazy(() => import('./pages/faculty/AssignmentManagement'));
const MarksGradebook = lazy(() => import('./pages/faculty/MarksGradebook'));
const RemedialSessions = lazy(() => import('./pages/faculty/RemedialSessions'));
const FacultySelfProfile = lazy(() => import('./pages/faculty/FacultyProfile'));
const FacultyActivityStream = lazy(() => import('./pages/faculty/FacultyActivityStream'));

// Admin Portal Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const CourseManagement = lazy(() => import('./pages/admin/CourseManagement'));
const SubjectManagement = lazy(() => import('./pages/admin/SubjectManagement'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const SystemMonitoring = lazy(() => import('./pages/admin/SystemMonitoring'));
const SecurityCenter = lazy(() => import('./pages/admin/SecurityCenter'));
const FacultyMapping = lazy(() => import('./pages/admin/FacultyMapping'));
const StudentProfile = lazy(() => import('./pages/admin/StudentProfile'));
const FacultyProfile = lazy(() => import('./pages/admin/FacultyProfile'));
const DepartmentManagement = lazy(() => import('./pages/admin/DepartmentManagement'));
const ClassManagement = lazy(() => import('./pages/admin/ClassManagement'));
const EnrollmentManagement = lazy(() => import('./pages/admin/EnrollmentManagement'));
const CourseSubjectMapping = lazy(() => import('./pages/admin/CourseSubjectMapping'));
const AnnouncementCenter = lazy(() => import('./pages/admin/AnnouncementCenter'));
const AcademicStructure = lazy(() => import('./pages/admin/AcademicStructure'));
const FacultyWorkload = lazy(() => import('./pages/admin/FacultyWorkload'));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));


function App() {
  return (
    <AuthProvider>
      <BrandingProvider>
        <StudentProvider>
        <Router>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
              <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          }>
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
              <Route path="/ai/wellness" element={<LearningWellness />} />

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
          </Suspense>
        </Router>
      </StudentProvider>
      </BrandingProvider>
    </AuthProvider>


  );

}

export default App;

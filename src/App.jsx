import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StudentProvider } from './context/StudentContext';
import PlatformLayout from './components/PlatformLayout';
import TeacherLayout from './components/TeacherLayout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

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

// Admin Portal Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseManagement from './pages/admin/CourseManagement';
import AdminReports from './pages/admin/AdminReports';
import SystemMonitoring from './pages/admin/SystemMonitoring';
import SecurityCenter from './pages/admin/SecurityCenter';

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

            {/* Teacher Portal Layout & Routes */}
            <Route element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherLayout />
              </ProtectedRoute>
            }>
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/performance" element={<StudentPerformance />} />
              <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
              <Route path="/teacher/risk" element={<RiskPrediction />} />
              <Route path="/teacher/attendance" element={<AttendanceTracking />} />
              
              {/* Reused AI chat for faculty support */}
              <Route path="/teacher/ai-chat" element={<AiMentorChat />} />
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
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/system" element={<SystemMonitoring />} />
              <Route path="/admin/security" element={<SecurityCenter />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </StudentProvider>
    </AuthProvider>
  );
}

export default App;

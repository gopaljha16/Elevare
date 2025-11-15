import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

import DashboardPage from './pages/DashboardPage';
import DemoPage from './pages/DemoPage';
import HealthCheck from './components/HealthCheck';
import InterviewPrep from './pages/InterviewPrep';
import InterviewPrepPlanner from './components/interview/InterviewPrepPlanner';
import InterviewPlannerDemoPage from './pages/InterviewPlannerDemoPage';
import ComprehensiveDashboard from './components/dashboard/ComprehensiveDashboard';
import ATSAnalyzerPage from './pages/ATSAnalyzerPage';
import LearningPathsPage from './pages/LearningPathsPage';
import LearningPathDetailPage from './pages/LearningPathDetailPage';
import LearningDashboardPage from './pages/LearningDashboardPage';
import AdminPathCreatorPage from './pages/AdminPathCreatorPage';
import PortfolioBuilder from './pages/PortfolioBuilder';
import AIPortfolioBuilder from './pages/AIPortfolioBuilder';
import PortfolioDashboard from './pages/PortfolioDashboard';
import PortfolioTemplates from './components/PortfolioTemplates';
import PortfolioPreview from './pages/PortfolioPreview';
import ResumeBuilder from './pages/ResumeBuilder';
import ResumeDashboard from './pages/ResumeDashboard';
import ProfilePage from './pages/ProfilePage';
import GoogleCallback from './components/auth/GoogleCallback';
import ModernDashboard from './components/dashboard/ModernDashboard';


// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="App">
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/interview-planner-demo" element={<InterviewPlannerDemoPage />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
          />

          <Route path="/auth/callback" element={<GoogleCallback />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ModernDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-prep"
            element={
              <ProtectedRoute>
                <InterviewPrep />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-planner"
            element={
              <ProtectedRoute>
                <InterviewPrepPlanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/career-dashboard"
            element={
              <ProtectedRoute>
                <ComprehensiveDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ats-analyzer"
            element={
              <ProtectedRoute>
                <ATSAnalyzerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning-paths"
            element={
              <ProtectedRoute>
                <LearningPathsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning-paths/:pathId"
            element={
              <ProtectedRoute>
                <LearningPathDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning-dashboard"
            element={
              <ProtectedRoute>
                <LearningDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/learning-paths/create"
            element={
              <ProtectedRoute>
                <AdminPathCreatorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio-builder"
            element={
              <ProtectedRoute>
                <PortfolioBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-portfolio-builder"
            element={
              <ProtectedRoute>
                <AIPortfolioBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio-dashboard"
            element={
              <ProtectedRoute>
                <PortfolioDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio-templates"
            element={
              <ProtectedRoute>
                <PortfolioTemplates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio/preview/:id"
            element={
              <ProtectedRoute>
                <PortfolioPreview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-builder"
            element={
              <ProtectedRoute>
                <ResumeBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-dashboard"
            element={
              <ProtectedRoute>
                <ResumeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Health Check Route (for development) */}
          <Route
            path="/health"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-2xl w-full">
                  <HealthCheck />
                </div>
              </div>
            }
          />

          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import EnhancedResumeBuilder from '../components/resume/EnhancedResumeBuilder';
import { resumeService } from '../services/resumeService';
import { useToast } from '../components/ui/Toast';
import ErrorBoundary from '../components/common/ErrorBoundary';
import LoadingSpinner from '../components/ui/LoadingSpinner';

/**
 * Enhanced Resume Builder Page
 * 
 * Main page component for the AI-powered resume builder
 * Handles loading existing resumes and navigation
 */
const EnhancedResumeBuilderPage = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [initialResumeData, setInitialResumeData] = useState(null);
  const [loadError, setLoadError] = useState(null);

  // Load existing resume if resumeId is provided
  useEffect(() => {
    const loadResume = async () => {
      if (!resumeId) return;

      setIsLoading(true);
      setLoadError(null);

      try {
        const resumeData = await resumeService.getResume(resumeId);
        setInitialResumeData(resumeData);
        success('Resume loaded successfully');
      } catch (err) {
        console.error('Failed to load resume:', err);
        setLoadError(err.message);
        error('Failed to load resume: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadResume();
  }, [resumeId, success, error]);

  // Handle navigation back to dashboard
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Handle navigation to resume list
  const handleViewResumes = () => {
    navigate('/resumes');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <LoadingSpinner size="lg" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              Loading Resume Builder
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {resumeId ? 'Loading your resume...' : 'Initializing AI-powered resume builder...'}
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto p-6"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load Resume
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {loadError}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={handleBackToDashboard}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
              
              <button
                onClick={handleViewResumes}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                View All Resumes
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main resume builder
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-center min-h-screen">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-md mx-auto p-6"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Resume Builder Error
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Something went wrong with the resume builder. Please try refreshing the page or contact support if the issue persists.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh Page
                </button>
                
                <button
                  onClick={handleBackToDashboard}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      }
    >
      <EnhancedResumeBuilder initialData={initialResumeData} />
    </ErrorBoundary>
  );
};

export default EnhancedResumeBuilderPage;
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ATSUploadSection from '../components/ats/ATSUploadSection';
import ATSResultsSection from '../components/ats/ATSResultsSection';
import ATSScoreBreakdown from '../components/ats/ATSScoreBreakdown';
import ATSSuggestions from '../components/ats/ATSSuggestions';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const ATSAnalyzerPage = () => {
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
    setIsAnalyzing(false);
  };

  const handleNewAnalysis = () => {
    setAnalysisData(null);
    setUploadedFile(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    ATS Score Analyzer
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Upload your resume and get instant ATS compatibility analysis
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!analysisData ? (
          /* Upload Section */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ATSUploadSection
              onAnalysisStart={() => setIsAnalyzing(true)}
              onAnalysisComplete={handleAnalysisComplete}
              isAnalyzing={isAnalyzing}
              uploadedFile={uploadedFile}
              setUploadedFile={setUploadedFile}
            />
          </motion.div>
        ) : (
          /* Results Section */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Analysis Results
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Your resume has been analyzed for ATS compatibility
                </p>
              </div>
              <Button
                onClick={handleNewAnalysis}
                variant="outline"
                className="flex items-center gap-2"
              >
                <SparklesIcon className="w-4 h-4" />
                Analyze New Resume
              </Button>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Score */}
              <div className="lg:col-span-1">
                <ATSResultsSection analysisData={analysisData} />
              </div>

              {/* Breakdown & Suggestions */}
              <div className="lg:col-span-2 space-y-6">
                <ATSScoreBreakdown analysisData={analysisData} />
                <ATSSuggestions analysisData={analysisData} />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ATSAnalyzerPage;
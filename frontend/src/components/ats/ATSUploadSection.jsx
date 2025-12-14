import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../ui/Toast';
import UpgradePrompt, { CreditDisplay } from '../subscription/UpgradePrompt';

const ATSUploadSection = ({
  onAnalysisStart,
  onAnalysisComplete,
  isAnalyzing,
  uploadedFile,
  setUploadedFile
}) => {
  const [pastedText, setPastedText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [showJobMatch, setShowJobMatch] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'text'
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [creditInfo, setCreditInfo] = useState({ remaining: 5, total: 5 });
  const { success: showSuccess, error: showError } = useToast();

  // Fetch credit info on mount
  React.useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch('/api/subscriptions/usage', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          const data = await response.json();
          setCreditInfo({
            remaining: data.data?.aiCredits?.remaining || 0,
            total: data.data?.aiCredits?.total || 5,
            plan: data.data?.plan || 'free'
          });
        }
      } catch (err) {
        console.error('Failed to fetch credits:', err);
      }
    };
    fetchCredits();
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setUploadMethod('file');
      showSuccess('File uploaded successfully!');
    }
  }, [setUploadedFile, showSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleAnalyze = async () => {
    if (!uploadedFile && !pastedText.trim()) {
      showError('Please upload a file or paste your resume text');
      return;
    }

    // Check credits before starting (ATS analysis costs 2 credits)
    if (creditInfo.remaining < 2 && creditInfo.plan !== 'enterprise') {
      setShowUpgradePrompt(true);
      return;
    }

    console.log('🔍 Starting ATS Analysis:', {
      method: uploadMethod,
      hasFile: !!uploadedFile,
      textLength: pastedText.length,
      fileName: uploadedFile?.name,
      hasJobDescription: !!jobDescription.trim()
    });

    onAnalysisStart();

    try {
      let analysisData;
      let response;

      // Use V2 API for enhanced analysis
      if (uploadMethod === 'file' && uploadedFile) {
        // Handle file upload
        const formData = new FormData();
        formData.append('resume', uploadedFile);
        if (jobDescription.trim()) {
          formData.append('jobDescription', jobDescription);
        }

        console.log('📤 Making file upload request to V2 API...');
        response = await fetch('/api/ats/v2/analyze-file', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
      } else {
        // Handle text paste
        console.log('📤 Making text analysis request to V2 API...');
        response = await fetch('/api/ats/v2/analyze-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ 
            resumeText: pastedText,
            jobDescription: jobDescription.trim() || undefined
          })
        });
      }

      console.log('📥 Analysis response:', response.status, response.statusText);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        analysisData = await response.json();
        console.log('📊 Analysis data:', analysisData);
      } else {
        const textResponse = await response.text();
        console.error('❌ Non-JSON response:', textResponse);
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
      }

      // Handle credit limit errors
      if (response.status === 403 && analysisData.error?.code === 'INSUFFICIENT_CREDITS') {
        setCreditInfo({
          remaining: analysisData.error.creditsRemaining || 0,
          total: analysisData.error.creditsTotal || 5,
          plan: creditInfo.plan
        });
        setShowUpgradePrompt(true);
        onAnalysisComplete(null);
        return;
      }

      if (response.ok && analysisData.success) {
        // Update credit display
        setCreditInfo(prev => ({
          ...prev,
          remaining: Math.max(0, prev.remaining - 2)
        }));
        onAnalysisComplete(analysisData.data);
        showSuccess('Analysis completed successfully!');
      } else {
        const errorMessage = analysisData.error?.message || `Server error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      showError(error.message || 'Failed to analyze resume. Please try again.');
      onAnalysisComplete(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
        >
          <SparklesIcon className="w-8 h-8 text-white" />
        </motion.div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Get Your ATS Score Instantly
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Upload your resume or paste the content to get detailed ATS compatibility analysis
            with actionable suggestions for improvement.
          </p>
        </div>
      </div>

      {/* Method Selection */}
      <div className="flex justify-center gap-4 mb-6">
        <Button
          variant={uploadMethod === 'file' ? 'primary' : 'outline'}
          onClick={() => setUploadMethod('file')}
          className="flex items-center gap-2"
        >
          <DocumentTextIcon className="w-4 h-4" />
          Upload File
        </Button>
        <Button
          variant={uploadMethod === 'text' ? 'primary' : 'outline'}
          onClick={() => setUploadMethod('text')}
          className="flex items-center gap-2"
        >
          <ClipboardDocumentIcon className="w-4 h-4" />
          Paste Text
        </Button>
      </div>

      {/* Upload Methods */}
      {uploadMethod === 'file' ? (
        /* File Upload */
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
          <CardContent className="p-8">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
                ${isDragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
              `}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto" />
                {uploadedFile ? (
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-green-600 dark:text-green-400">
                      File uploaded successfully!
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <DocumentTextIcon className="w-5 h-5 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {uploadedFile.name}
                      </span>
                      <Badge variant="success" size="sm">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume here'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      or click to browse files
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Badge variant="outline">PDF</Badge>
                  <Badge variant="outline">DOC</Badge>
                  <Badge variant="outline">DOCX</Badge>
                  <Badge variant="outline">TXT</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Text Paste */
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardDocumentIcon className="w-5 h-5" />
              Paste Your Resume Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your complete resume content here... Include all sections like personal information, experience, education, skills, etc."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              rows={12}
              className="resize-none"
            />
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span>Make sure to include all resume sections for accurate analysis</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Description (Optional) */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <BoltIcon className="w-5 h-5 text-yellow-500" />
              Job Description Match (Optional)
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowJobMatch(!showJobMatch)}
            >
              {showJobMatch ? 'Hide' : 'Add Job Description'}
            </Button>
          </div>
        </CardHeader>
        {showJobMatch && (
          <CardContent>
            <Textarea
              placeholder="Paste the job description here to get a job match score and tailored recommendations..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Adding a job description helps identify missing keywords and provides tailored suggestions
            </p>
          </CardContent>
        )}
      </Card>

      {/* Credit Display & Analysis Button */}
      <div className="space-y-4">
        <div className="max-w-xs mx-auto">
          <CreditDisplay 
            credits={creditInfo.remaining} 
            total={creditInfo.total === -1 ? Infinity : creditInfo.total}
            showUpgrade={creditInfo.remaining < 5}
          />
        </div>
        
        <div className="text-center">
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (!uploadedFile && !pastedText.trim())}
            size="lg"
            className="px-8 py-3 text-lg font-semibold"
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing Resume...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5" />
                Analyze ATS Score
                <Badge variant="outline" size="sm" className="ml-2">2 credits</Badge>
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature="ATS Analysis"
        creditsNeeded={2}
        creditsRemaining={creditInfo.remaining}
        currentPlan={creditInfo.plan}
      />

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto">
            <SparklesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">AI-Powered Analysis</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Advanced AI algorithms analyze your resume for ATS compatibility
          </p>
        </div>
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto">
            <DocumentTextIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Detailed Breakdown</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get section-wise scoring with specific improvement suggestions
          </p>
        </div>
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto">
            <CloudArrowUpIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Instant Results</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get your ATS score and recommendations in seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default ATSUploadSection;
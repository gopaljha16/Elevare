import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Download, Share2, Save, Eye, Sparkles, Wand2,
  FileText, User, Briefcase, GraduationCap, Award,
  Code, Link as LinkIcon, Plus, Trash2, Edit2, Check, X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import axiosClient from '../utils/axiosClient';
import FormSections from '../components/resume/FormSections';
import LivePreview from '../components/resume/LivePreview';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ResumeBuilder = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState('create'); // 'create' or 'upload'
  const [resumeData, setResumeData] = useState(null);
  const [currentResumeId, setCurrentResumeId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [atsScore, setAtsScore] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [isDemo, setIsDemo] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);

  // Auto-save functionality
  useEffect(() => {
    if (!resumeData || isDemo || !resumeData.personalInfo?.fullName) return;

    // Clear existing timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    // Set new timer for auto-save after 2 seconds of inactivity
    const timer = setTimeout(() => {
      if (currentResumeId) {
        saveResumeQuietly();
      }
    }, 2000);

    setAutoSaveTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resumeData]);

  // Quiet save without alerts
  const saveResumeQuietly = async () => {
    if (!currentResumeId) return;
    
    try {
      await axiosClient.put(`/resumes/${currentResumeId}`, {
        ...resumeData,
        template: selectedTemplate
      });
      console.log('✅ Auto-saved successfully');
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  // Initialize resume data (check for demo or create empty)
  useEffect(() => {
    // Check if viewing demo resume
    const urlParams = new URLSearchParams(window.location.search);
    const isDemoMode = urlParams.get('demo') === 'true';
    
    if (isDemoMode) {
      const demoData = sessionStorage.getItem('demoResume');
      if (demoData) {
        try {
          const parsedDemo = JSON.parse(demoData);
          setResumeData(parsedDemo);
          setIsDemo(true);
          setMode('view');
          if (parsedDemo.atsScore) {
            setAtsScore(parsedDemo.atsScore);
          }
          // Clear demo data after loading
          sessionStorage.removeItem('demoResume');
          return;
        } catch (error) {
          console.error('Error parsing demo resume:', error);
        }
      }
    }

    // Initialize empty resume data if not demo
    if (!resumeData) {
      setResumeData({
        personalInfo: {
          fullName: '',
          jobTitle: '',
          email: '',
          phone: '',
          address: '',
          photo: '',
          socialLinks: {}
        },
        professionalSummary: '',
        experience: [],
        education: [],
        skills: { technical: [], soft: [], languages: [], tools: [] },
        projects: [],
        certifications: []
      });
    }
  }, []);

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or DOCX file only.');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    console.log('📤 Uploading file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      user: user?.email
    });

    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      console.log('🚀 Making upload request...');
      const response = await axiosClient.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Upload successful:', response.data);
      
      if (response.data.success) {
        setResumeData(response.data.data);
        setMode('edit');
        alert(response.data.message || 'Resume uploaded successfully!');
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error stack:', error.stack);
      
      let errorMessage = 'Failed to upload resume. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred. Check console for details.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Save resume
  const saveResume = async () => {
    setSaving(true);
    try {
      const endpoint = currentResumeId 
        ? `/resumes/${currentResumeId}`
        : '/resumes';
      
      const method = currentResumeId ? 'put' : 'post';
      
      const response = await axiosClient[method](endpoint, {
        ...resumeData,
        template: selectedTemplate
      });

      if (!currentResumeId) {
        setCurrentResumeId(response.data.data._id);
      }
      
      alert('Resume saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save resume';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Get AI suggestions
  const getAISuggestions = async () => {
    // Save first if no ID
    if (!currentResumeId) {
      try {
        await saveResume();
      } catch (error) {
        alert('Please save your resume first');
        return;
      }
    }

    setLoading(true);
    try {
      const response = await axiosClient.post(
        `/resumes/${currentResumeId}/suggestions`,
        { targetRole: resumeData.personalInfo.jobTitle || 'Software Engineer' }
      );

      if (response.data.success) {
        setAiSuggestions(response.data.data);
        alert('✨ AI suggestions generated! Check the preview section.');
      }
    } catch (error) {
      console.error('AI suggestions error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to get AI suggestions. Make sure Gemini AI is configured.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calculate ATS score
  const calculateATS = async () => {
    // Save first if no ID
    if (!currentResumeId) {
      try {
        await saveResume();
      } catch (error) {
        alert('Please save your resume first');
        return;
      }
    }

    setLoading(true);
    try {
      const response = await axiosClient.post(
        `/resumes/${currentResumeId}/ats-score`,
        { jobDescription: '' }
      );

      if (response.data.success) {
        setAtsScore(response.data.data);
        alert(`✅ ATS Score: ${response.data.data.score}/100\n\nCheck the preview section for detailed analysis.`);
      }
    } catch (error) {
      console.error('ATS score error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to calculate ATS score. Make sure Gemini AI is configured.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Download PDF
  const downloadPDF = async () => {
    try {
      const previewElement = document.getElementById('resume-preview');
      
      if (!previewElement) {
        alert('Preview not found. Please wait for the preview to load.');
        return;
      }

      if (!resumeData || !resumeData.personalInfo) {
        alert('Please fill in your resume information before downloading.');
        return;
      }

      // Show loading state
      const loadingDiv = document.createElement('div');
      loadingDiv.id = 'pdf-loading';
      loadingDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      loadingDiv.innerHTML = '<div class="bg-white p-6 rounded-lg shadow-xl"><div class="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div><p class="text-gray-700 font-medium">Generating PDF...</p></div>';
      document.body.appendChild(loadingDiv);

      // Wait a bit for the loading UI to render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate canvas from HTML
      const canvas = await html2canvas(previewElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: previewElement.scrollWidth,
        windowHeight: previewElement.scrollHeight
      });

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Generate filename
      const fileName = `${resumeData?.personalInfo?.fullName?.replace(/\s+/g, '_') || 'Resume'}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Save PDF
      pdf.save(fileName);
      
      // Remove loading state
      const loadingElement = document.getElementById('pdf-loading');
      if (loadingElement) {
        document.body.removeChild(loadingElement);
      }
      
      console.log('✅ PDF downloaded successfully:', fileName);
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      
      // Remove loading state if it exists
      const loadingElement = document.getElementById('pdf-loading');
      if (loadingElement) {
        document.body.removeChild(loadingElement);
      }
      
      // Show error message
      alert('Failed to generate PDF. Using print dialog as fallback.\n\nError: ' + error.message);
      
      // Fallback to print
      window.print();
    }
  };

  // Generate share link
  const generateShareLink = async () => {
    if (!currentResumeId) {
      alert('Please save your resume first');
      return;
    }

    try {
      const response = await axiosClient.post(
        `/resumes/${currentResumeId}/share`,
        {}
      );

      const shareUrl = response.data.data.url;
      navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    } catch (error) {
      console.error('Share link error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to generate share link';
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
                  {isDemo && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Eye className="w-3 h-3 mr-1" />
                      Demo Mode
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {isDemo ? 'Viewing demo resume - Create your own to edit' : `Create / ${mode === 'upload' ? 'Upload' : 'Create new'}`}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {!isDemo && (
                <>
                  <button
                    onClick={async () => {
                      try {
                        const response = await axiosClient.get('/resumes/diagnostics');
                        console.log('Diagnostics:', response.data);
                        const diag = response.data.diagnostics;
                        const aiStatus = diag.services.aiModelAvailable ? '✅ Working' : '❌ Not Working';
                        alert(`🔍 System Diagnostics:\n\n` +
                          `👤 User: ${diag.user?.email || 'Not logged in'}\n` +
                          `🔑 Gemini Key: ${diag.environment.hasGeminiKey ? '✅ Present (' + diag.environment.geminiKeyLength + ' chars)' : '❌ Missing'}\n` +
                          `🤖 AI Service: ${diag.services.aiServiceInitialized ? '✅ Initialized' : '❌ Failed'}\n` +
                          `🧠 AI Model: ${aiStatus}\n` +
                          `📄 PDF Parser: ${diag.dependencies.pdfParse ? '✅ Available' : '❌ Missing'}\n` +
                          `📝 DOCX Parser: ${diag.dependencies.mammoth ? '✅ Available' : '❌ Missing'}\n\n` +
                          `${!diag.services.aiModelAvailable ? '⚠️ AI features may not work. Check backend logs.' : '✅ All systems operational!'}`
                        );
                      } catch (error) {
                        console.error('Diagnostics failed:', error);
                        alert('❌ Diagnostics failed: ' + (error.response?.data?.message || error.message));
                      }
                    }}
                    className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    🔍 Diagnostics
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        console.log('Testing AI service...');
                        const response = await axiosClient.post('/resumes/test-ai', {});
                        console.log('AI Test Response:', response.data);
                        alert('✅ AI Test Successful!\n\n' + 
                          'Response: ' + response.data.testResult + '\n\n' +
                          'AI service is working properly!');
                      } catch (error) {
                        console.error('AI test failed:', error);
                        console.error('Error details:', error.response?.data);
                        alert('❌ AI Test Failed!\n\n' + 
                          'Error: ' + (error.response?.data?.message || error.message) + '\n\n' +
                          'Check backend logs for details.');
                      }
                    }}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    🤖 Test AI
                  </button>

                  <button
                    onClick={async () => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.pdf,.docx';
                      input.onchange = async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        
                        const formData = new FormData();
                        formData.append('resume', file);
                        
                        try {
                          // Test public upload first (no auth required)
                          const response = await axiosClient.post('/resumes/public-test-upload', formData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                          });
                          console.log('Public upload test:', response.data);
                          alert('Public upload test successful: ' + response.data.file.originalname);
                        } catch (error) {
                          console.error('Public upload test failed:', error);
                          alert('Public upload test failed: ' + (error.response?.data?.message || error.message));
                        }
                      };
                      input.click();
                    }}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Test Upload
                  </button>

                  <button
                    onClick={getAISuggestions}
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center space-x-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>AI Improve</span>
                  </button>

                  <button
                    onClick={calculateATS}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>ATS Score</span>
                  </button>
                  
                  <button
                    onClick={saveResume}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : currentResumeId ? 'Saved ✓' : 'Save'}</span>
                  </button>
                </>
              )}

              <button 
                onClick={downloadPDF}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>

              {!isDemo && (
                <button 
                  onClick={generateShareLink}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Form Sections */}
          <div className="lg:col-span-1 space-y-4">
            {isDemo && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <Eye className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-1">Demo Resume Preview</h3>
                    <p className="text-sm text-yellow-800 mb-3">
                      This is a sample resume to showcase our builder's capabilities. Explore the sections below to see what you can create!
                    </p>
                    <button
                      onClick={() => window.location.href = '/resume-builder'}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                    >
                      Create Your Own Resume
                    </button>
                  </div>
                </div>
              </div>
            )}
            <FormSections 
              resumeData={resumeData}
              setResumeData={setResumeData}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              onFileUpload={handleFileUpload}
              loading={loading}
              currentResumeId={currentResumeId}
              isDemo={isDemo}
            />
          </div>

          {/* Right Side - Live Preview */}
          <div className="lg:col-span-2">
            <LivePreview 
              resumeData={resumeData}
              template={selectedTemplate}
              atsScore={atsScore}
              aiSuggestions={aiSuggestions}
              isDemo={isDemo}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;

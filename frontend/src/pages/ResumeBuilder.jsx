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
import { jsPDF } from 'jspdf';
import { getDemoResumeData } from '../data/demoResumeData';

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
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Auto-save functionality - saves whenever data changes
  useEffect(() => {
    // Don't auto-save if no data, in demo mode, or data is empty
    if (!resumeData || isDemo) return;

    // Check if there's any meaningful data to save
    const hasData = resumeData.personalInfo?.fullName || 
                    resumeData.personalInfo?.email || 
                    resumeData.personalInfo?.phone ||
                    resumeData.professionalSummary ||
                    resumeData.experience?.length > 0 ||
                    resumeData.education?.length > 0 ||
                    resumeData.skills?.technical?.length > 0;

    if (!hasData) return;

    // Clear existing timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    // Set new timer for auto-save after 2 seconds of inactivity
    const timer = setTimeout(() => {
      saveResumeQuietly();
    }, 2000);

    setAutoSaveTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resumeData]);

  // Quiet save without alerts - creates or updates resume
  const saveResumeQuietly = async () => {
    setAutoSaving(true);
    try {
      if (currentResumeId) {
        // Update existing resume
        await axiosClient.put(`/resumes/${currentResumeId}`, {
          ...resumeData,
          template: selectedTemplate
        });
        console.log('✅ Auto-saved successfully');
      } else {
        // Create new resume
        const response = await axiosClient.post('/resumes', {
          ...resumeData,
          template: selectedTemplate
        });
        setCurrentResumeId(response.data.data._id);
        console.log('✅ Resume created and saved:', response.data.data._id);
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save error:', error);
      // Don't show alert for auto-save errors, just log them
    } finally {
      setAutoSaving(false);
    }
  };

  // Initialize resume data (check for demo, load existing, or create empty)
  useEffect(() => {
    const initializeResume = async () => {
      // Check if viewing demo resume
      const urlParams = new URLSearchParams(window.location.search);
      const isDemoMode = urlParams.get('demo') === 'true';
      const resumeId = urlParams.get('id');
      
      if (isDemoMode) {
        // Load professional demo resume
        console.log('📋 Loading demo resume...');
        const demoData = getDemoResumeData();
        setResumeData(demoData);
        setIsDemo(true);
        setMode('view');
        setSelectedTemplate(demoData.template || 'modern');
        
        // Set ATS score and AI suggestions from demo data
        if (demoData.atsScore) {
          setAtsScore(demoData.atsScore);
        }
        if (demoData.aiSuggestions) {
          setAiSuggestions(demoData.aiSuggestions);
        }
        
        console.log('✅ Demo resume loaded successfully');
        console.log('📊 ATS Score:', demoData.atsScore?.score);
        return;
      }

      // Load existing resume if ID provided
      if (resumeId) {
        try {
          setLoading(true);
          const response = await axiosClient.get(`/resumes/${resumeId}`);
          if (response.data.success) {
            setResumeData(response.data.data);
            setCurrentResumeId(resumeId);
            setSelectedTemplate(response.data.data.template || 'modern');
            if (response.data.data.atsScore) {
              setAtsScore(response.data.data.atsScore);
            }
            if (response.data.data.aiSuggestions) {
              setAiSuggestions(response.data.data.aiSuggestions);
            }
            console.log('✅ Loaded existing resume:', resumeId);
            return;
          }
        } catch (error) {
          console.error('Error loading resume:', error);
          alert('Failed to load resume. Starting with a new one.');
        } finally {
          setLoading(false);
        }
      }

      // Try to load the most recent resume for this user
      try {
        const response = await axiosClient.get('/resumes');
        if (response.data.success && response.data.data.length > 0) {
          const latestResume = response.data.data[0]; // Assuming sorted by date
          setResumeData(latestResume);
          setCurrentResumeId(latestResume._id);
          setSelectedTemplate(latestResume.template || 'modern');
          if (latestResume.atsScore) {
            setAtsScore(latestResume.atsScore);
          }
          if (latestResume.aiSuggestions) {
            setAiSuggestions(latestResume.aiSuggestions);
          }
          console.log('✅ Loaded latest resume:', latestResume._id);
          return;
        }
      } catch (error) {
        console.log('No existing resumes found, starting fresh');
      }

      // Initialize empty resume data if nothing else worked
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
    };

    initializeResume();
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
      console.log('🔄 Starting PDF generation...');
      
      const previewElement = document.getElementById('resume-preview');
      
      if (!previewElement) {
        console.error('❌ Preview element not found');
        alert('Preview not found. Please wait for the preview to load.');
        return;
      }

      if (!resumeData || !resumeData.personalInfo) {
        console.error('❌ No resume data');
        alert('Please fill in your resume information before downloading.');
        return;
      }

      console.log('✅ Preview element found, creating loading indicator...');

      // Show loading state
      const loadingDiv = document.createElement('div');
      loadingDiv.id = 'pdf-loading';
      loadingDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      loadingDiv.innerHTML = '<div class="bg-white p-6 rounded-lg shadow-xl"><div class="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div><p class="text-gray-700 font-medium">Generating PDF...</p></div>';
      document.body.appendChild(loadingDiv);

      // Wait for loading UI to render
      await new Promise(resolve => setTimeout(resolve, 200));

      console.log('📸 Capturing resume as image...');

      // Helper function to convert oklch/color-mix to rgb
      const convertColorToRgb = (colorString) => {
        if (!colorString || (!colorString.includes('oklch') && !colorString.includes('color-mix'))) {
          return colorString;
        }
        
        // Create temporary element to get computed RGB
        const temp = document.createElement('div');
        temp.style.color = colorString;
        temp.style.display = 'none';
        document.body.appendChild(temp);
        const computed = window.getComputedStyle(temp).color;
        document.body.removeChild(temp);
        return computed || 'rgb(0, 0, 0)';
      };

      // Generate canvas from HTML with better options
      const canvas = await html2canvas(previewElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: previewElement.scrollWidth,
        windowHeight: previewElement.scrollHeight,
        ignoreElements: (element) => {
          // Ignore elements that might cause issues
          return element.classList && element.classList.contains('no-pdf');
        },
        onclone: (clonedDoc, clonedElement) => {
          const resumePreview = clonedDoc.getElementById('resume-preview');
          if (resumePreview) {
            // Get all elements in the cloned document
            const allElements = resumePreview.querySelectorAll('*');
            
            // Convert all oklch colors to rgb by reading computed styles from original
            const originalElements = previewElement.querySelectorAll('*');
            
            allElements.forEach((clonedEl, index) => {
              if (originalElements[index]) {
                const originalEl = originalElements[index];
                const computedStyle = window.getComputedStyle(originalEl);
                
                // Convert and apply background color
                const bgColor = computedStyle.backgroundColor;
                if (bgColor && (bgColor.includes('oklch') || bgColor.includes('color-mix'))) {
                  clonedEl.style.backgroundColor = convertColorToRgb(bgColor);
                } else if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
                  clonedEl.style.backgroundColor = bgColor;
                }
                
                // Convert and apply text color
                const textColor = computedStyle.color;
                if (textColor && (textColor.includes('oklch') || textColor.includes('color-mix'))) {
                  clonedEl.style.color = convertColorToRgb(textColor);
                } else if (textColor) {
                  clonedEl.style.color = textColor;
                }
                
                // Convert and apply border color
                const borderColor = computedStyle.borderColor;
                if (borderColor && (borderColor.includes('oklch') || borderColor.includes('color-mix'))) {
                  clonedEl.style.borderColor = convertColorToRgb(borderColor);
                } else if (borderColor && borderColor !== 'rgb(0, 0, 0)') {
                  clonedEl.style.borderColor = borderColor;
                }
              }
            });
            
            // Ensure dimensions
            resumePreview.style.width = previewElement.scrollWidth + 'px';
            resumePreview.style.height = 'auto';
          }
        }
      });

      console.log('✅ Canvas created:', canvas.width, 'x', canvas.height);

      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      
      // Calculate image dimensions to fit A4
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      console.log('📄 Creating PDF document...');
      
      // Create PDF with jsPDF 3.x API
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // Convert canvas to image data
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      console.log('🖼️ Adding image to PDF...');

      // Handle multiple pages if content is longer than one page
      let heightLeft = imgHeight;
      let position = 0;
      let page = 1;

      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        page++;
      }

      console.log(`✅ PDF created with ${page} page(s)`);
      
      // Generate filename
      const fileName = `${resumeData?.personalInfo?.fullName?.replace(/\s+/g, '_') || 'Resume'}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      console.log('💾 Saving PDF:', fileName);
      
      // Save PDF
      pdf.save(fileName);
      
      // Remove loading state
      const loadingElement = document.getElementById('pdf-loading');
      if (loadingElement) {
        document.body.removeChild(loadingElement);
      }
      
      console.log('✅ PDF downloaded successfully!');
      
      // Show success message
      setTimeout(() => {
        alert(`✅ Resume downloaded successfully as ${fileName}`);
      }, 100);
      
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      console.error('Error stack:', error.stack);
      
      // Remove loading state if it exists
      const loadingElement = document.getElementById('pdf-loading');
      if (loadingElement) {
        document.body.removeChild(loadingElement);
      }
      
      // Show detailed error message
      const errorMsg = `Failed to generate PDF.\n\nError: ${error.message}\n\nTrying print dialog as fallback...`;
      alert(errorMsg);
      
      // Fallback to print
      console.log('🖨️ Falling back to print dialog...');
      setTimeout(() => {
        window.print();
      }, 100);
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
                  {isDemo ? 'Viewing demo resume - Create your own to edit' : 
                   autoSaving ? '💾 Saving...' :
                   lastSaved ? `✅ Saved ${new Date(lastSaved).toLocaleTimeString()}` :
                   `Create / ${mode === 'upload' ? 'Upload' : 'Create new'}`}
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
                    disabled={saving || autoSaving}
                    className={`px-4 py-2 ${autoSaving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition-colors flex items-center space-x-2`}
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {saving ? 'Saving...' : 
                       autoSaving ? 'Auto-saving...' :
                       currentResumeId ? 'Save' : 'Save'}
                    </span>
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

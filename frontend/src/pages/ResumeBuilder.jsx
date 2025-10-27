import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Download, Share2, Save, Eye, Sparkles, 
  FileText, User, Briefcase, GraduationCap, Award,
  Code, Link as LinkIcon, Plus, Trash2, Edit2, Check, X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import FormSections from '../components/resume/FormSections';
import LivePreview from '../components/resume/LivePreview';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

  // Initialize empty resume data
  useEffect(() => {
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

    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await axios.post(`${API_URL}/resumes/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setResumeData(response.data.data);
      setMode('edit');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save resume
  const saveResume = async () => {
    setSaving(true);
    try {
      const endpoint = currentResumeId 
        ? `${API_URL}/resumes/${currentResumeId}`
        : `${API_URL}/resumes`;
      
      const method = currentResumeId ? 'put' : 'post';
      
      const response = await axios[method](endpoint, {
        ...resumeData,
        template: selectedTemplate
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!currentResumeId) {
        setCurrentResumeId(response.data.data._id);
      }
      
      alert('Resume saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  // Get AI suggestions
  const getAISuggestions = async () => {
    if (!currentResumeId) {
      await saveResume();
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/resumes/${currentResumeId}/suggestions`,
        { targetRole: resumeData.personalInfo.jobTitle },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );

      setAiSuggestions(response.data.data);
    } catch (error) {
      console.error('AI suggestions error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate ATS score
  const calculateATS = async () => {
    if (!currentResumeId) {
      await saveResume();
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/resumes/${currentResumeId}/ats-score`,
        {},
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );

      setAtsScore(response.data.data);
    } catch (error) {
      console.error('ATS score error:', error);
    } finally {
      setLoading(false);
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
                <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
                <p className="text-sm text-gray-500">Create / {mode === 'upload' ? 'Upload' : 'Create new'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
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
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>

              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
              </button>

              <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Form Sections */}
          <div className="lg:col-span-1 space-y-4">
            <FormSections 
              resumeData={resumeData}
              setResumeData={setResumeData}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              onFileUpload={handleFileUpload}
              loading={loading}
            />
          </div>

          {/* Right Side - Live Preview */}
          <div className="lg:col-span-2">
            <LivePreview 
              resumeData={resumeData}
              template={selectedTemplate}
              atsScore={atsScore}
              aiSuggestions={aiSuggestions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Plus, FileText, Download, Share2, Eye, Edit, Trash2,
  Copy, Star, Clock, TrendingUp, Sparkles, Search
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Demo resume data with complete information
const DEMO_RESUME = {
  _id: 'demo-resume-001',
  isDemo: true,
  personalInfo: {
    fullName: 'Sarah Johnson',
    jobTitle: 'Senior Full Stack Developer',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 123-4567',
    address: 'San Francisco, CA',
    photo: '',
    socialLinks: {
      linkedin: 'linkedin.com/in/sarahjohnson',
      github: 'github.com/sarahjohnson',
      portfolio: 'sarahjohnson.dev'
    }
  },
  professionalSummary: 'Innovative Full Stack Developer with 8+ years of experience building scalable web applications. Expertise in React, Node.js, and cloud technologies. Proven track record of leading development teams and delivering high-impact solutions that drive business growth. Passionate about clean code, best practices, and mentoring junior developers.',
  experience: [
    {
      jobTitle: 'Senior Full Stack Developer',
      company: 'Tech Innovations Inc.',
      location: 'San Francisco, CA',
      startDate: '2021-03',
      endDate: '',
      current: true,
      description: '• Led development of microservices architecture serving 2M+ users, improving system reliability by 40%\n• Architected and implemented real-time collaboration features using WebSockets and Redis\n• Mentored team of 5 junior developers, conducting code reviews and technical training sessions\n• Reduced API response time by 60% through optimization and caching strategies',
      achievements: []
    },
    {
      jobTitle: 'Full Stack Developer',
      company: 'Digital Solutions LLC',
      location: 'San Francisco, CA',
      startDate: '2018-06',
      endDate: '2021-02',
      current: false,
      description: '• Developed and maintained 15+ client-facing web applications using React and Node.js\n• Implemented CI/CD pipelines reducing deployment time by 70%\n• Collaborated with UX team to improve user engagement by 45%\n• Integrated third-party APIs and payment gateways for e-commerce platforms',
      achievements: []
    },
    {
      jobTitle: 'Junior Web Developer',
      company: 'StartUp Hub',
      location: 'San Francisco, CA',
      startDate: '2016-01',
      endDate: '2018-05',
      current: false,
      description: '• Built responsive web applications using HTML, CSS, JavaScript, and jQuery\n• Worked with REST APIs and integrated frontend with backend services\n• Participated in agile development process and daily stand-ups\n• Contributed to open-source projects and internal documentation',
      achievements: []
    }
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      startDate: '2012-09',
      endDate: '2016-05',
      gpa: '3.8'
    }
  ],
  skills: {
    technical: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'REST API', 'Git', 'CI/CD'],
    soft: ['Leadership', 'Team Collaboration', 'Problem Solving', 'Communication', 'Mentoring', 'Agile Methodologies'],
    languages: ['English', 'Spanish'],
    tools: ['VS Code', 'GitHub', 'JIRA', 'Figma', 'Postman', 'Slack']
  },
  projects: [],
  certifications: [],
  status: 'completed',
  template: 'modern',
  atsScore: {
    score: 92,
    feedback: {
      strengths: ['Strong action verbs', 'Quantified achievements', 'Relevant keywords'],
      improvements: ['Add more metrics', 'Include certifications']
    }
  },
  lastModified: new Date('2024-01-15'),
  createdAt: new Date('2024-01-10')
};

const ResumeDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, draft, completed

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await axios.get(`${API_URL}/resumes`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      // Add demo resume to the list
      setResumes([DEMO_RESUME, ...response.data.data]);
    } catch (error) {
      console.error('Fetch resumes error:', error);
      // Even if fetch fails, show demo resume
      setResumes([DEMO_RESUME]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // Prevent deleting demo resume
    const resume = resumes.find(r => r._id === id);
    if (resume?.isDemo) {
      alert('This is a demo resume and cannot be deleted. Create your own resume to get started!');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this resume?')) return;

    try {
      await axios.delete(`${API_URL}/resumes/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setResumes(resumes.filter(r => r._id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete resume');
    }
  };

  const handleDuplicate = async (id) => {
    // Handle demo resume duplication
    const resume = resumes.find(r => r._id === id);
    if (resume?.isDemo) {
      alert('Create a new resume based on this demo! Click "Create New Resume" to get started.');
      navigate('/resume-builder');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/resumes/${id}/duplicate`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setResumes([DEMO_RESUME, response.data.data, ...resumes.filter(r => !r.isDemo)]);
    } catch (error) {
      console.error('Duplicate error:', error);
      alert('Failed to duplicate resume');
    }
  };

  const handleDownloadPDF = async (id) => {
    // Handle demo resume
    const resume = resumes.find(r => r._id === id);
    if (resume?.isDemo) {
      alert('This is a demo resume. Create your own resume to download it as PDF!');
      return;
    }

    try {
      // Navigate to builder with download flag
      navigate(`/resume-builder?id=${id}&download=true`);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const filteredResumes = resumes.filter(resume => {
    const matchesSearch = resume.personalInfo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resume.personalInfo.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || resume.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Separate demo and user resumes
  const demoResumes = filteredResumes.filter(r => r.isDemo);
  const userResumes = filteredResumes.filter(r => !r.isDemo);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your resumes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
              <p className="text-gray-500 mt-1">Manage and create your professional resumes</p>
            </div>
            <button
              onClick={() => navigate('/resume-builder')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Resume</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FileText}
            label="Total Resumes"
            value={userResumes.length}
            color="blue"
          />
          <StatCard
            icon={Clock}
            label="Draft"
            value={userResumes.filter(r => r.status === 'draft').length}
            color="yellow"
          />
          <StatCard
            icon={TrendingUp}
            label="Completed"
            value={userResumes.filter(r => r.status === 'completed').length}
            color="green"
          />
          <StatCard
            icon={Star}
            label="Avg ATS Score"
            value={userResumes.length > 0 ? Math.round(userResumes.reduce((acc, r) => acc + (r.atsScore?.score || 0), 0) / userResumes.length) : 0}
            color="purple"
          />
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resumes by name or job title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'draft', 'completed'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all capitalize ${filterStatus === status
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Demo Resume Section */}
        {demoResumes.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span>Demo Resume</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">Explore this example to see what you can create</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoResumes.map((resume) => (
                <ResumeCard
                  key={resume._id}
                  resume={resume}
                  onEdit={() => {
                    // Store demo resume in sessionStorage for viewing
                    sessionStorage.setItem('demoResume', JSON.stringify(resume));
                    navigate('/resume-builder?demo=true');
                  }}
                  onDelete={() => handleDelete(resume._id)}
                  onDuplicate={() => handleDuplicate(resume._id)}
                  onDownload={() => handleDownloadPDF(resume._id)}
                  isDemo={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* User Resumes Section */}
        {userResumes.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Resumes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userResumes.map((resume) => (
                <ResumeCard
                  key={resume._id}
                  resume={resume}
                  onEdit={() => navigate(`/resume-builder?id=${resume._id}`)}
                  onDelete={() => handleDelete(resume._id)}
                  onDuplicate={() => handleDuplicate(resume._id)}
                  onDownload={() => handleDownloadPDF(resume._id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State - Only show if no user resumes */}
        {userResumes.length === 0 && demoResumes.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to create your resume?</h3>
            <p className="text-gray-500 mb-6">
              Check out the demo above, then create your own professional resume
            </p>
            <button
              onClick={() => navigate('/resume-builder')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Resume</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

// Resume Card Component
const ResumeCard = ({ resume, onEdit, onDelete, onDuplicate, onDownload, isDemo = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
    >
      {/* Preview */}
      <div className={`h-48 bg-gradient-to-br p-6 relative overflow-hidden ${isDemo ? 'from-yellow-50 to-orange-100' : 'from-blue-50 to-indigo-100'
        }`}>
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 20px)',
          }}></div>
        </div>
        <div className="relative">
          {isDemo && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mb-2">
              <Star className="w-3 h-3 mr-1 fill-yellow-600" />
              Demo
            </span>
          )}
          <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">
            {resume.personalInfo.fullName || 'Untitled Resume'}
          </h3>
          <p className="text-sm text-gray-600 truncate">{resume.personalInfo.jobTitle}</p>

          {resume.atsScore && (
            <div className="mt-4 inline-flex items-center space-x-2 bg-white rounded-full px-3 py-1 shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-gray-900">
                ATS: {resume.atsScore.score}/100
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(resume.status)}`}>
            {resume.status}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(resume.lastModified).toLocaleDateString()}
          </span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onEdit}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm font-medium ${isDemo
              ? 'bg-yellow-600 text-white hover:bg-yellow-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {isDemo ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            <span>{isDemo ? 'View' : 'Edit'}</span>
          </button>
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
          <button
            onClick={onDuplicate}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
          >
            <Copy className="w-4 h-4" />
            <span>Duplicate</span>
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ResumeDashboard;

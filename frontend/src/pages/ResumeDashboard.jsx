import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Plus, FileText, Download, Share2, Eye, Edit, Trash2,
  Copy, Star, Clock, TrendingUp, Sparkles, Search
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import { useAuth } from '../hooks/useAuth';

// Demo resume data with complete information
const DEMO_RESUME = {
  _id: 'demo-resume-001',
  isDemo: true,
  personalInfo: {
    fullName: 'Christina Sebastian',
    jobTitle: 'UI UX Designer',
    email: 'christina1992@gmail.com',
    phone: '+00 9876543210',
    address: '123 Main Street, Cityville, State 12345, United States',
    photo: '',
    socialLinks: {
      linkedin: 'linkedin.com/in/christinasebastian',
      github: 'github.com/christinasebastian',
      portfolio: 'christinasebastian.design'
    }
  },
  professionalSummary: 'Creative and detail-oriented UI/UX Designer with 6+ years of experience crafting intuitive and visually stunning digital experiences. Expertise in user research, wireframing, prototyping, and design systems. Proven track record of increasing user engagement by 50% through data-driven design decisions. Passionate about creating accessible and user-centered designs that solve real problems.',
  experience: [
    {
      jobTitle: 'Senior UI/UX Designer',
      company: 'Design Studio Pro',
      location: 'New York, NY',
      startDate: '2021-06',
      endDate: '',
      current: true,
      description: '• Led design of mobile app that achieved 4.8★ rating with 500K+ downloads in first 6 months\n• Conducted user research with 200+ participants, resulting in 35% improvement in user satisfaction\n• Created comprehensive design system used across 10+ products, reducing design time by 40%\n• Collaborated with cross-functional teams to deliver 15+ successful product launches',
      achievements: []
    },
    {
      jobTitle: 'UI/UX Designer',
      company: 'Creative Digital Agency',
      location: 'New York, NY',
      startDate: '2019-03',
      endDate: '2021-05',
      current: false,
      description: '• Designed responsive websites for 25+ clients across various industries\n• Improved conversion rates by 45% through A/B testing and iterative design improvements\n• Created interactive prototypes using Figma and Adobe XD for client presentations\n• Mentored 3 junior designers and conducted weekly design critique sessions',
      achievements: []
    },
    {
      jobTitle: 'Junior UI Designer',
      company: 'Tech Startup Inc',
      location: 'San Francisco, CA',
      startDate: '2018-01',
      endDate: '2019-02',
      current: false,
      description: '• Designed user interfaces for web and mobile applications using Sketch and Figma\n• Collaborated with developers to ensure pixel-perfect implementation of designs\n• Conducted usability testing sessions and incorporated feedback into design iterations\n• Created marketing materials and brand assets for social media campaigns',
      achievements: []
    }
  ],
  education: [
    {
      degree: 'Bachelor of Fine Arts in Graphic Design',
      institution: 'Rhode Island School of Design',
      location: 'Providence, RI',
      startDate: '2014-09',
      endDate: '2018-05',
      gpa: '3.9'
    },
    {
      degree: 'UX Design Certification',
      institution: 'Nielsen Norman Group',
      location: 'Online',
      startDate: '2020-01',
      endDate: '2020-06',
      gpa: ''
    }
  ],
  skills: {
    technical: ['Figma', 'Adobe XD', 'Sketch', 'Adobe Photoshop', 'Adobe Illustrator', 'InVision', 'Principle', 'Framer', 'HTML/CSS', 'Webflow', 'Miro', 'Maze'],
    soft: ['User Research', 'Wireframing', 'Prototyping', 'Visual Design', 'Interaction Design', 'Design Thinking', 'Usability Testing', 'Communication', 'Team Collaboration', 'Problem Solving'],
    languages: ['English', 'French', 'Spanish'],
    tools: ['Figma', 'Adobe Creative Suite', 'Sketch', 'InVision', 'Zeplin', 'Notion', 'Slack', 'JIRA']
  },
  projects: [
    {
      title: 'E-commerce Mobile App Redesign',
      description: 'Redesigned shopping experience resulting in 60% increase in mobile conversions',
      technologies: ['Figma', 'User Research', 'A/B Testing'],
      link: ''
    },
    {
      title: 'Healthcare Dashboard Design',
      description: 'Created intuitive dashboard for medical professionals managing 1000+ patients',
      technologies: ['Adobe XD', 'Data Visualization', 'Accessibility'],
      link: ''
    }
  ],
  certifications: [
    {
      name: 'Google UX Design Professional Certificate',
      issuer: 'Google',
      date: '2021-03'
    },
    {
      name: 'Interaction Design Specialization',
      issuer: 'UC San Diego (Coursera)',
      date: '2020-08'
    }
  ],
  status: 'completed',
  template: 'modern',
  atsScore: {
    score: 92,
    feedback: {
      strengths: ['Strong action verbs', 'Quantified achievements', 'Relevant keywords', 'Clear design focus'],
      improvements: ['Add portfolio links', 'Include design awards']
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
      const response = await axiosClient.get('/resumes');
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
      await axiosClient.delete(`/resumes/${id}`);
      setResumes(resumes.filter(r => r._id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete resume';
      alert(errorMessage);
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
      const response = await axiosClient.post(`/resumes/${id}/duplicate`, {});
      setResumes([DEMO_RESUME, response.data.data, ...resumes.filter(r => !r.isDemo)]);
    } catch (error) {
      console.error('Duplicate error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to duplicate resume';
      alert(errorMessage);
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

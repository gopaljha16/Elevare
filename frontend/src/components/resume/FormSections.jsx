import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Briefcase, GraduationCap, Code, Award, 
  Link as LinkIcon, Plus, Trash2, Upload, ChevronDown, ChevronUp, Sparkles, Wand2, X, FolderKanban
} from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

const FormSections = ({ resumeData, setResumeData, activeSection, setActiveSection, onFileUpload, loading, currentResumeId, isDemo = false }) => {
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    summary: false,
    experience: false,
    education: false,
    skills: false,
    projects: false,
    certifications: false,
    links: false
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updatePersonalInfo = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const updateSocialLink = (platform, value) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        socialLinks: {
          ...prev.personalInfo.socialLinks,
          [platform]: value
        }
      }
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          jobTitle: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
          achievements: []
        }
      ]
    }));
  };

  const updateExperience = (index, field, value) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (index) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          degree: '',
          institution: '',
          location: '',
          startDate: '',
          endDate: '',
          gpa: ''
        }
      ]
    }));
  };

  const updateEducation = (index, field, value) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addSkill = (category, skill) => {
    if (!skill.trim()) return;
    setResumeData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: [...(prev.skills[category] || []), skill]
      }
    }));
  };

  const removeSkill = (category, index) => {
    setResumeData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: prev.skills[category].filter((_, i) => i !== index)
      }
    }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          title: '',
          description: '',
          technologies: [],
          link: ''
        }
      ]
    }));
  };

  const updateProject = (index, field, value) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map((proj, i) => 
        i === index ? { ...proj, [field]: value } : proj
      )
    }));
  };

  const removeProject = (index) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    setResumeData(prev => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          name: '',
          issuer: '',
          date: ''
        }
      ]
    }));
  };

  const updateCertification = (index, field, value) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const removeCertification = (index) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  // AI Enhancement Functions
  const enhanceSummaryWithAI = async () => {
    if (!resumeData.personalInfo.jobTitle) {
      alert('Please enter a job title first');
      return;
    }

    setAiLoading(true);
    try {
      // Use Gemini AI directly without needing saved resume
      const response = await axiosClient.post(
        '/chat/message',
        { 
          message: `Generate a professional resume summary for a ${resumeData.personalInfo.jobTitle}. Make it ATS-friendly, compelling, and 3-4 sentences. Include key skills and value proposition. Return only the summary text, no extra formatting.`,
          conversationId: null
        }
      );
      
      // Handle different response structures
      let generatedSummary = '';
      if (response.data?.data?.response) {
        generatedSummary = response.data.data.response;
      } else if (response.data?.data?.message) {
        generatedSummary = response.data.data.message;
      } else if (response.data?.response) {
        generatedSummary = response.data.response;
      } else if (response.data?.message) {
        generatedSummary = response.data.message;
      }
      
      if (generatedSummary) {
        setResumeData(prev => ({
          ...prev,
          professionalSummary: generatedSummary
        }));
      } else {
        throw new Error('No summary generated');
      }
    } catch (error) {
      console.error('AI enhancement error:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to generate AI suggestions. Please check if AI service is running.');
    } finally {
      setAiLoading(false);
    }
  };

  const enhanceExperienceWithAI = async (index) => {
    const exp = resumeData.experience[index];
    if (!exp.jobTitle || !exp.company) {
      alert('Please fill in job title and company first');
      return;
    }

    try {
      const response = await axiosClient.post(
        '/chat/message',
        { 
          message: `Generate a professional job description for a ${exp.jobTitle} at ${exp.company}. Make it ATS-friendly with action verbs and quantifiable achievements. Include 3-4 bullet points with measurable results. Return only the description text.`,
          conversationId: null
        }
      );
      
      // Handle different response structures
      let enhancedDescription = '';
      if (response.data?.data?.response) {
        enhancedDescription = response.data.data.response;
      } else if (response.data?.data?.message) {
        enhancedDescription = response.data.data.message;
      } else if (response.data?.response) {
        enhancedDescription = response.data.response;
      } else if (response.data?.message) {
        enhancedDescription = response.data.message;
      }
      
      if (enhancedDescription) {
        updateExperience(index, 'description', enhancedDescription);
      } else {
        throw new Error('No description generated');
      }
    } catch (error) {
      console.error('Experience enhancement error:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to enhance description. Please check if AI service is running.');
    }
  };

  if (!resumeData) return null;

  return (
    <div className="space-y-4">
      {/* Resume Upload Section - Hide in demo mode */}
      {!isDemo && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <Upload className="w-5 h-5 text-blue-600" />
              <span>Upload Existing Resume</span>
            </h3>
            <label className="block">
              <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-blue-400 focus:outline-none">
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="font-medium text-gray-600">
                    {loading ? 'Parsing resume...' : 'Upload PDF or DOCX'}
                  </span>
                  <span className="text-xs text-gray-500">AI will extract your information</span>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={onFileUpload}
                  disabled={loading}
                />
              </div>
            </label>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Supported formats: PDF, DOC, DOCX (Max 10MB)
            </p>
          </div>

          {/* Photo Upload Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Profile Photo (Optional)</h3>
            <label className="block">
              <div className="flex items-center justify-center w-full h-24 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-blue-400 focus:outline-none">
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-sm text-gray-600">Upload photo</span>
                  <span className="text-xs text-gray-500">PNG, JPG up to 5MB</span>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Create preview URL
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setResumeData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo,
                            photo: reader.result
                          }
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            </label>
          </div>
        </>
      )}

      {/* Personal Information */}
      <Section
        title="Personal informations"
        icon={User}
        expanded={expandedSections.personal}
        onToggle={() => toggleSection('personal')}
      >
        <div className="space-y-4">
          <Input
            label="Full name"
            value={resumeData.personalInfo.fullName}
            onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
            placeholder="Christina Sebastian"
            isDemo={isDemo}
          />
          <Input
            label="Job title"
            value={resumeData.personalInfo.jobTitle}
            onChange={(e) => updatePersonalInfo('jobTitle', e.target.value)}
            placeholder="UI UX Designer"
            isDemo={isDemo}
          />
          <Input
            label="Email address"
            type="email"
            value={resumeData.personalInfo.email}
            onChange={(e) => updatePersonalInfo('email', e.target.value)}
            placeholder="christina1992@gmail.com"
            isDemo={isDemo}
          />
          <Input
            label="Mobile number"
            type="tel"
            value={resumeData.personalInfo.phone}
            onChange={(e) => updatePersonalInfo('phone', e.target.value)}
            placeholder="+00 9876543210"
            isDemo={isDemo}
          />
          <TextArea
            label="Address"
            value={resumeData.personalInfo.address}
            onChange={(e) => updatePersonalInfo('address', e.target.value)}
            placeholder="123 Main Street, Cityville, State 12345, United States"
            rows={3}
            isDemo={isDemo}
          />
        </div>
      </Section>

      {/* Professional Summary */}
      <Section
        title="Professional summary"
        icon={Briefcase}
        expanded={expandedSections.summary}
        onToggle={() => toggleSection('summary')}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Summary</label>
            {!isDemo && (
              <button
                onClick={enhanceSummaryWithAI}
                disabled={aiLoading}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>{aiLoading ? 'Generating...' : 'AI Generate'}</span>
              </button>
            )}
          </div>
          <textarea
            value={resumeData.professionalSummary}
            onChange={(e) => setResumeData(prev => ({ ...prev, professionalSummary: e.target.value }))}
            placeholder="Write a compelling professional summary..."
            rows={5}
            disabled={isDemo}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none ${
              isDemo ? 'bg-gray-50 cursor-not-allowed' : ''
            }`}
          />
        </div>
      </Section>

      {/* Experience */}
      <Section
        title="Experience"
        icon={Briefcase}
        expanded={expandedSections.experience}
        onToggle={() => toggleSection('experience')}
        onAdd={!isDemo ? addExperience : undefined}
      >
        <div className="space-y-4">
          {resumeData.experience.map((exp, index) => (
            <ExperienceItem
              key={index}
              experience={exp}
              index={index}
              onUpdate={updateExperience}
              onRemove={removeExperience}
              onAIEnhance={enhanceExperienceWithAI}
              isDemo={isDemo}
            />
          ))}
        </div>
      </Section>

      {/* Education */}
      <Section
        title="Education"
        icon={GraduationCap}
        expanded={expandedSections.education}
        onToggle={() => toggleSection('education')}
        onAdd={!isDemo ? addEducation : undefined}
      >
        <div className="space-y-4">
          {resumeData.education.map((edu, index) => (
            <EducationItem
              key={index}
              education={edu}
              index={index}
              onUpdate={updateEducation}
              onRemove={removeEducation}
              isDemo={isDemo}
            />
          ))}
        </div>
      </Section>

      {/* Skills */}
      <Section
        title="Skills"
        icon={Code}
        expanded={expandedSections.skills}
        onToggle={() => toggleSection('skills')}
      >
        <SkillsSection
          skills={resumeData.skills}
          onAdd={addSkill}
          onRemove={removeSkill}
          isDemo={isDemo}
        />
      </Section>

      {/* Projects */}
      <Section
        title="Projects"
        icon={FolderKanban}
        expanded={expandedSections.projects}
        onToggle={() => toggleSection('projects')}
        onAdd={!isDemo ? addProject : undefined}
      >
        <div className="space-y-4">
          {resumeData.projects && resumeData.projects.map((project, index) => (
            <ProjectItem
              key={index}
              project={project}
              index={index}
              onUpdate={updateProject}
              onRemove={removeProject}
              isDemo={isDemo}
            />
          ))}
        </div>
      </Section>

      {/* Certifications */}
      <Section
        title="Certifications"
        icon={Award}
        expanded={expandedSections.certifications}
        onToggle={() => toggleSection('certifications')}
        onAdd={!isDemo ? addCertification : undefined}
      >
        <div className="space-y-4">
          {resumeData.certifications && resumeData.certifications.map((cert, index) => (
            <CertificationItem
              key={index}
              certification={cert}
              index={index}
              onUpdate={updateCertification}
              onRemove={removeCertification}
              isDemo={isDemo}
            />
          ))}
        </div>
      </Section>

      {/* Profile or Portfolio URL */}
      <Section
        title="Profile or portfolio URL"
        icon={LinkIcon}
        expanded={expandedSections.links}
        onToggle={() => toggleSection('links')}
      >
        <div className="space-y-3">
          <Input
            label="LinkedIn"
            value={resumeData.personalInfo.socialLinks?.linkedin || ''}
            onChange={(e) => updateSocialLink('linkedin', e.target.value)}
            placeholder="linkedin.com/in/yourprofile"
            isDemo={isDemo}
          />
          <Input
            label="GitHub"
            value={resumeData.personalInfo.socialLinks?.github || ''}
            onChange={(e) => updateSocialLink('github', e.target.value)}
            placeholder="github.com/yourprofile"
            isDemo={isDemo}
          />
          <Input
            label="Portfolio"
            value={resumeData.personalInfo.socialLinks?.portfolio || ''}
            onChange={(e) => updateSocialLink('portfolio', e.target.value)}
            placeholder="yourportfolio.com"
            isDemo={isDemo}
          />
        </div>
      </Section>
    </div>
  );
};

// Reusable Components
const Section = ({ title, icon: Icon, expanded, onToggle, onAdd, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div
      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onToggle}
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="flex items-center space-x-2">
        {onAdd && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
        )}
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </div>
    </div>
    {expanded && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="p-4 pt-0 border-t border-gray-100"
      >
        {children}
      </motion.div>
    )}
  </div>
);

const Input = ({ label, isDemo, ...props }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input
      {...props}
      disabled={isDemo || props.disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
        isDemo ? 'bg-gray-50 cursor-not-allowed' : ''
      }`}
    />
  </div>
);

const TextArea = ({ label, isDemo, ...props }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <textarea
      {...props}
      disabled={isDemo || props.disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none ${
        isDemo ? 'bg-gray-50 cursor-not-allowed' : ''
      }`}
    />
  </div>
);

const ExperienceItem = ({ experience, index, onUpdate, onRemove, onAIEnhance, isDemo = false }) => {
  const [enhancing, setEnhancing] = useState(false);

  const handleAIEnhance = async () => {
    setEnhancing(true);
    try {
      await onAIEnhance(index);
    } finally {
      setEnhancing(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-3 relative">
      {!isDemo && (
        <button
          onClick={() => onRemove(index)}
          className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      )}
      <Input
        label="Job Title"
        value={experience.jobTitle}
        onChange={(e) => onUpdate(index, 'jobTitle', e.target.value)}
        placeholder="UI UX Designer"
        isDemo={isDemo}
      />
      <Input
        label="Company"
        value={experience.company}
        onChange={(e) => onUpdate(index, 'company', e.target.value)}
        placeholder="ABC Company Inc."
        isDemo={isDemo}
      />
      <Input
        label="Location"
        value={experience.location}
        onChange={(e) => onUpdate(index, 'location', e.target.value)}
        placeholder="San Francisco, CA"
        isDemo={isDemo}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Start Date"
          type="month"
          value={experience.startDate}
          onChange={(e) => onUpdate(index, 'startDate', e.target.value)}
          isDemo={isDemo}
        />
        <Input
          label="End Date"
          type="month"
          value={experience.endDate}
          onChange={(e) => onUpdate(index, 'endDate', e.target.value)}
          disabled={experience.current || isDemo}
          isDemo={isDemo}
        />
      </div>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={experience.current}
          onChange={(e) => onUpdate(index, 'current', e.target.checked)}
          disabled={isDemo}
          className="rounded"
        />
        <span className="text-sm text-gray-700">Currently working here</span>
      </label>
      
      {/* Description Field */}
      <div className="relative">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">Job Description</label>
          {!isDemo && (
            <button
              onClick={handleAIEnhance}
              disabled={enhancing}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3" />
              <span>{enhancing ? 'Enhancing...' : 'AI Enhance'}</span>
            </button>
          )}
        </div>
        <textarea
          value={experience.description}
          onChange={(e) => onUpdate(index, 'description', e.target.value)}
          placeholder="Describe your role and responsibilities..."
          rows={4}
          disabled={isDemo}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none ${
            isDemo ? 'bg-gray-50 cursor-not-allowed' : ''
          }`}
        />
      </div>
    </div>
  );
};

const EducationItem = ({ education, index, onUpdate, onRemove, isDemo = false }) => (
  <div className="p-4 bg-gray-50 rounded-lg space-y-3 relative">
    {!isDemo && (
      <button
        onClick={() => onRemove(index)}
        className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded transition-colors"
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </button>
    )}
    <Input
      label="Degree"
      value={education.degree}
      onChange={(e) => onUpdate(index, 'degree', e.target.value)}
      placeholder="Bachelor of Design"
      isDemo={isDemo}
    />
    <Input
      label="Institution"
      value={education.institution}
      onChange={(e) => onUpdate(index, 'institution', e.target.value)}
      placeholder="XYZ University"
      isDemo={isDemo}
    />
    <div className="grid grid-cols-2 gap-3">
      <Input
        label="Start Date"
        type="month"
        value={education.startDate}
        onChange={(e) => onUpdate(index, 'startDate', e.target.value)}
        isDemo={isDemo}
      />
      <Input
        label="End Date"
        type="month"
        value={education.endDate}
        onChange={(e) => onUpdate(index, 'endDate', e.target.value)}
        isDemo={isDemo}
      />
    </div>
  </div>
);

const SkillsSection = ({ skills, onAdd, onRemove, isDemo = false }) => {
  const [newSkill, setNewSkill] = useState({ technical: '', soft: '', languages: '', tools: '' });
  const [suggestions, setSuggestions] = useState({ technical: [], soft: [], languages: [], tools: [] });
  const [showSuggestions, setShowSuggestions] = useState({ technical: false, soft: false, languages: false, tools: false });

  // Comprehensive skill suggestions database
  const skillDatabase = {
    technical: [
      'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js',
      'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C++', 'C#', '.NET', 'PHP', 'Laravel',
      'Ruby', 'Ruby on Rails', 'Go', 'Rust', 'Swift', 'Kotlin', 'Flutter', 'React Native',
      'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API', 'Microservices',
      'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'Git',
      'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Data Science', 'Pandas', 'NumPy',
      'Blockchain', 'Solidity', 'Web3', 'Ethereum', 'Smart Contracts',
      'Cybersecurity', 'Penetration Testing', 'Network Security', 'Cryptography',
      'DevOps', 'Linux', 'Bash', 'PowerShell', 'Terraform', 'Ansible',
      'Agile', 'Scrum', 'JIRA', 'Confluence', 'Test-Driven Development', 'Unit Testing'
    ],
    soft: [
      'Communication', 'Leadership', 'Team Collaboration', 'Problem Solving', 'Critical Thinking',
      'Time Management', 'Project Management', 'Adaptability', 'Creativity', 'Attention to Detail',
      'Conflict Resolution', 'Negotiation', 'Public Speaking', 'Presentation Skills',
      'Emotional Intelligence', 'Decision Making', 'Strategic Planning', 'Analytical Thinking',
      'Customer Service', 'Interpersonal Skills', 'Work Ethic', 'Self-Motivation',
      'Mentoring', 'Coaching', 'Active Listening', 'Empathy', 'Flexibility', 'Initiative'
    ],
    languages: [
      'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 'Chinese',
      'Japanese', 'Korean', 'Arabic', 'Hindi', 'Bengali', 'Urdu', 'Turkish', 'Dutch',
      'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish', 'Czech', 'Greek', 'Hebrew',
      'Thai', 'Vietnamese', 'Indonesian', 'Malay', 'Tagalog', 'Swahili'
    ],
    tools: [
      'VS Code', 'IntelliJ IDEA', 'Eclipse', 'PyCharm', 'Sublime Text', 'Atom',
      'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'After Effects',
      'Slack', 'Microsoft Teams', 'Zoom', 'Google Meet', 'Trello', 'Asana', 'Monday.com',
      'GitHub', 'GitLab', 'Bitbucket', 'Postman', 'Insomnia', 'Swagger',
      'Tableau', 'Power BI', 'Excel', 'Google Analytics', 'Mixpanel', 'Amplitude',
      'Salesforce', 'HubSpot', 'Mailchimp', 'WordPress', 'Shopify', 'Magento',
      'AutoCAD', 'SolidWorks', 'MATLAB', 'R Studio', 'Jupyter Notebook', 'Anaconda'
    ]
  };

  const handleInputChange = (category, value) => {
    setNewSkill(prev => ({ ...prev, [category]: value }));
    
    // Filter suggestions based on input
    if (value.trim().length > 0) {
      const filtered = skillDatabase[category].filter(skill => 
        skill.toLowerCase().includes(value.toLowerCase()) &&
        !skills[category]?.includes(skill)
      ).slice(0, 8); // Show max 8 suggestions
      
      setSuggestions(prev => ({ ...prev, [category]: filtered }));
      setShowSuggestions(prev => ({ ...prev, [category]: true }));
    } else {
      setSuggestions(prev => ({ ...prev, [category]: [] }));
      setShowSuggestions(prev => ({ ...prev, [category]: false }));
    }
  };

  const handleAdd = (category, skillToAdd = null) => {
    const skill = skillToAdd || newSkill[category];
    if (skill.trim()) {
      onAdd(category, skill.trim());
      setNewSkill(prev => ({ ...prev, [category]: '' }));
      setSuggestions(prev => ({ ...prev, [category]: [] }));
      setShowSuggestions(prev => ({ ...prev, [category]: false }));
    }
  };

  const handleSuggestionClick = (category, skill) => {
    handleAdd(category, skill);
  };

  return (
    <div className="space-y-4">
      {['technical', 'soft', 'languages', 'tools'].map(category => (
        <div key={category}>
          <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{category} Skills</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {skills[category]?.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {skill}
                {!isDemo && (
                  <button
                    onClick={() => onRemove(category, index)}
                    className="ml-2 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
          {!isDemo && (
            <div className="relative flex gap-2">
              <div className="flex-1 relative">
                <input
                  value={newSkill[category]}
                  onChange={(e) => handleInputChange(category, e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdd(category)}
                  onFocus={() => newSkill[category] && setShowSuggestions(prev => ({ ...prev, [category]: true }))}
                  onBlur={() => setTimeout(() => setShowSuggestions(prev => ({ ...prev, [category]: false })), 200)}
                  placeholder={`Add ${category} skill`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                
                {/* Autocomplete Suggestions Dropdown */}
                {showSuggestions[category] && suggestions[category].length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {suggestions[category].map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSuggestionClick(category, suggestion)}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors text-sm text-gray-700 hover:text-blue-600"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleAdd(category)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const ProjectItem = ({ project, index, onUpdate, onRemove, isDemo = false }) => {
  const [techInput, setTechInput] = useState('');

  const addTechnology = () => {
    if (techInput.trim()) {
      const updatedTechnologies = [...(project.technologies || []), techInput.trim()];
      onUpdate(index, 'technologies', updatedTechnologies);
      setTechInput('');
    }
  };

  const removeTechnology = (techIndex) => {
    const updatedTechnologies = project.technologies.filter((_, i) => i !== techIndex);
    onUpdate(index, 'technologies', updatedTechnologies);
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-3 relative">
      {!isDemo && (
        <button
          onClick={() => onRemove(index)}
          className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      )}
      <Input
        label="Project Title"
        value={project.title}
        onChange={(e) => onUpdate(index, 'title', e.target.value)}
        placeholder="E-commerce Mobile App Redesign"
        isDemo={isDemo}
      />
      <TextArea
        label="Description"
        value={project.description}
        onChange={(e) => onUpdate(index, 'description', e.target.value)}
        placeholder="Describe your project and its impact..."
        rows={3}
        isDemo={isDemo}
      />
      <Input
        label="Project Link (Optional)"
        value={project.link}
        onChange={(e) => onUpdate(index, 'link', e.target.value)}
        placeholder="https://github.com/username/project"
        isDemo={isDemo}
      />
      
      {/* Technologies */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Technologies Used</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {project.technologies && project.technologies.map((tech, techIndex) => (
            <span
              key={techIndex}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-800"
            >
              {tech}
              {!isDemo && (
                <button
                  onClick={() => removeTechnology(techIndex)}
                  className="ml-2 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
        {!isDemo && (
          <div className="flex gap-2">
            <input
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
              placeholder="Add technology"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              onClick={addTechnology}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CertificationItem = ({ certification, index, onUpdate, onRemove, isDemo = false }) => (
  <div className="p-4 bg-gray-50 rounded-lg space-y-3 relative">
    {!isDemo && (
      <button
        onClick={() => onRemove(index)}
        className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded transition-colors"
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </button>
    )}
    <Input
      label="Certification Name"
      value={certification.name}
      onChange={(e) => onUpdate(index, 'name', e.target.value)}
      placeholder="Google UX Design Professional Certificate"
      isDemo={isDemo}
    />
    <Input
      label="Issuing Organization"
      value={certification.issuer}
      onChange={(e) => onUpdate(index, 'issuer', e.target.value)}
      placeholder="Google"
      isDemo={isDemo}
    />
    <Input
      label="Date Obtained"
      type="month"
      value={certification.date}
      onChange={(e) => onUpdate(index, 'date', e.target.value)}
      isDemo={isDemo}
    />
  </div>
);

export default FormSections;

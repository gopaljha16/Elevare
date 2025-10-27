import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Briefcase, GraduationCap, Code, Award, 
  Link as LinkIcon, Plus, Trash2, Upload, ChevronDown, ChevronUp
} from 'lucide-react';

const FormSections = ({ resumeData, setResumeData, activeSection, setActiveSection, onFileUpload, loading }) => {
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    summary: false,
    experience: false,
    education: false,
    skills: false,
    projects: false
  });

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
        i === index ? { ...edu, [field]: value } : exp
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

  if (!resumeData) return null;

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <label className="block">
          <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-blue-400 focus:outline-none">
            <div className="flex flex-col items-center space-y-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="font-medium text-gray-600">
                {loading ? 'Uploading...' : 'Upload your photo'}
              </span>
              <span className="text-xs text-gray-500">PNG, JPG up to 5MB</span>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                // Handle photo upload
                const file = e.target.files[0];
                if (file) {
                  // Upload to Cloudinary or similar
                  console.log('Photo upload:', file);
                }
              }}
            />
          </div>
        </label>
        <button className="w-full mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
          Browse photos
        </button>
      </div>

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
          />
          <Input
            label="Job title"
            value={resumeData.personalInfo.jobTitle}
            onChange={(e) => updatePersonalInfo('jobTitle', e.target.value)}
            placeholder="UI UX Designer"
          />
          <Input
            label="Email address"
            type="email"
            value={resumeData.personalInfo.email}
            onChange={(e) => updatePersonalInfo('email', e.target.value)}
            placeholder="christina1992@gmail.com"
          />
          <Input
            label="Mobile number"
            type="tel"
            value={resumeData.personalInfo.phone}
            onChange={(e) => updatePersonalInfo('phone', e.target.value)}
            placeholder="+00 9876543210"
          />
          <TextArea
            label="Address"
            value={resumeData.personalInfo.address}
            onChange={(e) => updatePersonalInfo('address', e.target.value)}
            placeholder="123 Main Street, Cityville, State 12345, United States"
            rows={3}
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
        <TextArea
          value={resumeData.professionalSummary}
          onChange={(e) => setResumeData(prev => ({ ...prev, professionalSummary: e.target.value }))}
          placeholder="Write a compelling professional summary..."
          rows={5}
        />
      </Section>

      {/* Experience */}
      <Section
        title="Experience"
        icon={Briefcase}
        expanded={expandedSections.experience}
        onToggle={() => toggleSection('experience')}
        onAdd={addExperience}
      >
        <div className="space-y-4">
          {resumeData.experience.map((exp, index) => (
            <ExperienceItem
              key={index}
              experience={exp}
              index={index}
              onUpdate={updateExperience}
              onRemove={removeExperience}
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
        onAdd={addEducation}
      >
        <div className="space-y-4">
          {resumeData.education.map((edu, index) => (
            <EducationItem
              key={index}
              education={edu}
              index={index}
              onUpdate={updateEducation}
              onRemove={removeEducation}
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
        />
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
          />
          <Input
            label="GitHub"
            value={resumeData.personalInfo.socialLinks?.github || ''}
            onChange={(e) => updateSocialLink('github', e.target.value)}
            placeholder="github.com/yourprofile"
          />
          <Input
            label="Portfolio"
            value={resumeData.personalInfo.socialLinks?.portfolio || ''}
            onChange={(e) => updateSocialLink('portfolio', e.target.value)}
            placeholder="yourportfolio.com"
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

const Input = ({ label, ...props }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
    />
  </div>
);

const TextArea = ({ label, ...props }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <textarea
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
    />
  </div>
);

const ExperienceItem = ({ experience, index, onUpdate, onRemove }) => (
  <div className="p-4 bg-gray-50 rounded-lg space-y-3 relative">
    <button
      onClick={() => onRemove(index)}
      className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded transition-colors"
    >
      <Trash2 className="w-4 h-4 text-red-600" />
    </button>
    <Input
      label="Job Title"
      value={experience.jobTitle}
      onChange={(e) => onUpdate(index, 'jobTitle', e.target.value)}
      placeholder="UI UX Designer"
    />
    <Input
      label="Company"
      value={experience.company}
      onChange={(e) => onUpdate(index, 'company', e.target.value)}
      placeholder="ABC Company Inc."
    />
    <div className="grid grid-cols-2 gap-3">
      <Input
        label="Start Date"
        type="month"
        value={experience.startDate}
        onChange={(e) => onUpdate(index, 'startDate', e.target.value)}
      />
      <Input
        label="End Date"
        type="month"
        value={experience.endDate}
        onChange={(e) => onUpdate(index, 'endDate', e.target.value)}
        disabled={experience.current}
      />
    </div>
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={experience.current}
        onChange={(e) => onUpdate(index, 'current', e.target.checked)}
        className="rounded"
      />
      <span className="text-sm text-gray-700">Currently working here</span>
    </label>
  </div>
);

const EducationItem = ({ education, index, onUpdate, onRemove }) => (
  <div className="p-4 bg-gray-50 rounded-lg space-y-3 relative">
    <button
      onClick={() => onRemove(index)}
      className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded transition-colors"
    >
      <Trash2 className="w-4 h-4 text-red-600" />
    </button>
    <Input
      label="Degree"
      value={education.degree}
      onChange={(e) => onUpdate(index, 'degree', e.target.value)}
      placeholder="Bachelor of Design"
    />
    <Input
      label="Institution"
      value={education.institution}
      onChange={(e) => onUpdate(index, 'institution', e.target.value)}
      placeholder="XYZ University"
    />
    <div className="grid grid-cols-2 gap-3">
      <Input
        label="Start Date"
        type="month"
        value={education.startDate}
        onChange={(e) => onUpdate(index, 'startDate', e.target.value)}
      />
      <Input
        label="End Date"
        type="month"
        value={education.endDate}
        onChange={(e) => onUpdate(index, 'endDate', e.target.value)}
      />
    </div>
  </div>
);

const SkillsSection = ({ skills, onAdd, onRemove }) => {
  const [newSkill, setNewSkill] = useState({ technical: '', soft: '', languages: '', tools: '' });

  const handleAdd = (category) => {
    if (newSkill[category].trim()) {
      onAdd(category, newSkill[category].trim());
      setNewSkill(prev => ({ ...prev, [category]: '' }));
    }
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
                <button
                  onClick={() => onRemove(category, index)}
                  className="ml-2 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newSkill[category]}
              onChange={(e) => setNewSkill(prev => ({ ...prev, [category]: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd(category)}
              placeholder={`Add ${category} skill`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              onClick={() => handleAdd(category)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FormSections;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Save, X, Plus, Trash2, ExternalLink, Github } from 'lucide-react';

const LivePortfolioEditor = ({ portfolio, onUpdate, className = "" }) => {
  const [editingSection, setEditingSection] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [localPortfolio, setLocalPortfolio] = useState(portfolio);

  useEffect(() => {
    console.log('LivePortfolioEditor received portfolio:', portfolio);
    setLocalPortfolio(portfolio);
  }, [portfolio]);

  const handleEdit = (section, field, currentValue) => {
    setEditingSection(section);
    setEditingField(field);
    setTempValue(currentValue || '');
  };

  const handleSave = () => {
    if (!editingSection || !editingField) return;

    const updatedPortfolio = { ...localPortfolio };
    
    // Handle nested field updates
    if (editingField.includes('.')) {
      const fieldPath = editingField.split('.');
      let current = updatedPortfolio.structure[editingSection];
      
      for (let i = 0; i < fieldPath.length - 1; i++) {
        if (!current[fieldPath[i]]) current[fieldPath[i]] = {};
        current = current[fieldPath[i]];
      }
      
      current[fieldPath[fieldPath.length - 1]] = tempValue;
    } else {
      updatedPortfolio.structure[editingSection][editingField] = tempValue;
    }

    setLocalPortfolio(updatedPortfolio);
    onUpdate(updatedPortfolio);
    setEditingSection(null);
    setEditingField(null);
    setTempValue('');
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditingField(null);
    setTempValue('');
  };

  const addArrayItem = (section, field, newItem) => {
    const updatedPortfolio = { ...localPortfolio };
    if (!updatedPortfolio.structure[section][field]) {
      updatedPortfolio.structure[section][field] = [];
    }
    updatedPortfolio.structure[section][field].push(newItem);
    setLocalPortfolio(updatedPortfolio);
    onUpdate(updatedPortfolio);
  };

  const removeArrayItem = (section, field, index) => {
    const updatedPortfolio = { ...localPortfolio };
    updatedPortfolio.structure[section][field].splice(index, 1);
    setLocalPortfolio(updatedPortfolio);
    onUpdate(updatedPortfolio);
  };

  const EditableField = ({ section, field, value, placeholder, multiline = false, className = "" }) => {
    const isEditing = editingSection === section && editingField === field;
    
    if (isEditing) {
      return (
        <div className="relative">
          {multiline ? (
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder={placeholder}
              className="w-full p-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/40 resize-none"
              rows={3}
              autoFocus
            />
          ) : (
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder={placeholder}
              className="w-full p-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/40"
              autoFocus
            />
          )}
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs flex items-center gap-1"
            >
              <Save className="h-3 w-3" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div 
        className={`group relative cursor-pointer hover:bg-white/5 rounded p-1 transition-colors ${className}`}
        onClick={() => handleEdit(section, field, value)}
      >
        <span className={value ? '' : 'text-white/40 italic'}>
          {value || placeholder}
        </span>
        <Edit3 className="h-3 w-3 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-white/60" />
      </div>
    );
  };

  if (!localPortfolio) {
    return (
      <div className={`bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-lg p-8 ${className}`}>
        <div className="text-center text-white/60">
          <p>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!localPortfolio.structure) {
    console.log('Portfolio structure missing:', localPortfolio);
    return (
      <div className={`bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-lg p-8 ${className}`}>
        <div className="text-center text-white/60">
          <p>Portfolio structure not available</p>
          <p className="text-xs mt-2">Debug: {JSON.stringify(Object.keys(localPortfolio || {}))}</p>
        </div>
      </div>
    );
  }

  const { structure } = localPortfolio;

  return (
    <div className={`bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-lg overflow-hidden ${className}`}>
      {/* Hero Section */}
      <section className="p-8 text-center border-b border-white/10">
        <EditableField
          section="hero"
          field="name"
          value={structure.hero?.name}
          placeholder="Your Full Name"
          className="text-4xl font-bold mb-4 block"
        />
        <EditableField
          section="hero"
          field="title"
          value={structure.hero?.title}
          placeholder="Your Professional Title"
          className="text-xl text-gray-300 mb-6 block"
        />
        <EditableField
          section="hero"
          field="summary"
          value={structure.hero?.summary}
          placeholder="Write a compelling professional summary that highlights your key strengths and career objectives..."
          multiline={true}
          className="text-gray-400 max-w-2xl mx-auto leading-relaxed block"
        />
        
        {/* Contact Info */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
          <EditableField
            section="hero"
            field="contact.email"
            value={structure.hero?.contact?.email}
            placeholder="your.email@example.com"
            className="text-blue-400"
          />
          <EditableField
            section="hero"
            field="contact.phone"
            value={structure.hero?.contact?.phone}
            placeholder="+1 (555) 123-4567"
            className="text-green-400"
          />
          <EditableField
            section="hero"
            field="contact.location"
            value={structure.hero?.contact?.location}
            placeholder="City, State"
            className="text-purple-400"
          />
        </div>
      </section>

      {/* Skills Section */}
      <section className="p-8 border-b border-white/10">
        <h2 className="text-2xl font-bold mb-6">Skills & Expertise</h2>
        
        {/* Technical Skills */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-blue-400">Technical Skills</h3>
            <button
              onClick={() => addArrayItem('skills', 'technical', 'New Skill')}
              className="p-1 hover:bg-white/10 rounded"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {structure.skills?.technical?.map((skill, index) => (
              <div key={index} className="group relative">
                <EditableField
                  section="skills"
                  field={`technical.${index}`}
                  value={skill}
                  placeholder="Skill name"
                  className="px-3 py-1 bg-blue-600/30 rounded-full text-sm"
                />
                <button
                  onClick={() => removeArrayItem('skills', 'technical', index)}
                  className="absolute -top-1 -right-1 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-2 w-2" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-green-400">Tools & Technologies</h3>
            <button
              onClick={() => addArrayItem('skills', 'tools', 'New Tool')}
              className="p-1 hover:bg-white/10 rounded"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {structure.skills?.tools?.map((tool, index) => (
              <div key={index} className="group relative">
                <EditableField
                  section="skills"
                  field={`tools.${index}`}
                  value={tool}
                  placeholder="Tool name"
                  className="px-3 py-1 bg-green-600/30 rounded-full text-sm"
                />
                <button
                  onClick={() => removeArrayItem('skills', 'tools', index)}
                  className="absolute -top-1 -right-1 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-2 w-2" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="p-8 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Professional Experience</h2>
          <button
            onClick={() => addArrayItem('experience', '', {
              title: 'Job Title',
              company: 'Company Name',
              location: 'Location',
              startDate: 'Start Date',
              endDate: 'End Date',
              description: 'Job description...',
              achievements: []
            })}
            className="p-2 hover:bg-white/10 rounded"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        {structure.experience?.map((exp, index) => (
          <motion.div
            key={index}
            className="mb-8 p-4 bg-white/5 rounded-lg group relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <button
              onClick={() => removeArrayItem('experience', '', index)}
              className="absolute top-2 right-2 p-1 bg-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-3 w-3" />
            </button>
            
            <EditableField
              section="experience"
              field={`${index}.title`}
              value={exp.title}
              placeholder="Job Title"
              className="text-xl font-semibold mb-2 block"
            />
            
            <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-300">
              <EditableField
                section="experience"
                field={`${index}.company`}
                value={exp.company}
                placeholder="Company Name"
                className="font-medium"
              />
              <EditableField
                section="experience"
                field={`${index}.location`}
                value={exp.location}
                placeholder="Location"
              />
              <EditableField
                section="experience"
                field={`${index}.startDate`}
                value={exp.startDate}
                placeholder="Start Date"
              />
              <span>-</span>
              <EditableField
                section="experience"
                field={`${index}.endDate`}
                value={exp.endDate}
                placeholder="End Date"
              />
            </div>
            
            <EditableField
              section="experience"
              field={`${index}.description`}
              value={exp.description}
              placeholder="Describe your role, responsibilities, and key accomplishments..."
              multiline={true}
              className="text-gray-400 mb-4 block"
            />
          </motion.div>
        ))}
      </section>

      {/* Projects Section */}
      <section className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Projects</h2>
          <button
            onClick={() => addArrayItem('projects', '', {
              title: 'Project Name',
              description: 'Project description...',
              technologies: [],
              links: { github: '', live: '' }
            })}
            className="p-2 hover:bg-white/10 rounded"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {structure.projects?.map((project, index) => (
            <motion.div
              key={index}
              className="p-6 bg-white/5 rounded-lg group relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => removeArrayItem('projects', '', index)}
                className="absolute top-2 right-2 p-1 bg-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
              
              <EditableField
                section="projects"
                field={`${index}.title`}
                value={project.title}
                placeholder="Project Name"
                className="text-xl font-semibold mb-3 block"
              />
              
              <EditableField
                section="projects"
                field={`${index}.description`}
                value={project.description}
                placeholder="Describe your project, its purpose, and your role in building it..."
                multiline={true}
                className="text-gray-300 mb-4 block"
              />
              
              <div className="flex gap-3">
                {project.links?.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    <Github className="h-4 w-4" />
                    Code
                  </a>
                )}
                {project.links?.live && (
                  <a
                    href={project.links.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-green-400 hover:text-green-300 text-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Live Demo
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LivePortfolioEditor;

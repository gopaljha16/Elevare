import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Github, Mail, Phone, MapPin, Linkedin } from 'lucide-react';
import axios from 'axios';

const PortfolioPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPortfolio();
  }, [id]);

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(`/api/portfolio/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPortfolio(response.data.portfolio);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      setError('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E101A] flex items-center justify-center">
        <div className="text-white">Loading portfolio...</div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-[#0E101A] flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">{error || 'Portfolio not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] rounded-full"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { structure } = portfolio;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0E101A] to-[#1A1B2E] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#121625]/80 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
          <div className="text-sm text-white/60">
            Portfolio Preview
          </div>
        </div>
      </header>

      {/* Portfolio Content */}
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] bg-clip-text text-transparent">
              {structure.hero?.name || 'Your Name'}
            </h1>
            <h2 className="text-2xl md:text-3xl text-gray-300 mb-8">
              {structure.hero?.title || 'Professional Title'}
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {structure.hero?.summary || 'Professional summary goes here'}
            </p>
            
            {/* Contact Info */}
            <div className="mt-8 flex flex-wrap justify-center gap-6">
              {structure.hero?.contact?.email && (
                <a
                  href={`mailto:${structure.hero.contact.email}`}
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  {structure.hero.contact.email}
                </a>
              )}
              {structure.hero?.contact?.phone && (
                <a
                  href={`tel:${structure.hero.contact.phone}`}
                  className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  {structure.hero.contact.phone}
                </a>
              )}
              {structure.hero?.contact?.location && (
                <div className="flex items-center gap-2 text-purple-400">
                  <MapPin className="h-4 w-4" />
                  {structure.hero.contact.location}
                </div>
              )}
              {structure.hero?.contact?.social?.linkedin && (
                <a
                  href={structure.hero.contact.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              )}
            </div>
          </motion.div>
        </section>

        {/* Skills Section */}
        {structure.skills && (
          <section className="py-20 px-6 bg-white/5">
            <div className="max-w-6xl mx-auto">
              <motion.h2
                className="text-4xl font-bold text-center mb-12"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                Skills & Expertise
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Technical Skills */}
                {structure.skills.technical && structure.skills.technical.length > 0 && (
                  <motion.div
                    className="bg-white/5 rounded-xl p-6"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">Technical Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {structure.skills.technical.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-600/30 text-blue-200 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Tools */}
                {structure.skills.tools && structure.skills.tools.length > 0 && (
                  <motion.div
                    className="bg-white/5 rounded-xl p-6"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-xl font-semibold text-green-400 mb-4">Tools & Technologies</h3>
                    <div className="flex flex-wrap gap-2">
                      {structure.skills.tools.map((tool, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-600/30 text-green-200 text-sm rounded-full"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Soft Skills */}
                {structure.skills.soft && structure.skills.soft.length > 0 && (
                  <motion.div
                    className="bg-white/5 rounded-xl p-6"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-xl font-semibold text-purple-400 mb-4">Soft Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {structure.skills.soft.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-600/30 text-purple-200 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Experience Section */}
        {structure.experience && structure.experience.length > 0 && (
          <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto">
              <motion.h2
                className="text-4xl font-bold text-center mb-12"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                Professional Experience
              </motion.h2>
              
              <div className="space-y-8">
                {structure.experience.map((exp, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/5 rounded-xl p-6"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-xl font-semibold mb-2">{exp.title}</h3>
                    <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-300">
                      <span className="font-medium text-[#EC4899]">{exp.company}</span>
                      {exp.location && <span>{exp.location}</span>}
                      <span>{exp.startDate} - {exp.endDate}</span>
                    </div>
                    {exp.description && (
                      <p className="text-gray-300 mb-4">{exp.description}</p>
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="list-disc list-inside text-gray-400 space-y-1">
                        {exp.achievements.map((achievement, i) => (
                          <li key={i}>{achievement}</li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Projects Section */}
        {structure.projects && structure.projects.length > 0 && (
          <section className="py-20 px-6 bg-white/5">
            <div className="max-w-6xl mx-auto">
              <motion.h2
                className="text-4xl font-bold text-center mb-12"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                Featured Projects
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {structure.projects.map((project, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-all"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-xl font-semibold mb-3">{project.title}</h3>
                    <p className="text-gray-300 mb-4">{project.description}</p>
                    
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.map((tech, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    
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
            </div>
          </section>
        )}

        {/* Education Section */}
        {structure.education && structure.education.length > 0 && (
          <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto">
              <motion.h2
                className="text-4xl font-bold text-center mb-12"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                Education
              </motion.h2>
              
              <div className="space-y-6">
                {structure.education.map((edu, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/5 rounded-xl p-6"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-xl font-semibold mb-2">{edu.degree}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                      <span className="font-medium text-[#8B5CF6]">{edu.institution}</span>
                      {edu.location && <span>{edu.location}</span>}
                      <span>{edu.startDate} - {edu.endDate}</span>
                      {edu.gpa && <span>GPA: {edu.gpa}</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-[#EC4899]/20 to-[#8B5CF6]/20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              className="text-4xl font-bold mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Let's Connect
            </motion.h2>
            <motion.p
              className="text-lg text-gray-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Ready to discuss opportunities and collaborate on exciting projects!
            </motion.p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {structure.hero?.contact?.email && (
                <a
                  href={`mailto:${structure.hero.contact.email}`}
                  className="px-8 py-3 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] text-white rounded-full hover:scale-105 transition-transform flex items-center gap-2 justify-center"
                >
                  <Mail className="h-4 w-4" />
                  Get In Touch
                </a>
              )}
              {structure.hero?.contact?.social?.linkedin && (
                <a
                  href={structure.hero.contact.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 border border-white/20 text-white rounded-full hover:bg-white/10 transition-all flex items-center gap-2 justify-center"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PortfolioPreview;

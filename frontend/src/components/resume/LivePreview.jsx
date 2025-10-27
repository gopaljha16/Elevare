import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Linkedin, Github, Globe, Sparkles, TrendingUp } from 'lucide-react';

const LivePreview = ({ resumeData, template, atsScore, aiSuggestions }) => {
  if (!resumeData) return null;

  const { personalInfo, professionalSummary, experience, education, skills } = resumeData;

  return (
    <div className="space-y-6">
      {/* ATS Score Card */}
      {atsScore && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-lg font-semibold">ATS Score</h3>
              </div>
              <p className="text-3xl font-bold">{atsScore.score}/100</p>
              <p className="text-sm opacity-90 mt-1">
                {atsScore.score >= 80 ? 'Excellent!' : atsScore.score >= 60 ? 'Good' : 'Needs Improvement'}
              </p>
            </div>
            <div className="text-right">
              <TrendingUp className="w-12 h-12 opacity-50" />
            </div>
          </div>
          
          {atsScore.strengths && atsScore.strengths.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm font-medium mb-2">Strengths:</p>
              <ul className="text-sm space-y-1 opacity-90">
                {atsScore.strengths.slice(0, 2).map((strength, i) => (
                  <li key={i}>• {strength}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {/* AI Suggestions */}
      {aiSuggestions && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">AI Suggestions</h3>
          </div>
          {aiSuggestions.generalTips && aiSuggestions.generalTips.length > 0 && (
            <ul className="space-y-2 text-sm text-gray-700">
              {aiSuggestions.generalTips.slice(0, 3).map((tip, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      )}

      {/* Resume Preview */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="p-8 md:p-12">
          {/* Header Section */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {personalInfo.fullName || 'Your Name'}
                </h1>
                <p className="text-xl text-blue-600 font-medium mb-4">
                  {personalInfo.jobTitle || 'Your Job Title'}
                </p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {personalInfo.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>{personalInfo.email}</span>
                    </div>
                  )}
                  {personalInfo.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{personalInfo.phone}</span>
                    </div>
                  )}
                  {personalInfo.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{personalInfo.address}</span>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {personalInfo.socialLinks && Object.keys(personalInfo.socialLinks).length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {personalInfo.socialLinks.linkedin && (
                      <a href={personalInfo.socialLinks.linkedin} className="flex items-center space-x-1 text-sm text-blue-600 hover:underline">
                        <Linkedin className="w-4 h-4" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {personalInfo.socialLinks.github && (
                      <a href={personalInfo.socialLinks.github} className="flex items-center space-x-1 text-sm text-blue-600 hover:underline">
                        <Github className="w-4 h-4" />
                        <span>GitHub</span>
                      </a>
                    )}
                    {personalInfo.socialLinks.portfolio && (
                      <a href={personalInfo.socialLinks.portfolio} className="flex items-center space-x-1 text-sm text-blue-600 hover:underline">
                        <Globe className="w-4 h-4" />
                        <span>Portfolio</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Photo */}
              {personalInfo.photo && (
                <div className="ml-6">
                  <img
                    src={personalInfo.photo}
                    alt={personalInfo.fullName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Professional Summary */}
          {professionalSummary && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <span className="w-1 h-6 bg-blue-600 mr-3"></span>
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">{professionalSummary}</p>
            </div>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 mr-3"></span>
                Experience
              </h2>
              <div className="space-y-4">
                {experience.map((exp, index) => (
                  <div key={index} className="relative pl-4 border-l-2 border-gray-200">
                    <div className="mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{exp.jobTitle}</h3>
                      <p className="text-blue-600 font-medium">{exp.company}</p>
                      <p className="text-sm text-gray-500">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                        {exp.location && ` • ${exp.location}`}
                      </p>
                    </div>
                    {exp.description && (
                      <p className="text-gray-700 mb-2">{exp.description}</p>
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {exp.achievements.map((achievement, i) => (
                          <li key={i}>{achievement}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 mr-3"></span>
                Education
              </h2>
              <div className="space-y-3">
                {education.map((edu, index) => (
                  <div key={index} className="relative pl-4 border-l-2 border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                    <p className="text-blue-600 font-medium">{edu.institution}</p>
                    <p className="text-sm text-gray-500">
                      {edu.startDate} - {edu.endDate}
                      {edu.gpa && ` • GPA: ${edu.gpa}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 mr-3"></span>
                Skills
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.technical && skills.technical.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Technical Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.technical.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {skills.soft && skills.soft.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Soft Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.soft.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {skills.languages && skills.languages.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.languages.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {skills.tools && skills.tools.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Tools</h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.tools.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Saving Indicator */}
      <div className="text-center text-sm text-gray-500 flex items-center justify-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Saving your resume...</span>
      </div>
    </div>
  );
};

export default LivePreview;

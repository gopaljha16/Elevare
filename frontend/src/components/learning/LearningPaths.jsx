import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, BentoCard } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AnimatedProgress, CircularProgress } from '../ui/Progress';
import { cn } from '../../lib/utils';

const LearningPaths = () => {
  const [selectedCompany, setSelectedCompany] = useState('google');
  const [selectedSkill, setSelectedSkill] = useState(null);

  const companies = [
    {
      id: 'google',
      name: 'Google',
      logo: '🔍',
      color: 'from-blue-500 to-green-500',
      skills: ['Data Structures & Algorithms', 'System Design', 'Python/Java', 'Machine Learning', 'Distributed Systems'],
      description: 'Master the skills needed for Google\'s technical interviews'
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      logo: '🪟',
      color: 'from-blue-600 to-cyan-500',
      skills: ['C#/.NET', 'Azure Cloud', 'System Design', 'Algorithms', 'DevOps'],
      description: 'Prepare for Microsoft\'s engineering roles'
    },
    {
      id: 'apple',
      name: 'Apple',
      logo: '🍎',
      color: 'from-gray-700 to-gray-900',
      skills: ['Swift/Objective-C', 'iOS Development', 'Hardware-Software Integration', 'Design Patterns', 'Performance Optimization'],
      description: 'Build skills for Apple\'s innovative ecosystem'
    },
    {
      id: 'amazon',
      name: 'Amazon',
      logo: '📦',
      color: 'from-orange-500 to-yellow-500',
      skills: ['AWS', 'Scalable Systems', 'Leadership Principles', 'Java/Python', 'Microservices'],
      description: 'Learn Amazon\'s customer-obsessed approach'
    }
  ];

  const skillDetails = {
    'Data Structures & Algorithms': {
      progress: 75,
      timeSpent: '24 hours',
      resources: [
        { type: 'video', title: 'Arrays and Strings Masterclass', provider: 'YouTube', duration: '2h 30m', completed: true },
        { type: 'practice', title: 'LeetCode Easy Problems', provider: 'LeetCode', duration: '50 problems', completed: true },
        { type: 'article', title: 'Big O Notation Guide', provider: 'GeeksforGeeks', duration: '15 min', completed: false },
        { type: 'course', title: 'Advanced Algorithms', provider: 'Coursera', duration: '6 weeks', completed: false }
      ]
    },
    'System Design': {
      progress: 45,
      timeSpent: '18 hours',
      resources: [
        { type: 'video', title: 'System Design Fundamentals', provider: 'YouTube', duration: '3h 15m', completed: true },
        { type: 'article', title: 'Designing Data-Intensive Applications', provider: 'Book', duration: '8 hours', completed: false },
        { type: 'practice', title: 'Design Twitter', provider: 'InterviewBit', duration: '2 hours', completed: false }
      ]
    }
  };

  const selectedCompanyData = companies.find(c => c.id === selectedCompany);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Learning Paths
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Company-specific skill roadmaps to land your dream job
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="glass" className="px-4 py-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse" />
                Learning Active
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Company Selection */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Choose Your Target Company</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {companies.map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <button
                  onClick={() => setSelectedCompany(company.id)}
                  className={cn(
                    "w-full p-6 rounded-2xl border-2 transition-all duration-300 text-left",
                    selectedCompany === company.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md"
                  )}
                >
                  <div className="flex items-center mb-3">
                    <span className="text-3xl mr-3">{company.logo}</span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{company.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{company.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {company.skills.slice(0, 3).map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {company.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{company.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Selected Company Roadmap */}
        {selectedCompanyData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Skills Tree */}
            <div className="lg:col-span-2">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="text-2xl mr-3">{selectedCompanyData.logo}</span>
                    {selectedCompanyData.name} Learning Path
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedCompanyData.skills.map((skill, index) => {
                      const progress = Math.floor(Math.random() * 100);
                      const isActive = selectedSkill === skill;
                      
                      return (
                        <motion.div
                          key={skill}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.1 * index }}
                          className={cn(
                            "p-4 rounded-xl border-2 cursor-pointer transition-all duration-300",
                            isActive
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          )}
                          onClick={() => setSelectedSkill(skill)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{skill}</h4>
                            <Badge 
                              variant={progress >= 80 ? 'success' : progress >= 50 ? 'warning' : 'secondary'}
                              className="text-xs"
                            >
                              {progress}%
                            </Badge>
                          </div>
                          <AnimatedProgress value={progress} showValue={false} />
                          <div className="flex items-center justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>{Math.floor(progress / 10)} resources completed</span>
                            <span>{Math.floor(Math.random() * 20) + 5}h estimated</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skill Details & Resources */}
            <div className="space-y-6">
              
              {/* Overall Progress */}
              <BentoCard>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Overall Progress
                  </h3>
                  <CircularProgress value={68} size={120} />
                  <div className="mt-4 space-y-2">
                    <Badge variant="success" className="text-xs">
                      On Track
                    </Badge>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      3 of 5 skills mastered
                    </p>
                  </div>
                </div>
              </BentoCard>

              {/* Skill Resources */}
              {selectedSkill && skillDetails[selectedSkill] && (
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                  <CardHeader>
                    <CardTitle className="text-lg">{selectedSkill}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-medium">{skillDetails[selectedSkill].progress}%</span>
                      </div>
                      <AnimatedProgress value={skillDetails[selectedSkill].progress} />
                      
                      <div className="space-y-3 mt-6">
                        <h4 className="font-medium text-gray-900 dark:text-white">Resources</h4>
                        {skillDetails[selectedSkill].resources.map((resource, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs",
                              resource.type === 'video' && "bg-red-500",
                              resource.type === 'article' && "bg-blue-500",
                              resource.type === 'course' && "bg-green-500",
                              resource.type === 'practice' && "bg-purple-500"
                            )}>
                              {resource.type === 'video' && '▶'}
                              {resource.type === 'article' && '📄'}
                              {resource.type === 'course' && '🎓'}
                              {resource.type === 'practice' && '💻'}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{resource.title}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{resource.provider} • {resource.duration}</p>
                            </div>
                            {resource.completed && (
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Learning Stats */}
              <BentoCard>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Learning Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Time</span>
                    <span className="font-medium">42h 15m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Resources Completed</span>
                    <span className="font-medium">18/25</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Current Streak</span>
                    <span className="font-medium text-orange-600">7 days 🔥</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Next Milestone</span>
                    <span className="font-medium">System Design</span>
                  </div>
                </div>
              </BentoCard>

              {/* Quick Actions */}
              <div className="space-y-3">
                <Button variant="gradient" className="w-full">
                  Continue Learning
                </Button>
                <Button variant="outline" className="w-full">
                  Take Skill Assessment
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPaths;
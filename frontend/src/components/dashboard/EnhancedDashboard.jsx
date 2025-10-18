import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BentoGrid, 
  BentoGridItem, 
  StatsBentoCard, 
  ChartBentoCard, 
  FeatureBentoCard 
} from '../ui/BentoGrid';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AnimatedProgress, CircularProgress } from '../ui/Progress';
import { LineChart, BarChart, PieChart } from '../ui/Chart';
import { useAuthContext } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

const EnhancedDashboard = () => {
  const { user } = useAuthContext();
  const [stats, setStats] = useState({
    resumesCreated: 3,
    atsScore: 85,
    interviewsCompleted: 12,
    skillsLearned: 8,
    jobMatches: 24,
    profileViews: 156
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-6">
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
              Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Here's your career development progress
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="glass" className="px-4 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              Online
            </Badge>
            <Button variant="gradient" size="lg" onClick={() => window.location.href = '/resume-builder'}>
              Create Resume
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Bento Grid Dashboard */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <BentoGrid className="grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          
          {/* Hero Welcome Card */}
          <motion.div variants={itemVariants}>
            <BentoGridItem
              size="hero"
              className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white border-none col-span-full md:col-span-3 lg:col-span-4 row-span-2"
            >
              <div className="flex flex-col justify-between h-full">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Your Career Journey</h2>
                  <p className="text-blue-100 text-lg mb-6">
                    Track your progress, optimize your resume, and land your dream job with AI-powered insights.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="glass" size="lg" onClick={() => window.location.href = '/resume-builder'}>
                      Create Resume
                    </Button>
                    <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10" onClick={() => window.location.href = '/ats-analyzer'}>
                      ATS Score Analyzer
                    </Button>
                    <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10" onClick={() => window.location.href = '/interview-prep'}>
                      Start Interview Prep
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-8">
                  <div className="text-sm text-blue-100">
                    Last updated: {new Date().toLocaleDateString()}
                  </div>
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 bg-white/20 rounded-full border-2 border-white/30" />
                    ))}
                  </div>
                </div>
              </div>
            </BentoGridItem>
          </motion.div>

          {/* ATS Score Card */}
          <motion.div variants={itemVariants}>
            <BentoGridItem
              size="default"
              className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 flex flex-col items-center justify-center"
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  ATS Score
                </h3>
                <CircularProgress value={stats.atsScore} size={120} />
                <div className="mt-4 space-y-2">
                  <Badge variant="success" className="text-xs">
                    Excellent Score
                  </Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your resume is highly optimized for ATS systems
                  </p>
                </div>
              </div>
            </BentoGridItem>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={itemVariants}>
            <StatsBentoCard
              title="Resumes Created"
              value={stats.resumesCreated}
              change="+2 this month"
              trend="up"
              icon={
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatsBentoCard
              title="Job Matches"
              value={stats.jobMatches}
              change="+12 this week"
              trend="up"
              icon={
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
                </svg>
              }
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatsBentoCard
              title="Interview Practice"
              value={stats.interviewsCompleted}
              change="+5 this week"
              trend="up"
              icon={
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatsBentoCard
              title="Skills Learned"
              value={stats.skillsLearned}
              change="+3 this month"
              trend="up"
              icon={
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
            />
          </motion.div>

          {/* Learning Progress */}
          <motion.div variants={itemVariants}>
            <BentoGridItem
              size="wide"
              title="Learning Progress"
              className="col-span-1 md:col-span-3 lg:col-span-3"
            >
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">React Development</span>
                    <span className="font-medium">75%</span>
                  </div>
                  <AnimatedProgress value={75} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">System Design</span>
                    <span className="font-medium">60%</span>
                  </div>
                  <AnimatedProgress value={60} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Data Structures</span>
                    <span className="font-medium">90%</span>
                  </div>
                  <AnimatedProgress value={90} />
                </div>
              </div>
            </BentoGridItem>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <BentoGridItem
              size="default"
              title="Recent Activity"
              className="col-span-1 md:col-span-2 lg:col-span-2"
            >
              <div className="space-y-3">
                {[
                  { action: "Completed React interview prep", time: "2 hours ago", type: "interview" },
                  { action: "Updated resume template", time: "1 day ago", type: "resume" },
                  { action: "Learned System Design basics", time: "3 days ago", type: "learning" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      activity.type === "interview" && "bg-purple-500",
                      activity.type === "resume" && "bg-blue-500",
                      activity.type === "learning" && "bg-green-500"
                    )} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </BentoGridItem>
          </motion.div>

          {/* Performance Chart */}
          <motion.div variants={itemVariants}>
            <ChartBentoCard title="Interview Performance">
              <BarChart className="w-full h-32" />
            </ChartBentoCard>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <FeatureBentoCard
              title="Quick Actions"
              description="Get started with your career development"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              action={
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = '/resume-builder'}>
                    Create Resume
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => window.location.href = '/interview-prep'}>
                    Start Interview
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => window.location.href = '/learning-paths'}>
                    Learning Paths
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => window.location.href = '/ai-features'}>
                    AI Features
                  </Button>
                </div>
              }
            />
          </motion.div>

        </BentoGrid>
      </motion.div>
    </div>
  );
};

export default EnhancedDashboard;
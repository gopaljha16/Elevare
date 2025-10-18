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

const ComprehensiveDashboard = () => {
  const { user } = useAuthContext();
  const [stats, setStats] = useState({
    resumesCreated: 5,
    atsScore: 87,
    interviewsCompleted: 18,
    skillsLearned: 12,
    jobMatches: 34,
    profileViews: 245,
    applicationsSent: 23,
    interviewsScheduled: 8,
    offers: 2
  });

  const [goals, setGoals] = useState([
    { id: 1, title: 'Complete React Learning Path', progress: 75, target: 100 },
    { id: 2, title: 'Improve ATS Score to 90%', progress: 87, target: 90 },
    { id: 3, title: 'Apply to 50 Jobs', progress: 23, target: 50 },
    { id: 4, title: 'Complete 5 Mock Interviews', progress: 3, target: 5 }
  ]);

  const [achievements, setAchievements] = useState([
    { id: 1, title: 'Resume Ready', description: 'Created your first optimized resume', earned: true, icon: '📄' },
    { id: 2, title: 'Interview Ace', description: 'Completed 10 mock interviews', earned: true, icon: '🎯' },
    { id: 3, title: 'Skill Master', description: 'Completed 3 learning paths', earned: false, icon: '🏆' },
    { id: 4, title: 'Job Hunter', description: 'Applied to 25+ positions', earned: true, icon: '🚀' }
  ]);

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
              Career Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track your career progress and achievements
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="glass" className="px-4 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              Career Score: {stats.atsScore}%
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Main Dashboard Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <BentoGrid className="grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          
          {/* Career Overview Card */}
          <motion.div variants={itemVariants}>
            <BentoGridItem
              size="hero"
              className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white border-none col-span-full md:col-span-3 lg:col-span-4 row-span-2"
            >
              <div className="flex flex-col justify-between h-full">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Career Progress Overview</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.applicationsSent}</div>
                      <div className="text-blue-100 text-sm">Applications</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.interviewsScheduled}</div>
                      <div className="text-blue-100 text-sm">Interviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.offers}</div>
                      <div className="text-blue-100 text-sm">Offers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Math.round((stats.offers / stats.applicationsSent) * 100)}%</div>
                      <div className="text-blue-100 text-sm">Success Rate</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="glass" size="lg">
                      View Full Report
                    </Button>
                    <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                      Set New Goals
                    </Button>
                  </div>
                </div>
              </div>
            </BentoGridItem>
          </motion.div>

          {/* Career Readiness Score */}
          <motion.div variants={itemVariants}>
            <BentoGridItem
              size="default"
              className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 flex flex-col items-center justify-center"
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Career Readiness
                </h3>
                <CircularProgress value={stats.atsScore} size={120} />
                <div className="mt-4 space-y-2">
                  <Badge variant="success" className="text-xs">
                    Excellent Progress
                  </Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You're ready for senior positions
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
              title="Profile Views"
              value={stats.profileViews}
              change="+45 this week"
              trend="up"
              icon={
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
                </svg>
              }
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatsBentoCard
              title="Skills Learned"
              value={stats.skillsLearned}
              change="+4 this month"
              trend="up"
              icon={
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
            />
          </motion.div>

          {/* Goals Progress */}
          <motion.div variants={itemVariants}>
            <BentoGridItem
              size="wide"
              title="Career Goals Progress"
              className="col-span-1 md:col-span-3 lg:col-span-3"
            >
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal.id}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">{goal.title}</span>
                      <span className="font-medium">{goal.progress}/{goal.target}</span>
                    </div>
                    <AnimatedProgress value={(goal.progress / goal.target) * 100} />
                  </div>
                ))}
              </div>
            </BentoGridItem>
          </motion.div>

          {/* Achievements */}
          <motion.div variants={itemVariants}>
            <BentoGridItem
              size="default"
              title="Achievements"
              className="col-span-1 md:col-span-2 lg:col-span-2"
            >
              <div className="space-y-3">
                {achievements.slice(0, 4).map((achievement) => (
                  <div key={achievement.id} className={cn(
                    "flex items-center space-x-3 p-2 rounded-lg transition-colors",
                    achievement.earned 
                      ? "bg-green-50 dark:bg-green-900/20" 
                      : "bg-gray-50 dark:bg-gray-800/50"
                  )}>
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <p className={cn(
                        "text-sm font-medium",
                        achievement.earned 
                          ? "text-green-800 dark:text-green-300" 
                          : "text-gray-600 dark:text-gray-400"
                      )}>
                        {achievement.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.earned && (
                      <Badge variant="success" className="text-xs">
                        ✓
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </BentoGridItem>
          </motion.div>

          {/* Application Funnel Chart */}
          <motion.div variants={itemVariants}>
            <ChartBentoCard title="Application Funnel">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Applications</span>
                  <span className="font-medium">{stats.applicationsSent}</span>
                </div>
                <AnimatedProgress value={100} />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Interviews</span>
                  <span className="font-medium">{stats.interviewsScheduled}</span>
                </div>
                <AnimatedProgress value={(stats.interviewsScheduled / stats.applicationsSent) * 100} />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Offers</span>
                  <span className="font-medium">{stats.offers}</span>
                </div>
                <AnimatedProgress value={(stats.offers / stats.applicationsSent) * 100} />
              </div>
            </ChartBentoCard>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <FeatureBentoCard
              title="Quick Actions"
              description="Continue your career journey"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              action={
                <div className="space-y-2">
                  <Button variant="gradient" size="sm" className="w-full">
                    Apply to Jobs
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Practice Interview
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full">
                    Update Resume
                  </Button>
                </div>
              }
            />
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
                  { action: "Applied to Senior React Developer at TechCorp", time: "2 hours ago", type: "application" },
                  { action: "Completed System Design interview prep", time: "1 day ago", type: "interview" },
                  { action: "Updated resume with new project", time: "2 days ago", type: "resume" },
                  { action: "Earned 'Interview Ace' achievement", time: "3 days ago", type: "achievement" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      activity.type === "application" && "bg-blue-500",
                      activity.type === "interview" && "bg-purple-500",
                      activity.type === "resume" && "bg-green-500",
                      activity.type === "achievement" && "bg-yellow-500"
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

        </BentoGrid>
      </motion.div>
    </div>
  );
};

export default ComprehensiveDashboard;
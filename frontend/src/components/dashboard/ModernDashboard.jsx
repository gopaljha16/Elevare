import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import axios from 'axios';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Search,
  Bell,
  Mail,
  TrendingUp,
  Award,
  Target,
  Calendar,
  Clock,
  BarChart3,
  BookOpen,
  Briefcase,
  Globe,
  Eye,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';

const ModernDashboard = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [goalsData, setGoalsData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [achievementsData, setAchievementsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSidebar, setActiveSidebar] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [mainRes, goalsRes, weeklyRes, achievementsRes] = await Promise.all([
        axios.get('/api/dashboard/data', { headers }),
        axios.get('/api/dashboard/goals', { headers }),
        axios.get('/api/dashboard/weekly-progress', { headers }),
        axios.get('/api/dashboard/achievements', { headers })
      ]);

      setDashboardData(mainRes.data.data);
      setGoalsData(goalsRes.data.data);
      setWeeklyData(weeklyRes.data.data);
      setAchievementsData(achievementsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);

      if (!dashboardData) {
        setDashboardData({
          summary: {
            totalResumes: 0,
            completedInterviews: 0,
            activeLearningPaths: 0,
            totalPortfolios: 0,
            publishedPortfolios: 0,
            currentStreak: 0
          },
          resumeStats: { averageATSScore: 0, highestATSScore: 0 },
          interviewStats: { totalSessions: 0, averageScore: 0 },
          learningStats: { totalPaths: 0, averageProgress: 0, currentStreak: 0 },
          portfolioStats: { totalViews: 0, totalPortfolios: 0 },
          recentActivity: [],
          careerReadinessScore: 0
        });
      }

      if (!goalsData) {
        setGoalsData({
          weeklyGoals: {
            resumeOptimizations: 1,
            interviewSessions: 3,
            learningHours: 5
          },
          currentProgress: {
            resumeOptimizations: 0,
            interviewSessions: 0,
            learningHours: 0
          },
          progressPercentage: {
            resumeOptimizations: 0,
            interviewSessions: 0,
            learningHours: 0
          }
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resumeWeeklyCount = weeklyData?.resumeActivity?.reduce((sum, w) => sum + (w.count || 0), 0) || 0;
  const interviewWeeklyCount = weeklyData?.interviewActivity?.reduce((sum, w) => sum + (w.count || 0), 0) || 0;
  const learningWeeklyHours = weeklyData?.learningActivity?.reduce((sum, w) => sum + (w.totalTimeSpent || 0), 0) || 0;
  const learningWeeklyHoursRounded = Math.round(learningWeeklyHours / 60) || 0;

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'resumes', label: 'My Resumes', icon: FileText, path: '/resume-dashboard' },
    { id: 'portfolios', label: 'Portfolios', icon: Globe, path: '/portfolio-dashboard' },
    { id: 'interviews', label: 'Interview Prep', icon: MessageSquare, path: '/interview-prep' },
    { id: 'learning', label: 'Learning Paths', icon: BookOpen, path: '/learning-paths' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || user.name?.split(' ')[0] || '';
    const lastName = user.lastName || user.name?.split(' ')[1] || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f1e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f1e] flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="w-70 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col"
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Elevare</h1>
              <p className="text-xs text-white/60">Career Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider px-3 mb-3">Overview</p>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSidebar === item.id;
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setActiveSidebar(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-6">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider px-3 mb-3">Settings</p>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all w-full">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search your courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
                <Mail className="w-6 h-6 text-white/60" />
              </button>
              <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
                <Bell className="w-6 h-6 text-white/60" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full"></span>
              </button>
              
              {/* User Profile */}
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  {getUserInitials()}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    {user?.firstName || user?.name || 'User'}
                  </p>
                  <p className="text-xs text-white/60">Premium</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Hero Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 rounded-3xl p-8 mb-8 overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10">
              <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold text-white mb-4">
                <Zap className="w-4 h-4 inline mr-2" />
                AI-POWERED CAREER PLATFORM
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Sharpen Your Skills with<br />Professional Career Tools
              </h1>
              <p className="text-white/90 text-lg mb-6 max-w-2xl">
                Continue your learning to achieve your target goals
              </p>
              <button
                onClick={() => navigate('/resume-builder')}
                className="px-6 py-3 bg-[#1a1a2e] text-white rounded-full font-semibold hover:bg-[#0f0f1e] transition-all flex items-center gap-2"
              >
                Build Resume
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-xs font-semibold text-green-400">
                  {resumeWeeklyCount > 0 ? `+${resumeWeeklyCount} this week` : 'This week'}
                </span>
              </div>
              <h3 className="text-sm text-white/60 mb-1">Resumes</h3>
              <p className="text-3xl font-bold text-white">{dashboardData?.summary?.totalResumes || 0}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-pink-400" />
                </div>
                <span className="text-xs font-semibold text-green-400">
                  {interviewWeeklyCount > 0 ? `+${interviewWeeklyCount} this week` : 'This week'}
                </span>
              </div>
              <h3 className="text-sm text-white/60 mb-1">Interviews</h3>
              <p className="text-3xl font-bold text-white">{dashboardData?.summary?.completedInterviews || 0}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-xs font-semibold text-green-400">{dashboardData?.summary?.publishedPortfolios || 0} live</span>
              </div>
              <h3 className="text-sm text-white/60 mb-1">Portfolios</h3>
              <p className="text-3xl font-bold text-white">{dashboardData?.summary?.totalPortfolios || 0}</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Continue Watching / Recent Activity */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Continue Working</h2>
                <Link to="/resumes" className="text-purple-400 hover:text-purple-300 text-sm font-semibold flex items-center gap-1">
                  See all
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dashboardData?.recentActivity?.slice(0, 4).map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all cursor-pointer group"
                  >
                    <div className="h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          activity.type === 'resume' ? 'bg-purple-500/30 text-purple-200' :
                          activity.type === 'portfolio' ? 'bg-blue-500/30 text-blue-200' :
                          activity.type === 'interview' ? 'bg-pink-500/30 text-pink-200' :
                          'bg-green-500/30 text-green-200'
                        }`}>
                          {activity.type}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                        {activity.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-white/60">
                        <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                        {activity.metadata?.atsScore && (
                          <span className="text-green-400 font-semibold">{activity.metadata.atsScore}% ATS</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Statistic & Your Mentor */}
            <div className="space-y-6">
              {/* Statistic Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">Statistic</h3>
                  <button className="text-white/60 hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(dashboardData?.resumeStats?.averageATSScore || 0) * 3.51} 351.68`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-white">{dashboardData?.resumeStats?.averageATSScore || 0}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className="text-white font-semibold text-lg mb-1">{getGreeting()}, {user?.firstName || 'User'}! 🔥</p>
                  <p className="text-white/60 text-sm">Continue your learning to achieve your target!</p>
                </div>

                {/* Progress Chart */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">ATS Score</span>
                    <span className="text-white font-semibold">{dashboardData?.resumeStats?.averageATSScore || 0}%</span>
                  </div>
                  <div className="flex gap-1 h-12">
                    {(weeklyData?.resumeActivity && weeklyData.resumeActivity.length > 0
                      ? weeklyData.resumeActivity
                      : [{ avgATSScore: dashboardData?.resumeStats?.averageATSScore || 0 }]
                    ).map((entry, i) => {
                      const value = entry.avgATSScore ?? dashboardData?.resumeStats?.averageATSScore ?? 0;
                      const height = Math.max(8, Math.min(value, 100));
                      return (
                        <div key={i} className="flex-1 bg-purple-500/20 rounded-t-lg relative overflow-hidden">
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg transition-all"
                            style={{ height: `${height}%` }}
                          ></div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Recent</span>
                    <span>Weeks</span>
                    <span>Trend</span>
                  </div>
                </div>
              </motion.div>

              {/* Your Progress - powered by real weekly goals */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">Your Weekly Goals</h3>
                  <span className="text-xs text-white/50">Auto-calculated from your activity</span>
                </div>

                <div className="space-y-4">
                  {goalsData ? (
                    [
                      { key: 'resumeOptimizations', label: 'Resume Optimizations', color: 'from-purple-500 to-pink-500' },
                      { key: 'interviewSessions', label: 'Interview Sessions', color: 'from-blue-500 to-cyan-500' },
                      { key: 'learningHours', label: 'Learning Hours', color: 'from-emerald-500 to-lime-500' }
                    ].map((goal) => {
                      const target = goalsData.weeklyGoals?.[goal.key] ?? 0;
                      const current = goalsData.currentProgress?.[goal.key] ?? 0;
                      const percent = goalsData.progressPercentage?.[goal.key] ?? 0;

                      return (
                        <div key={goal.key} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <p className="text-white font-medium">{goal.label}</p>
                            <span className="text-white/60">
                              {current}/{target || 1}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${goal.color}`}
                              style={{ width: `${Math.min(percent || 0, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-white/60">
                      Your weekly goals and progress will appear here as you use resumes, interview prep, and learning paths.
                    </p>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-bold text-white">Achievements</h3>
                  </div>
                  <span className="text-xs text-white/50">
                    {achievementsData?.totalAchievements || 0} total
                  </span>
                </div>

                {achievementsData?.achievements && achievementsData.achievements.length > 0 ? (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {achievementsData.achievements.slice(0, 4).map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between gap-3 bg-white/5 rounded-xl px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">
                            {achievement.title || achievement.type}
                          </p>
                          {achievement.description && (
                            <p className="text-xs text-white/60 line-clamp-2">
                              {achievement.description}
                            </p>
                          )}
                          <p className="text-[11px] text-white/40 mt-1">
                            {achievement.earnedAt ? new Date(achievement.earnedAt).toLocaleDateString() : ''}
                          </p>
                        </div>
                        {achievement.category && (
                          <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-white/10 text-white/70 capitalize">
                            {achievement.category}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/60">
                    Complete resumes, interviews, and learning paths to unlock achievements.
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ModernDashboard;

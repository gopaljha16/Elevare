import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { cn } from '../utils/cn';
import {
  Brain, Target, TrendingUp, Clock, Award, Zap, ChevronRight, Play, Pause, SkipForward,
  CheckCircle, XCircle, Lightbulb, BarChart3, Sparkles, MessageSquare, Code, Users,
  Building2, ArrowRight, Star, Trophy, Flame
} from 'lucide-react';
import axios from 'axios';
import { SetupView, SessionView, ResultsView } from '../components/interview/InterviewViews';

const InterviewPrep = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  
  const [activeView, setActiveView] = useState('home');
  const [sessionConfig, setSessionConfig] = useState({
    company: '', role: '', sessionType: 'technical', difficulty: 'medium', questionCount: 5, useAI: true
  });
  
  const [currentSession, setCurrentSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [sessionResults, setSessionResults] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [userStats, setUserStats] = useState({
    totalSessions: 0, averageScore: 0, confidenceLevel: 0, improvementTrend: 0, completedQuestions: 0, correctAnswers: 0
  });

  useEffect(() => {
    let interval;
    if (isTimerRunning && activeView === 'session') {
      interval = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, activeView]);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/interviews/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setUserStats({
          totalSessions: response.data.data.totalSessions || 0,
          averageScore: Math.round(response.data.data.averageScore || 0),
          confidenceLevel: Math.round(response.data.data.averageConfidence || 0),
          improvementTrend: response.data.data.improvementTrend || 0,
          completedQuestions: response.data.data.totalSessions * 5 || 0,
          correctAnswers: Math.round((response.data.data.averageScore || 0) * 0.05) || 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const startSession = async () => {
    if (!sessionConfig.company.trim() || !sessionConfig.role.trim()) {
      showError('Please enter both company and role');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/interviews/start`,
        sessionConfig,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setCurrentSession(response.data.data.session);
        setCurrentQuestionIndex(0);
        setCurrentAnswer('');
        setTimeElapsed(0);
        setIsTimerRunning(true);
        setActiveView('session');
        success('Interview session started!');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) {
      showError('Please provide an answer');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/interviews/${currentSession.id}/answer`,
        { answer: currentAnswer, timeSpent: timeElapsed, useAI: sessionConfig.useAI },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        if (response.data.data.sessionComplete) {
          setSessionResults(response.data.data.sessionSummary);
          setIsTimerRunning(false);
          setActiveView('results');
          fetchUserStats();
        } else {
          setCurrentQuestionIndex(prev => prev + 1);
          setCurrentAnswer('');
          setShowHint(false);
          setTimeElapsed(0);
          success(`Score: ${response.data.data.score}/100`);
        }
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      {activeView === 'home' && (
        <HomeView 
          setActiveView={setActiveView} 
          navigate={navigate} 
        />
      )}
      {activeView === 'setup' && (
        <SetupView 
          setActiveView={setActiveView} 
          sessionConfig={sessionConfig} 
          setSessionConfig={setSessionConfig} 
          userStats={userStats} 
          startSession={startSession} 
          loading={loading} 
        />
      )}
      {activeView === 'session' && (
        <SessionView 
          currentSession={currentSession} 
          currentQuestionIndex={currentQuestionIndex} 
          timeElapsed={timeElapsed} 
          formatTime={formatTime} 
          currentAnswer={currentAnswer} 
          setCurrentAnswer={setCurrentAnswer} 
          showHint={showHint} 
          setShowHint={setShowHint} 
          submitAnswer={submitAnswer} 
          loading={loading} 
          sessionConfig={sessionConfig} 
        />
      )}
      {activeView === 'results' && (
        <ResultsView 
          sessionResults={sessionResults} 
          setActiveView={setActiveView} 
          fetchUserStats={fetchUserStats} 
        />
      )}
    </div>
  );
};

// Home View Component
const HomeView = ({ setActiveView, navigate }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
    <section className="relative overflow-hidden py-20 px-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-700" />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Badge variant="outline" className="mb-6 px-4 py-2 text-sm border-blue-500/30 bg-blue-500/10 text-blue-300">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Interview Preparation
          </Badge>
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Transform interview prep into
            </span>
            <br />
            <span className="text-white">product growth</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12">
            All interview questions unified automatically and categorized accurately to empower you
            to land your dream job at top tech companies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={() => setActiveView('setup')}>
              Get Started <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="xl" className="px-8 py-6 text-lg border-gray-700 text-gray-300 hover:bg-gray-800/50" onClick={() => navigate('/interview-planner')}>
              Learn more <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
        <motion.div className="text-center mb-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
          <p className="text-sm text-gray-500 mb-6">Trusted by candidates preparing for</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            {['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix'].map((company) => (
              <div key={company} className="text-2xl font-semibold text-gray-400">{company}</div>
            ))}
          </div>
        </motion.div>
        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
          {[
            { icon: Users, label: 'Active Users', value: '10K+', color: 'blue' },
            { icon: Brain, label: 'AI Questions', value: '50K+', color: 'purple' },
            { icon: Trophy, label: 'Success Rate', value: '85%', color: 'green' },
            { icon: Flame, label: 'Daily Sessions', value: '2K+', color: 'orange' }
          ].map((stat, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-800 backdrop-blur-sm text-center p-6">
              <stat.icon className={`w-8 h-8 mx-auto mb-3 text-${stat.color}-400`} />
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </Card>
          ))}
        </motion.div>
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}>
          {[
            { icon: Brain, title: 'AI-Generated Questions', description: 'Get personalized questions based on company, role, and difficulty level', color: 'blue' },
            { icon: MessageSquare, title: 'Real-time Feedback', description: 'Receive instant AI-powered evaluation and improvement suggestions', color: 'purple' },
            { icon: BarChart3, title: 'Progress Tracking', description: 'Monitor your improvement with detailed analytics and insights', color: 'green' }
          ].map((feature, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:border-gray-700 transition-all duration-300">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-${feature.color}-500/10 flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                </div>
                <CardTitle className="text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  </div>
);

export default InterviewPrep;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CircularProgress, AnimatedProgress } from '../ui/Progress';
import { useToast } from '../ui/Toast';
import { cn } from '../../lib/utils';

const InterviewPrep = () => {
  const [currentSession, setCurrentSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionType, setSessionType] = useState('technical');
  const [difficulty, setDifficulty] = useState('medium');
  const [company, setCompany] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const { success, error } = useToast();

  const mockQuestions = {
    technical: [
      {
        id: 1,
        type: 'multiple-choice',
        difficulty: 'medium',
        question: 'What is the time complexity of searching in a balanced binary search tree?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctAnswer: 1,
        explanation: 'In a balanced BST, the height is log n, so search operations take O(log n) time.'
      },
      {
        id: 2,
        type: 'coding',
        difficulty: 'medium',
        question: 'Implement a function to reverse a linked list iteratively.',
        hint: 'Use three pointers: previous, current, and next.',
        explanation: 'Keep track of the previous node and reverse the links as you traverse.'
      },
      {
        id: 3,
        type: 'open-ended',
        difficulty: 'easy',
        question: 'Explain the difference between REST and GraphQL APIs.',
        hint: 'Consider data fetching, flexibility, and caching.',
        explanation: 'REST uses multiple endpoints while GraphQL uses a single endpoint with flexible queries.'
      }
    ],
    behavioral: [
      {
        id: 4,
        type: 'open-ended',
        difficulty: 'medium',
        question: 'Tell me about a time when you had to work with a difficult team member.',
        hint: 'Use the STAR method: Situation, Task, Action, Result.',
        explanation: 'Focus on your problem-solving and communication skills.'
      },
      {
        id: 5,
        type: 'open-ended',
        difficulty: 'medium',
        question: 'Describe a challenging project you worked on and how you overcame obstacles.',
        hint: 'Highlight your technical and soft skills.',
        explanation: 'Show your ability to handle pressure and find creative solutions.'
      }
    ]
  };

  const [sessionStats, setSessionStats] = useState({
    totalSessions: 18,
    averageScore: 78,
    confidenceLevel: 85,
    improvementTrend: 12,
    completedQuestions: 156,
    correctAnswers: 121
  });

  useEffect(() => {
    let timer;
    if (isSessionActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isSessionActive) {
      handleTimeUp();
    }
    return () => clearInterval(timer);
  }, [isSessionActive, timeLeft]);

  const startSession = () => {
    if (!company.trim()) {
      error('Please enter a company name');
      return;
    }

    const questions = [...mockQuestions[sessionType]];
    setCurrentSession({
      id: Date.now(),
      type: sessionType,
      difficulty,
      company,
      questions,
      startTime: new Date(),
      totalQuestions: questions.length
    });
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(questions.length * 180); // 3 minutes per question
    setIsSessionActive(true);
    success('Interview session started!');
  };

  const handleAnswer = (answer) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < currentSession.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      endSession();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const endSession = () => {
    setIsSessionActive(false);
    const score = calculateScore();
    success(`Session completed! Score: ${score}%`);

    // Update stats
    setSessionStats(prev => ({
      ...prev,
      totalSessions: prev.totalSessions + 1,
      completedQuestions: prev.completedQuestions + currentSession.questions.length,
      correctAnswers: prev.correctAnswers + Math.floor(currentSession.questions.length * (score / 100))
    }));
  };

  const handleTimeUp = () => {
    error('Time is up!');
    endSession();
  };

  const calculateScore = () => {
    if (!currentSession) return 0;

    let correct = 0;
    currentSession.questions.forEach((question, index) => {
      if (question.type === 'multiple-choice' && answers[index] === question.correctAnswer) {
        correct++;
      } else if (question.type !== 'multiple-choice' && answers[index]) {
        // For open-ended questions, assume answered = correct for demo
        correct++;
      }
    });

    return Math.round((correct / currentSession.questions.length) * 100);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSessionActive && !currentSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-6">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Interview Preparation
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Practice with AI-generated questions and improve your interview skills
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 text-center p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">{sessionStats.totalSessions}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sessions Completed</div>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 text-center p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">{sessionStats.averageScore}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 text-center p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">{sessionStats.confidenceLevel}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Confidence Level</div>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 text-center p-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">+{sessionStats.improvementTrend}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Improvement</div>
            </Card>
          </motion.div>

          {/* Session Setup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader>
                <CardTitle>Start New Interview Session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Interview Type
                    </label>
                    <select
                      value={sessionType}
                      onChange={(e) => setSessionType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="technical">Technical</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="system-design">System Design</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Company
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g., Google, Microsoft, Apple"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <Button variant="gradient" size="lg" onClick={startSession} className="w-full">
                  Start Interview Session
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Sessions */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { company: 'Google', type: 'Technical', score: 85, date: '2024-01-15' },
                    { company: 'Microsoft', type: 'Behavioral', score: 78, date: '2024-01-12' },
                    { company: 'Apple', type: 'System Design', score: 92, date: '2024-01-10' }
                  ].map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {session.company} - {session.type}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(session.date).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant={session.score >= 80 ? 'success' : session.score >= 60 ? 'warning' : 'destructive'}>
                        {session.score}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Active Session UI
  const currentQ = currentSession?.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Session Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentSession.company} Interview
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {currentSession.type} • Question {currentQuestion + 1} of {currentSession.questions.length}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-500">Time Remaining</div>
            </div>
          </div>

          <div className="mt-4">
            <AnimatedProgress
              value={((currentQuestion + 1) / currentSession.questions.length) * 100}
              className="h-2"
            />
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {currentQ?.type.replace('-', ' ')}
                  </Badge>
                  <Badge variant={currentQ?.difficulty === 'hard' ? 'destructive' : currentQ?.difficulty === 'medium' ? 'warning' : 'secondary'}>
                    {currentQ?.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {currentQ?.question}
                </h3>

                {currentQ?.type === 'multiple-choice' && (
                  <div className="space-y-3">
                    {currentQ.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg border transition-colors",
                          answers[currentQuestion] === index
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        )}
                      >
                        <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {(currentQ?.type === 'coding' || currentQ?.type === 'open-ended') && (
                  <div>
                    <textarea
                      value={answers[currentQuestion] || ''}
                      onChange={(e) => handleAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                    />
                    {currentQ?.hint && (
                      <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm">
                        <strong>Hint:</strong> {currentQ.hint}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={endSession}>
              End Session
            </Button>
            <Button
              variant="gradient"
              onClick={nextQuestion}
              disabled={!answers[currentQuestion]}
            >
              {currentQuestion === currentSession.questions.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPrep;
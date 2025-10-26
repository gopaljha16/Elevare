import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  Building2, Target, Code, TrendingUp, Award, Zap, Play, Clock, Lightbulb,
  ChevronRight, Trophy, Star, CheckCircle, XCircle, BarChart3, TrendingDown,
  ArrowRight, Home
} from 'lucide-react';

// Setup View Component
export const SetupView = ({ setActiveView, sessionConfig, setSessionConfig, userStats, startSession, loading }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 p-6">
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Button variant="ghost" onClick={() => setActiveView('home')} className="text-gray-400 hover:text-white mb-4">
          ← Back
        </Button>
        <h1 className="text-4xl font-bold text-white mb-2">Start Interview Session</h1>
        <p className="text-gray-400">Configure your practice session and let AI generate personalized questions</p>
      </motion.div>

      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
        <Card className="bg-gray-900/50 border-gray-800 text-center p-4">
          <div className="text-2xl font-bold text-blue-400">{userStats.totalSessions}</div>
          <div className="text-xs text-gray-400">Sessions</div>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800 text-center p-4">
          <div className="text-2xl font-bold text-green-400">{userStats.averageScore}%</div>
          <div className="text-xs text-gray-400">Avg Score</div>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800 text-center p-4">
          <div className="text-2xl font-bold text-purple-400">{userStats.confidenceLevel}%</div>
          <div className="text-xs text-gray-400">Confidence</div>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800 text-center p-4">
          <div className="text-2xl font-bold text-orange-400">+{userStats.improvementTrend}%</div>
          <div className="text-xs text-gray-400">Growth</div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Session Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Target Company *
                </label>
                <input
                  type="text"
                  value={sessionConfig.company}
                  onChange={(e) => setSessionConfig({ ...sessionConfig, company: e.target.value })}
                  placeholder="e.g., Google, Amazon, Microsoft"
                  className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800/50 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Target className="w-4 h-4 inline mr-2" />
                  Role *
                </label>
                <input
                  type="text"
                  value={sessionConfig.role}
                  onChange={(e) => setSessionConfig({ ...sessionConfig, role: e.target.value })}
                  placeholder="e.g., Software Engineer, Product Manager"
                  className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800/50 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Code className="w-4 h-4 inline mr-2" />
                  Interview Type
                </label>
                <select
                  value={sessionConfig.sessionType}
                  onChange={(e) => setSessionConfig({ ...sessionConfig, sessionType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800/50 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="system-design">System Design</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Difficulty Level
                </label>
                <select
                  value={sessionConfig.difficulty}
                  onChange={(e) => setSessionConfig({ ...sessionConfig, difficulty: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800/50 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Award className="w-4 h-4 inline mr-2" />
                  Number of Questions
                </label>
                <select
                  value={sessionConfig.questionCount}
                  onChange={(e) => setSessionConfig({ ...sessionConfig, questionCount: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800/50 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="3">3 Questions (~15 min)</option>
                  <option value="5">5 Questions (~25 min)</option>
                  <option value="8">8 Questions (~40 min)</option>
                  <option value="10">10 Questions (~50 min)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Zap className="w-4 h-4 inline mr-2" />
                  AI Enhancement
                </label>
                <div className="flex items-center space-x-3 mt-3">
                  <input
                    type="checkbox"
                    checked={sessionConfig.useAI}
                    onChange={(e) => setSessionConfig({ ...sessionConfig, useAI: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-700 bg-gray-800/50 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">Use AI for questions & feedback</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-800">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={startSession}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start Interview Session
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  </div>
);

// Session View Component
export const SessionView = ({ currentSession, currentQuestionIndex, timeElapsed, formatTime, currentAnswer, setCurrentAnswer, showHint, setShowHint, submitAnswer, loading, sessionConfig }) => {
  if (!currentSession) return null;
  const progress = ((currentQuestionIndex + 1) / currentSession.totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 p-6">
      <div className="max-w-5xl mx-auto">
        <motion.div className="mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{currentSession.company} - {currentSession.role}</h1>
              <p className="text-gray-400">{currentSession.sessionType} Interview • Question {currentQuestionIndex + 1} of {currentSession.totalQuestions}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-400">{formatTime(timeElapsed)}</div>
              <div className="text-sm text-gray-400">Time Elapsed</div>
            </div>
          </div>
          <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={currentQuestionIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm mb-6">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-300">
                    <Code className="w-4 h-4 mr-2" />
                    {currentSession.sessionType}
                  </Badge>
                  <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-300">
                    {currentSession.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-semibold text-white mb-6">
                  Question {currentQuestionIndex + 1}: How would you approach this problem?
                </h3>
                <div className="space-y-4">
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here... Be specific and provide examples."
                    className="w-full h-48 p-4 border border-gray-700 rounded-lg bg-gray-800/50 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                  {showHint && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-start">
                        <Lightbulb className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-300 mb-1">Hint</h4>
                          <p className="text-gray-300 text-sm">Consider breaking down the problem into smaller steps and explain your thought process.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div className="flex items-center justify-between pt-4">
                    <Button variant="ghost" onClick={() => setShowHint(!showHint)} className="text-yellow-400 hover:text-yellow-300">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      {showHint ? 'Hide Hint' : 'Show Hint'}
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setCurrentAnswer('')} className="border-gray-700 text-gray-300 hover:bg-gray-800/50">
                        Clear
                      </Button>
                      <Button
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        onClick={submitAnswer}
                        disabled={loading || !currentAnswer.trim()}
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Evaluating...
                          </>
                        ) : (
                          <>
                            {currentQuestionIndex === currentSession.totalQuestions - 1 ? 'Finish' : 'Next Question'}
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gray-900/50 border-gray-800 text-center p-4">
            <Clock className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <div className="text-lg font-bold text-white">{formatTime(timeElapsed)}</div>
            <div className="text-xs text-gray-400">Current Question</div>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800 text-center p-4">
            <Target className="w-6 h-6 mx-auto mb-2 text-purple-400" />
            <div className="text-lg font-bold text-white">{currentQuestionIndex + 1}/{currentSession.totalQuestions}</div>
            <div className="text-xs text-gray-400">Progress</div>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800 text-center p-4">
            <Zap className="w-6 h-6 mx-auto mb-2 text-green-400" />
            <div className="text-lg font-bold text-white">{sessionConfig.useAI ? 'ON' : 'OFF'}</div>
            <div className="text-xs text-gray-400">AI Feedback</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Results View Component
export const ResultsView = ({ sessionResults, setActiveView, fetchUserStats }) => {
  if (!sessionResults) return null;
  const scoreColor = sessionResults.overallScore >= 80 ? 'green' : sessionResults.overallScore >= 60 ? 'blue' : 'orange';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center mb-12">
          <div className={`w-32 h-32 mx-auto mb-6 rounded-full bg-${scoreColor}-500/20 flex items-center justify-center`}>
            <Trophy className={`w-16 h-16 text-${scoreColor}-400`} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Session Complete!</h1>
          <p className="text-gray-400">Great job! Here's how you performed</p>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gray-900/50 border-gray-800 text-center p-6">
            <BarChart3 className="w-8 h-8 mx-auto mb-3 text-blue-400" />
            <div className="text-4xl font-bold text-white mb-2">{sessionResults.overallScore}%</div>
            <div className="text-sm text-gray-400">Overall Score</div>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800 text-center p-6">
            <CheckCircle className="w-8 h-8 mx-auto mb-3 text-green-400" />
            <div className="text-4xl font-bold text-white mb-2">{sessionResults.correctAnswers}/{sessionResults.totalQuestions}</div>
            <div className="text-sm text-gray-400">Correct Answers</div>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800 text-center p-6">
            <Clock className="w-8 h-8 mx-auto mb-3 text-purple-400" />
            <div className="text-4xl font-bold text-white mb-2">{Math.floor(sessionResults.totalTimeSpent / 60)}m</div>
            <div className="text-sm text-gray-400">Total Time</div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gray-900/50 border-gray-800 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Accuracy</span>
                    <span className="text-white font-semibold">{sessionResults.overallScore}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full bg-${scoreColor}-500`} style={{ width: `${sessionResults.overallScore}%` }} />
                  </div>
                </div>
                {sessionResults.aiEnhanced && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Confidence Score</span>
                      <span className="text-white font-semibold">{sessionResults.confidenceScore}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${sessionResults.confidenceScore}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="flex gap-4 justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Button size="lg" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800/50" onClick={() => setActiveView('home')}>
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={() => { setActiveView('setup'); fetchUserStats(); }}>
            <Play className="w-5 h-5 mr-2" />
            Start New Session
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

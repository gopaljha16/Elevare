import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProgress } from '../../store/slices/learningPathSlice';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Award, BookOpen, Target } from 'lucide-react';
import CircularProgress from '../ui/CircularProgress';

const ProgressTracker = ({ userId }) => {
  const dispatch = useDispatch();
  const { userProgress } = useSelector((state) => state.learningPath);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserProgress(userId));
    }
  }, [dispatch, userId]);

  const stats = {
    totalPaths: userProgress.length,
    inProgress: userProgress.filter(p => p.status === 'In Progress').length,
    completed: userProgress.filter(p => p.status === 'Completed').length,
    totalTimeSpent: userProgress.reduce((sum, p) => sum + (p.totalTimeSpent || 0), 0),
    totalNodes: userProgress.reduce((sum, p) => sum + (p.completedNodes?.length || 0), 0),
    avgProgress: userProgress.length > 0
      ? Math.round(userProgress.reduce((sum, p) => sum + p.progress, 0) / userProgress.length)
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{stats.totalPaths}</span>
          </div>
          <p className="text-blue-100">Total Paths</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{stats.completed}</span>
          </div>
          <p className="text-green-100">Completed</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{Math.round(stats.totalTimeSpent / 60)}</span>
          </div>
          <p className="text-purple-100">Hours Learned</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{stats.totalNodes}</span>
          </div>
          <p className="text-orange-100">Nodes Completed</p>
        </motion.div>
      </div>

      {/* Active Paths */}
      <div className="bg-[#121625]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Your Learning Paths
        </h3>

        {userProgress.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/70">No learning paths yet</p>
            <p className="text-sm text-white/50">Start your learning journey today!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userProgress.map((progress, index) => (
              <motion.div
                key={progress.pathId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                {/* Progress Circle */}
                <div className="flex-shrink-0">
                  <CircularProgress
                    value={progress.progress}
                    size={60}
                    strokeWidth={6}
                  />
                </div>

                {/* Path Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white truncate">
                    {progress.pathDetails?.pathName || progress.pathId}
                  </h4>
                  <p className="text-sm text-white/60">
                    {progress.completedNodes?.length || 0} nodes completed
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      progress.status === 'Completed' ? 'bg-green-500/20 text-green-300' :
                      progress.status === 'In Progress' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-white/10 text-white/70'
                    }`}>
                      {progress.status}
                    </span>
                    {progress.totalTimeSpent > 0 && (
                      <span className="text-xs text-white/50">
                        {Math.round(progress.totalTimeSpent / 60)}h spent
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => window.location.href = `/learning-paths/${progress.pathId}`}
                  className="px-4 py-2 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] text-white rounded-lg hover:from-[#F97316] hover:to-[#A855F7] transition-colors text-sm font-medium border-0"
                >
                  Continue
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Overall Progress */}
      <div className="bg-[#121625]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Overall Progress</h3>
        <div className="flex items-center justify-center">
          <CircularProgress
            value={stats.avgProgress}
            size={150}
            strokeWidth={10}
            showLabel={true}
          />
        </div>
        <p className="text-center text-white/60 mt-4">
          Average completion across all paths
        </p>
      </div>
    </div>
  );
};

export default ProgressTracker;

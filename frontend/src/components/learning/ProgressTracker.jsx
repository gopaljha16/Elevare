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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Your Learning Paths
        </h3>

        {userProgress.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No learning paths yet</p>
            <p className="text-sm text-gray-400">Start your learning journey today!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userProgress.map((progress, index) => (
              <motion.div
                key={progress.pathId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
                  <h4 className="font-semibold text-gray-900 truncate">
                    {progress.pathDetails?.pathName || progress.pathId}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {progress.completedNodes?.length || 0} nodes completed
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      progress.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      progress.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {progress.status}
                    </span>
                    {progress.totalTimeSpent > 0 && (
                      <span className="text-xs text-gray-500">
                        {Math.round(progress.totalTimeSpent / 60)}h spent
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => window.location.href = `/learning-paths/${progress.pathId}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Continue
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Overall Progress</h3>
        <div className="flex items-center justify-center">
          <CircularProgress
            value={stats.avgProgress}
            size={150}
            strokeWidth={10}
            showLabel={true}
          />
        </div>
        <p className="text-center text-gray-600 mt-4">
          Average completion across all paths
        </p>
      </div>
    </div>
  );
};

export default ProgressTracker;

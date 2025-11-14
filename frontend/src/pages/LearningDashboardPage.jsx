import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProgress, fetchRecommendations } from '../store/slices/learningPathSlice';
import ProgressTracker from '../components/learning/ProgressTracker';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Clock, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';

const LearningDashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { recommendations } = useSelector((state) => state.learningPath);
  
  const userId = localStorage.getItem('userId'); // Adjust based on your auth

  useEffect(() => {
    if (userId) {
      dispatch(fetchRecommendations(userId));
    }
  }, [dispatch, userId]);

  return (
    <div className="min-h-screen bg-[#0E101A] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full bg-[#7C3AED]/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-[420px] w-[420px] rounded-full bg-[#EC4899]/20 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Learning Dashboard</h1>
          <p className="text-white/60">Track your progress and continue learning</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Progress Tracker */}
          <div className="lg:col-span-2">
            <ProgressTracker userId={userId} />
          </div>

          {/* Sidebar - Recommendations */}
          <div className="space-y-6">
            <div className="bg-[#121625]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Recommended for You
              </h3>

              {recommendations.length === 0 ? (
                <div className="text-center py-6">
                  <BookOpen className="w-12 h-12 text-white/30 mx-auto mb-3" />
                  <p className="text-white/60 text-sm">No recommendations yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.slice(0, 5).map((path, index) => (
                    <motion.div
                      key={path.pathId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer border border-white/5"
                      onClick={() => navigate(`/learning-paths/${path.pathId}`)}
                    >
                      <h4 className="font-medium text-gray-900 text-sm mb-1">{path.pathName}</h4>
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <span>{path.category}</span>
                        <span>•</span>
                        <span>{path.estimatedHours}h</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <Button
                onClick={() => navigate('/learning-paths')}
                variant="outline"
                className="w-full mt-4 border-white/20 text-white hover:bg-white/10"
              >
                Explore All Paths
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-[#4C1D95] via-[#7C3AED] to-[#EC4899] rounded-2xl p-6 text-white border border-white/10">
              <h3 className="text-lg font-bold mb-4">Keep Learning!</h3>
              <p className="text-sm text-purple-100 mb-4">
                Consistency is key to mastering new skills. Try to learn something new every day.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>You're doing great!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningDashboardPage;

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPathById, fetchPathProgress, enrollInPath } from '../store/slices/learningPathSlice';
import RoadmapViewer from '../components/learning/RoadmapViewer';
import { ArrowLeft, Clock, BookOpen, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/Button';

const LearningPathDetailPage = () => {
  const { pathId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentPath, currentProgress, loading } = useSelector((state) => state.learningPath);
  const [userId, setUserId] = useState(null);

  // Get or create userId
  useEffect(() => {
    let storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      // Create a demo user ID for testing
      storedUserId = `demo-user-${Date.now()}`;
      localStorage.setItem('userId', storedUserId);
      console.log('Created demo userId:', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  useEffect(() => {
    if (pathId && userId) {
      dispatch(fetchPathById(pathId));
      dispatch(fetchPathProgress({ userId, pathId })).then((result) => {
        // If no progress found, auto-enroll the user
        if (result.error || !result.payload) {
          console.log('No progress found, enrolling user...');
          dispatch(enrollInPath({ userId, pathId }));
        }
      });
    }
  }, [dispatch, pathId, userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E101A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC4899]"></div>
      </div>
    );
  }

  if (!currentPath) {
    return (
      <div className="min-h-screen bg-[#0E101A] flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Path not found</h2>
          <Button onClick={() => navigate('/learning-paths')} className="mt-2 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] border-0">
            Back to Learning Paths
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E101A] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full bg-[#7C3AED]/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-[420px] w-[420px] rounded-full bg-[#EC4899]/20 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/learning-paths')}
            className="flex items-center gap-2 text-white/60 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Learning Paths
          </button>

          <div className="bg-[#121625]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-200 text-xs font-medium rounded-full border border-purple-400/40">
                    {currentPath.category}
                  </span>
                  <span className="text-xs text-white/60">{currentPath.difficulty}</span>
                </div>
                <h1 className="text-3xl font-bold mb-2">{currentPath.pathName}</h1>
                <p className="text-white/70 mb-4">{currentPath.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-white/60">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{currentPath.estimatedHours} hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{currentPath.nodes?.length || 0} nodes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>{currentPath.enrollmentCount} enrolled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap */}
        <RoadmapViewer
          path={currentPath}
          progress={currentProgress}
          userId={userId}
        />
      </div>
    </div>
  );
};

export default LearningPathDetailPage;

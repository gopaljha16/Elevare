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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentPath) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Path not found</h2>
          <Button onClick={() => navigate('/learning-paths')}>
            Back to Learning Paths
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/learning-paths')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Learning Paths
          </button>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {currentPath.category}
                  </span>
                  <span className="text-sm text-gray-500">{currentPath.difficulty}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentPath.pathName}</h1>
                <p className="text-gray-600 mb-4">{currentPath.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-gray-500">
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

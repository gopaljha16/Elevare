import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAllPaths, enrollInPath } from '../../store/slices/learningPathSlice';
import { motion } from 'framer-motion';
import { Search, Filter, Clock, TrendingUp, BookOpen, Star } from 'lucide-react';
import { Button } from '../ui/Button';

const LearningPathExplorer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { paths, loading } = useSelector((state) => state.learningPath);
  
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: ''
  });

  useEffect(() => {
    dispatch(fetchAllPaths(filters));
  }, [dispatch, filters]);

  const handleEnroll = async (pathId) => {
    const userId = localStorage.getItem('userId'); // Adjust based on your auth
    await dispatch(enrollInPath({ userId, pathId }));
    navigate(`/learning-paths/${pathId}`);
  };

  const categories = ['Frontend', 'Backend', 'Full Stack', 'Data Science', 'DevOps', 'Mobile', 'AI/ML', 'Cybersecurity', 'Cloud'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Learning Paths</h1>
          <p className="text-gray-600">Choose your career roadmap and start learning</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search learning paths..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            {/* Category Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            >
              <option value="">All Levels</option>
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}

        {/* Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paths.map((path, index) => (
            <motion.div
              key={path.pathId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              {/* Card Header */}
              <div className={`h-2 ${
                path.difficulty === 'Beginner' ? 'bg-green-500' :
                path.difficulty === 'Intermediate' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />

              <div className="p-6">
                {/* Category Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {path.category}
                  </span>
                  <span className="text-sm text-gray-500">{path.difficulty}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{path.pathName}</h3>
                
                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{path.description}</p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{path.estimatedHours}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{path.enrollmentCount} enrolled</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{path.rating || 'N/A'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/learning-paths/${path.pathId}`)}
                    variant="outline"
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  <Button
                    onClick={() => handleEnroll(path.pathId)}
                    className="flex-1"
                  >
                    Start Learning
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && paths.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No learning paths found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPathExplorer;

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
    <div className="min-h-screen bg-[#0E101A] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full bg-[#7C3AED]/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-[420px] w-[420px] rounded-full bg-[#EC4899]/20 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Learning Paths</h1>
          <p className="text-white/60">Choose your career roadmap and start learning</p>
        </div>

        {/* Filters */}
        <div className="bg-[#121625]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Search learning paths..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent outline-none"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            {/* Category Filter */}
            <select
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent outline-none"
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
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent outline-none"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC4899] mx-auto"></div>
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
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-purple-500/40 hover:bg-white/10 transition-all duration-300 overflow-hidden"
            >
              {/* Card Header */}
              <div className={`h-1.5 ${
                path.difficulty === 'Beginner' ? 'bg-green-500/70' :
                path.difficulty === 'Intermediate' ? 'bg-yellow-500/70' :
                'bg-red-500/70'
              }`} />

              <div className="p-6">
                {/* Category Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-200 text-xs font-medium rounded-full border border-purple-400/40">
                    {path.category}
                  </span>
                  <span className="text-xs text-white/60">{path.difficulty}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-2">{path.pathName}</h3>
                
                {/* Description */}
                <p className="text-white/60 text-sm mb-4 line-clamp-3">{path.description}</p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-xs text-white/50">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{path.estimatedHours}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{path.enrollmentCount} enrolled</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-300" />
                    <span>{path.rating || 'N/A'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/learning-paths/${path.pathId}`)}
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    View Details
                  </Button>
                  <Button
                    onClick={() => handleEnroll(path.pathId)}
                    className="flex-1 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] hover:from-[#F97316] hover:to-[#A855F7] border-0"
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
            <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No learning paths found</h3>
            <p className="text-white/60">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPathExplorer;

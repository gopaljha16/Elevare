import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import {
  Plus,
  Eye,
  Edit3,
  Share2,
  Download,
  Trash2,
  Copy,
  Globe,
  Calendar,
  BarChart3,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  Settings
} from 'lucide-react';
import axios from 'axios';

const PortfolioDashboard = () => {
  const { user } = useAuthContext();
  const [portfolios, setPortfolios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const response = await axios.get('/api/portfolio/my-portfolios', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPortfolios(response.data.portfolios);
    } catch (error) {
      console.error('Failed to fetch portfolios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const duplicatePortfolio = async (portfolioId) => {
    try {
      const response = await axios.post(`/api/portfolio/${portfolioId}/duplicate`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setPortfolios(prev => [response.data.portfolio, ...prev]);
    } catch (error) {
      console.error('Failed to duplicate portfolio:', error);
    }
  };

  const deletePortfolio = async (portfolioId) => {
    try {
      await axios.delete(`/api/portfolio/${portfolioId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setPortfolios(prev => prev.filter(p => p.id !== portfolioId));
      setShowDeleteModal(false);
      setSelectedPortfolio(null);
    } catch (error) {
      console.error('Failed to delete portfolio:', error);
    }
  };

  const filteredPortfolios = portfolios.filter(portfolio => {
    const matchesSearch = portfolio.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' || 
      (filterBy === 'published' && portfolio.isPublished) ||
      (filterBy === 'draft' && !portfolio.isPublished);
    
    return matchesSearch && matchesFilter;
  });

  const getTemplateColor = (template) => {
    const colors = {
      modern: 'from-purple-500 to-pink-500',
      minimal: 'from-blue-500 to-cyan-500',
      dark: 'from-green-500 to-emerald-500',
      creative: 'from-orange-500 to-red-500'
    };
    return colors[template] || colors.modern;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0E101A] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC4899] mx-auto mb-4"></div>
          <p className="text-white/60">Loading your portfolios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E101A] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-44 -left-40 h-[520px] w-[520px] rounded-full bg-[#7C3AED]/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-[420px] w-[420px] rounded-full bg-[#EC4899]/20 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Portfolios</h1>
            <p className="text-white/60">Manage and showcase your professional portfolios</p>
          </div>
          
          <Link
            to="/portfolio-builder"
            className="px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] rounded-full font-semibold hover:scale-105 transition-transform flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create Portfolio
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#121625] rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{portfolios.length}</p>
                <p className="text-sm text-white/60">Total Portfolios</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#121625] rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <ExternalLink className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{portfolios.filter(p => p.isPublished).length}</p>
                <p className="text-sm text-white/60">Published</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#121625] rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Edit3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{portfolios.filter(p => !p.isPublished).length}</p>
                <p className="text-sm text-white/60">Drafts</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#121625] rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">2.4k</p>
                <p className="text-sm text-white/60">Total Views</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              type="text"
              placeholder="Search portfolios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#121625] border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#EC4899] focus:outline-none"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="pl-10 pr-8 py-3 bg-[#121625] border border-white/10 rounded-xl text-white focus:border-[#EC4899] focus:outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Portfolios</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
        </div>

        {/* Portfolio Grid */}
        {filteredPortfolios.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Globe className="h-16 w-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No portfolios found</h3>
            <p className="text-white/60 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first portfolio to get started'}
            </p>
            <Link
              to="/portfolio-builder"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] rounded-full font-semibold hover:scale-105 transition-transform"
            >
              <Plus className="h-5 w-5" />
              Create Portfolio
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPortfolios.map((portfolio, index) => (
              <motion.div
                key={portfolio.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#121625] rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all group"
              >
                {/* Portfolio Preview */}
                <div className={`h-48 bg-gradient-to-br ${getTemplateColor(portfolio.template)} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute top-4 right-4">
                    <div className="relative">
                      <button
                        onClick={() => setSelectedPortfolio(selectedPortfolio === portfolio.id ? null : portfolio.id)}
                        className="p-2 bg-black/20 backdrop-blur rounded-lg hover:bg-black/40 transition-colors"
                      >
                        <MoreVertical className="h-4 w-4 text-white" />
                      </button>
                      
                      {selectedPortfolio === portfolio.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute top-full right-0 mt-2 w-48 bg-[#1a1f2e] border border-white/10 rounded-xl shadow-xl z-10"
                        >
                          <div className="p-2 space-y-1">
                            <Link
                              to={`/portfolio/edit/${portfolio.id}`}
                              className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Edit3 className="h-4 w-4" />
                              Edit Portfolio
                            </Link>
                            <button
                              onClick={() => duplicatePortfolio(portfolio.id)}
                              className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/10 rounded-lg transition-colors w-full text-left"
                            >
                              <Copy className="h-4 w-4" />
                              Duplicate
                            </button>
                            <button className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/10 rounded-lg transition-colors w-full text-left">
                              <Share2 className="h-4 w-4" />
                              Share
                            </button>
                            <button className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/10 rounded-lg transition-colors w-full text-left">
                              <Download className="h-4 w-4" />
                              Export
                            </button>
                            <div className="border-t border-white/10 my-1" />
                            <button
                              onClick={() => {
                                setSelectedPortfolio(portfolio.id);
                                setShowDeleteModal(true);
                              }}
                              className="flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors w-full text-left"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 left-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      portfolio.isPublished 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    }`}>
                      {portfolio.isPublished ? 'Published' : 'Draft'}
                    </div>
                  </div>
                </div>

                {/* Portfolio Info */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-[#EC4899] transition-colors">
                    {portfolio.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(portfolio.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 capitalize">
                      <Settings className="h-4 w-4" />
                      {portfolio.template}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {portfolio.isPublished ? (
                      <a
                        href={portfolio.deploymentUrl || `/portfolio/preview/${portfolio.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] rounded-lg font-medium text-center hover:scale-105 transition-transform flex items-center justify-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Live
                      </a>
                    ) : (
                      <Link
                        to={`/portfolio/edit/${portfolio.id}`}
                        className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg font-medium text-center hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit3 className="h-4 w-4" />
                        Continue Editing
                      </Link>
                    )}
                    
                    <Link
                      to={`/portfolio/preview/${portfolio.id}`}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#121625] rounded-2xl p-6 border border-white/10 max-w-md w-full"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="h-8 w-8 text-red-400" />
                </div>
                
                <h3 className="text-xl font-semibold mb-2">Delete Portfolio</h3>
                <p className="text-white/60 mb-6">
                  Are you sure you want to delete this portfolio? This action cannot be undone.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deletePortfolio(selectedPortfolio)}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortfolioDashboard;

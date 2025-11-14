import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import {
    Plus,
    Eye,
    Edit3,
    Trash2,
    Globe,
    Copy,
    Calendar,
    ExternalLink
} from 'lucide-react';

const PortfolioDashboard = () => {
    const { } = useAuthContext();
    const navigate = useNavigate();
    const [portfolios, setPortfolios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPortfolio, setSelectedPortfolio] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchPortfolios();
    }, []);

    const fetchPortfolios = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/portfolio/my-portfolios', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch portfolios');
            }

            const data = await response.json();
            setPortfolios(data.portfolios || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePortfolio = () => {
        navigate('/resume-dashboard?action=create-portfolio');
    };

    const handleEditPortfolio = (portfolioId) => {
        navigate(`/portfolio/edit/${portfolioId}`);
    };

    const handleViewPortfolio = (portfolioId) => {
        window.open(`/portfolio/preview/${portfolioId}`, '_blank');
    };

    const handleDuplicatePortfolio = async (portfolioId) => {
        try {
            const response = await fetch(`/api/portfolio/${portfolioId}/duplicate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to duplicate portfolio');
            }

            await fetchPortfolios();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeletePortfolio = async () => {
        if (!selectedPortfolio) return;

        try {
            const response = await fetch(`/api/portfolio/${selectedPortfolio.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete portfolio');
            }

            setPortfolios(portfolios.filter(p => p.id !== selectedPortfolio.id));
            setShowDeleteModal(false);
            setSelectedPortfolio(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handlePublishToggle = async (portfolio) => {
        try {
            const endpoint = portfolio.isPublished ? 'unpublish' : 'publish';
            const response = await fetch(`/api/portfolio/${portfolio.id}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to ${endpoint} portfolio`);
            }

            await fetchPortfolios();
        } catch (err) {
            setError(err.message);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your portfolios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Portfolios</h1>
                            <p className="text-gray-600 mt-2">
                                Create and manage your professional portfolios
                            </p>
                        </div>
                        <motion.button
                            onClick={handleCreatePortfolio}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Plus size={20} />
                            Create Portfolio
                        </motion.button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Portfolios Grid */}
                {portfolios.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="bg-white rounded-xl shadow-sm p-12">
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Globe size={32} className="text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No portfolios yet
                            </h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                Create your first portfolio to showcase your skills and projects to potential employers.
                            </p>
                            <motion.button
                                onClick={handleCreatePortfolio}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 hover:bg-blue-700 transition-colors"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Plus size={20} />
                                Create Your First Portfolio
                            </motion.button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {portfolios.map((portfolio, index) => (
                                <motion.div
                                    key={portfolio.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    {/* Portfolio Preview */}
                                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                                            <div className="text-white text-center">
                                                <h3 className="text-xl font-bold mb-2">{portfolio.title}</h3>
                                                <p className="text-sm opacity-90 capitalize">{portfolio.template} Template</p>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="absolute top-4 right-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${portfolio.isPublished
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {portfolio.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Portfolio Info */}
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 truncate">
                                                    {portfolio.title}
                                                </h4>
                                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                                    <Calendar size={14} className="mr-1" />
                                                    Updated {formatDate(portfolio.updatedAt)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2">
                                            <motion.button
                                                onClick={() => handleViewPortfolio(portfolio.id)}
                                                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <Eye size={16} />
                                                Preview
                                            </motion.button>

                                            <motion.button
                                                onClick={() => handleEditPortfolio(portfolio.id)}
                                                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <Edit3 size={16} />
                                                Edit
                                            </motion.button>
                                        </div>

                                        {/* Secondary Actions */}
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <motion.button
                                                    onClick={() => handleDuplicatePortfolio(portfolio.id)}
                                                    className="text-gray-500 hover:text-gray-700 p-1"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    title="Duplicate"
                                                >
                                                    <Copy size={16} />
                                                </motion.button>

                                                <motion.button
                                                    onClick={() => handlePublishToggle(portfolio)}
                                                    className={`p-1 ${portfolio.isPublished
                                                        ? 'text-green-600 hover:text-green-700'
                                                        : 'text-gray-500 hover:text-gray-700'
                                                        }`}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    title={portfolio.isPublished ? 'Unpublish' : 'Publish'}
                                                >
                                                    <Globe size={16} />
                                                </motion.button>

                                                {portfolio.isPublished && (
                                                    <motion.a
                                                        href={portfolio.previewUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-700 p-1"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        title="View Live"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </motion.a>
                                                )}
                                            </div>

                                            <motion.button
                                                onClick={() => {
                                                    setSelectedPortfolio(portfolio);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    {showDeleteModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white rounded-xl p-6 max-w-md w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Delete Portfolio
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Are you sure you want to delete "{selectedPortfolio?.title}"? This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeletePortfolio}
                                        className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PortfolioDashboard;
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, Lock, Clock, BookOpen, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import NodeDetailModal from './NodeDetailModal';
import { completeNode } from '../../store/slices/learningPathSlice';

const RoadmapViewer = ({ path, progress, userId }) => {
  const dispatch = useDispatch();
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  const getNodeStatus = (nodeId) => {
    if (!progress) return 'not-started';
    
    const isCompleted = progress.completedNodes?.some(n => n.nodeId === nodeId);
    if (isCompleted) return 'completed';
    
    if (progress.currentNode === nodeId) return 'current';
    
    // Check if prerequisites are met
    const node = path.nodes.find(n => n.nodeId === nodeId);
    if (node?.prerequisites?.length > 0) {
      const allPrereqsMet = node.prerequisites.every(prereqId =>
        progress.completedNodes?.some(n => n.nodeId === prereqId)
      );
      return allPrereqsMet ? 'available' : 'locked';
    }
    
    return 'available';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-600';
      case 'current':
        return 'bg-blue-500 border-blue-600';
      case 'available':
        return 'bg-gray-100 border-gray-300';
      case 'locked':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-white" />;
      case 'current':
        return <Circle className="w-5 h-5 text-white fill-white" />;
      case 'locked':
        return <Lock className="w-5 h-5 text-gray-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleNodeClick = (node) => {
    const status = getNodeStatus(node.nodeId);
    if (status !== 'locked') {
      setSelectedNode(node);
    }
  };

  const handleCompleteNode = async (nodeId) => {
    await dispatch(completeNode({
      userId,
      pathId: path.pathId,
      nodeId,
      timeSpent: 0
    }));
    setSelectedNode(null);
  };

  // Organize nodes by sequential order
  const sortedNodes = [...path.nodes].sort((a, b) => a.sequentialOrder - b.sequentialOrder);

  // Group nodes into rows (3 nodes per row for better visualization)
  const rows = [];
  for (let i = 0; i < sortedNodes.length; i += 3) {
    rows.push(sortedNodes.slice(i, i + 3));
  }

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
          <span className="text-2xl font-bold text-blue-600">{progress?.progress || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress?.progress || 0}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Completed</p>
            <p className="font-semibold">{progress?.completedNodes?.length || 0} nodes</p>
          </div>
          <div>
            <p className="text-gray-500">Time Spent</p>
            <p className="font-semibold">{Math.round((progress?.totalTimeSpent || 0) / 60)}h</p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <p className="font-semibold">{progress?.status || 'Not Started'}</p>
          </div>
        </div>
      </div>

      {/* Roadmap */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Roadmap</h2>
        
        <div className="space-y-12">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="relative">
              {/* Nodes Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {row.map((node, nodeIndex) => {
                  const status = getNodeStatus(node.nodeId);
                  const isHovered = hoveredNode === node.nodeId;

                  return (
                    <motion.div
                      key={node.nodeId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: rowIndex * 0.1 + nodeIndex * 0.05 }}
                      className="relative"
                    >
                      {/* Connection Line to Next Node */}
                      {nodeIndex < row.length - 1 && (
                        <div className="hidden md:block absolute top-1/2 left-full w-6 h-0.5 bg-gray-300 transform -translate-y-1/2" />
                      )}

                      {/* Node Card */}
                      <motion.div
                        className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${getStatusColor(status)} ${
                          isHovered ? 'shadow-lg scale-105' : 'shadow-md'
                        } ${status === 'locked' ? 'opacity-60 cursor-not-allowed' : ''}`}
                        onMouseEnter={() => setHoveredNode(node.nodeId)}
                        onMouseLeave={() => setHoveredNode(null)}
                        onClick={() => handleNodeClick(node)}
                        whileHover={status !== 'locked' ? { scale: 1.05 } : {}}
                      >
                        {/* Status Icon */}
                        <div className="absolute -top-3 -right-3">
                          <div className={`rounded-full p-1 ${
                            status === 'completed' ? 'bg-green-500' :
                            status === 'current' ? 'bg-blue-500' :
                            'bg-gray-300'
                          }`}>
                            {getStatusIcon(status)}
                          </div>
                        </div>

                        {/* Node Content */}
                        <div className={status === 'completed' || status === 'current' ? 'text-white' : 'text-gray-900'}>
                          <h4 className="font-semibold mb-2">{node.title}</h4>
                          <p className={`text-sm mb-3 line-clamp-2 ${
                            status === 'completed' || status === 'current' ? 'text-white/90' : 'text-gray-600'
                          }`}>
                            {node.description}
                          </p>
                          
                          <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{node.estimatedHours}h</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              <span>{node.resources?.length || 0} resources</span>
                            </div>
                          </div>

                          {/* Difficulty Badge */}
                          <div className="mt-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              node.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                              node.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {node.difficulty}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Vertical Connection to Next Row */}
              {rowIndex < rows.length - 1 && (
                <div className="flex justify-center mt-6">
                  <div className="w-0.5 h-6 bg-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Node Detail Modal */}
      <AnimatePresence>
        {selectedNode && (
          <NodeDetailModal
            node={selectedNode}
            status={getNodeStatus(selectedNode.nodeId)}
            onClose={() => setSelectedNode(null)}
            onComplete={() => handleCompleteNode(selectedNode.nodeId)}
            isCompleted={getNodeStatus(selectedNode.nodeId) === 'completed'}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoadmapViewer;

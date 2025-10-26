import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, Lock, Clock, BookOpen, Play, Award } from 'lucide-react';
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

  const handleNodeClick = (node) => {
    const status = getNodeStatus(node.nodeId);
    if (status !== 'locked') {
      setSelectedNode(node);
    }
  };

  const handleCompleteNode = async (nodeId) => {
    if (!userId) {
      alert('Please refresh the page to create a user session');
      return;
    }

    console.log('Completing node:', { userId, pathId: path.pathId, nodeId });
    
    try {
      const result = await dispatch(completeNode({
        userId,
        pathId: path.pathId,
        nodeId,
        timeSpent: 0
      }));

      if (result.error) {
        console.error('Error completing node:', result.error);
        alert('Error completing node. Please check console.');
      } else {
        console.log('Node completed successfully!', result.payload);
        setSelectedNode(null);
      }
    } catch (error) {
      console.error('Exception completing node:', error);
      alert('Error: ' + error.message);
    }
  };

  // Organize nodes by sequential order
  const sortedNodes = [...path.nodes].sort((a, b) => a.sequentialOrder - b.sequentialOrder);

  return (
    <div className="w-full">
      {/* Progress Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">Your Progress</h3>
              <p className="text-blue-100">Keep learning, you're doing great!</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{progress?.progress || 0}%</div>
            <div className="text-sm text-blue-100">Complete</div>
          </div>
        </div>
        
        <div className="w-full bg-white/20 rounded-full h-3 mb-4">
          <motion.div
            className="bg-white h-3 rounded-full shadow-sm"
            initial={{ width: 0 }}
            animate={{ width: `${progress?.progress || 0}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold">{progress?.completedNodes?.length || 0}</div>
            <div className="text-blue-100">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{Math.round((progress?.totalTimeSpent || 0) / 60)}</div>
            <div className="text-blue-100">Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{sortedNodes.length - (progress?.completedNodes?.length || 0)}</div>
            <div className="text-blue-100">Remaining</div>
          </div>
        </div>
      </div>

      {/* Roadmap.sh Style Roadmap */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Play className="w-6 h-6 text-blue-600" />
            {path.pathName} Roadmap
          </h2>
          <p className="text-gray-600 mt-1">Follow this step-by-step learning path</p>
        </div>

        <div className="p-8">
          {/* Roadmap Flow */}
          <div className="relative">
            {/* Main Flow Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-green-200"></div>

            {/* Nodes */}
            <div className="space-y-8">
              {sortedNodes.map((node, index) => {
                const status = getNodeStatus(node.nodeId);
                const isHovered = hoveredNode === node.nodeId;

                return (
                  <motion.div
                    key={node.nodeId}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex items-start gap-6"
                  >
                    {/* Node Indicator */}
                    <div className="relative z-10 flex-shrink-0">
                      <motion.div
                        className={`w-16 h-16 rounded-full border-4 flex items-center justify-center shadow-lg transition-all duration-300 ${
                          status === 'completed' 
                            ? 'bg-green-500 border-green-400 text-white' 
                            : status === 'current'
                            ? 'bg-blue-500 border-blue-400 text-white animate-pulse'
                            : status === 'available'
                            ? 'bg-white border-gray-300 text-gray-600 hover:border-blue-400'
                            : 'bg-gray-100 border-gray-200 text-gray-400'
                        } ${isHovered && status !== 'locked' ? 'scale-110 shadow-xl' : ''}`}
                        whileHover={status !== 'locked' ? { scale: 1.1 } : {}}
                        onMouseEnter={() => setHoveredNode(node.nodeId)}
                        onMouseLeave={() => setHoveredNode(null)}
                      >
                        {status === 'completed' ? (
                          <CheckCircle className="w-8 h-8" />
                        ) : status === 'current' ? (
                          <Play className="w-6 h-6" />
                        ) : status === 'locked' ? (
                          <Lock className="w-6 h-6" />
                        ) : (
                          <Circle className="w-6 h-6" />
                        )}
                      </motion.div>

                      {/* Step Number */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </div>

                    {/* Node Content */}
                    <motion.div
                      className={`flex-1 cursor-pointer transition-all duration-200 ${
                        status === 'locked' ? 'opacity-50 cursor-not-allowed' : 'hover:transform hover:scale-[1.02]'
                      }`}
                      onClick={() => handleNodeClick(node)}
                      whileHover={status !== 'locked' ? { y: -2 } : {}}
                    >
                      <div className={`bg-white rounded-xl border-2 p-6 shadow-md transition-all duration-200 ${
                        status === 'completed' 
                          ? 'border-green-200 bg-green-50' 
                          : status === 'current'
                          ? 'border-blue-200 bg-blue-50 shadow-lg'
                          : status === 'available'
                          ? 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
                          : 'border-gray-100 bg-gray-50'
                      }`}>
                        {/* Node Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className={`text-lg font-bold mb-1 ${
                              status === 'completed' ? 'text-green-800' :
                              status === 'current' ? 'text-blue-800' :
                              status === 'available' ? 'text-gray-900' :
                              'text-gray-500'
                            }`}>
                              {node.title}
                            </h3>
                            <p className={`text-sm ${
                              status === 'completed' ? 'text-green-600' :
                              status === 'current' ? 'text-blue-600' :
                              status === 'available' ? 'text-gray-600' :
                              'text-gray-400'
                            }`}>
                              {node.description}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            status === 'completed' ? 'bg-green-100 text-green-700' :
                            status === 'current' ? 'bg-blue-100 text-blue-700' :
                            status === 'available' ? 'bg-gray-100 text-gray-700' :
                            'bg-gray-50 text-gray-500'
                          }`}>
                            {status === 'completed' ? 'Completed' :
                             status === 'current' ? 'In Progress' :
                             status === 'available' ? 'Available' :
                             'Locked'}
                          </div>
                        </div>

                        {/* Node Meta */}
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{node.estimatedHours} hours</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{node.resources?.length || 0} resources</span>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            node.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                            node.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {node.difficulty}
                          </div>
                        </div>

                        {/* Skills Preview */}
                        {node.skills && node.skills.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {node.skills.slice(0, 3).map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-md"
                              >
                                {skill}
                              </span>
                            ))}
                            {node.skills.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                                +{node.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* Completion Celebration */}
            {progress?.progress === 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 text-center p-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl text-white"
              >
                <Award className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Congratulations! 🎉</h3>
                <p className="text-green-100">You've completed the entire {path.pathName} learning path!</p>
              </motion.div>
            )}
          </div>
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

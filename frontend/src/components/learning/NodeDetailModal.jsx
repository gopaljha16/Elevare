import { motion } from 'framer-motion';
import { X, CheckCircle, Clock, BookOpen, Code, ExternalLink, FileText } from 'lucide-react';
import { Button } from '../ui/Button';

const NodeDetailModal = ({ node, status, onClose, onComplete, isCompleted }) => {
  const getResourceIcon = (type) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'article':
        return '📄';
      case 'course':
        return '🎓';
      case 'documentation':
        return '📚';
      case 'book':
        return '📖';
      case 'project':
        return '💻';
      default:
        return '📌';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{node.title}</h2>
              {isCompleted && (
                <CheckCircle className="w-6 h-6 text-green-500" />
              )}
            </div>
            <p className="text-gray-600">{node.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-blue-900">{node.estimatedHours} hours</span>
            </div>
            <div className="px-3 py-2 bg-purple-50 rounded-lg">
              <span className={`font-medium ${
                node.difficulty === 'Beginner' ? 'text-green-700' :
                node.difficulty === 'Intermediate' ? 'text-yellow-700' :
                'text-red-700'
              }`}>
                {node.difficulty}
              </span>
            </div>
          </div>

          {/* Skills Covered */}
          {node.skills && node.skills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Code className="w-5 h-5" />
                Skills You'll Learn
              </h3>
              <div className="flex flex-wrap gap-2">
                {node.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Prerequisites */}
          {node.prerequisites && node.prerequisites.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Prerequisites</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Complete these nodes first: {node.prerequisites.join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Learning Resources */}
          {node.resources && node.resources.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Learning Resources
              </h3>
              <div className="space-y-3">
                {node.resources.map((resource, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-2xl">{getResourceIcon(resource.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{resource.title}</h4>
                          {resource.provider && (
                            <p className="text-sm text-gray-500">{resource.provider}</p>
                          )}
                        </div>
                        {resource.duration && (
                          <span className="text-sm text-gray-500">{resource.duration}</span>
                        )}
                      </div>
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
                        >
                          Open Resource
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {node.projects && node.projects.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Practice Projects
              </h3>
              <div className="space-y-3">
                {node.projects.map((project, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{project.title}</h4>
                      <span className="text-sm text-gray-500">{project.estimatedHours}h</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      project.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      project.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {project.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Close
          </Button>
          {!isCompleted && status !== 'locked' && (
            <Button
              onClick={onComplete}
              className="flex-1"
            >
              Mark as Complete
            </Button>
          )}
          {isCompleted && (
            <div className="flex-1 flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Completed</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NodeDetailModal;

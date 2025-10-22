import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, Eye } from 'lucide-react';
import { Button } from '../ui/Button';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminPathCreator = () => {
  const [path, setPath] = useState({
    pathName: '',
    description: '',
    category: 'Full Stack',
    difficulty: 'Beginner',
    estimatedHours: 0,
    tags: [],
    nodes: [],
    connections: [],
    isPublished: false
  });

  const [currentNode, setCurrentNode] = useState({
    title: '',
    description: '',
    skills: [],
    resources: [],
    projects: [],
    prerequisites: [],
    sequentialOrder: 1,
    difficulty: 'Beginner',
    estimatedHours: 0
  });

  const [showNodeForm, setShowNodeForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const categories = ['Frontend', 'Backend', 'Full Stack', 'Data Science', 'DevOps', 'Mobile', 'AI/ML', 'Cybersecurity', 'Cloud'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const handleAddNode = () => {
    const nodeId = `node-${Date.now()}`;
    const newNode = {
      ...currentNode,
      nodeId,
      sequentialOrder: path.nodes.length + 1
    };

    setPath({
      ...path,
      nodes: [...path.nodes, newNode]
    });

    setCurrentNode({
      title: '',
      description: '',
      skills: [],
      resources: [],
      projects: [],
      prerequisites: [],
      sequentialOrder: path.nodes.length + 2,
      difficulty: 'Beginner',
      estimatedHours: 0
    });

    setShowNodeForm(false);
  };

  const handleRemoveNode = (nodeId) => {
    setPath({
      ...path,
      nodes: path.nodes.filter(n => n.nodeId !== nodeId),
      connections: path.connections.filter(c => c.from !== nodeId && c.to !== nodeId)
    });
  };

  const handleAddConnection = (fromId, toId) => {
    const connection = {
      from: fromId,
      to: toId,
      type: 'prerequisite'
    };

    setPath({
      ...path,
      connections: [...path.connections, connection]
    });
  };

  const handleSavePath = async () => {
    try {
      setSaving(true);
      const response = await axios.post(`${API_URL}/learning-paths/paths`, path);
      
      if (response.data.success) {
        alert('Learning path created successfully!');
        // Reset form
        setPath({
          pathName: '',
          description: '',
          category: 'Full Stack',
          difficulty: 'Beginner',
          estimatedHours: 0,
          tags: [],
          nodes: [],
          connections: [],
          isPublished: false
        });
      }
    } catch (error) {
      alert('Error creating path: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (skill) => {
    if (skill && !currentNode.skills.includes(skill)) {
      setCurrentNode({
        ...currentNode,
        skills: [...currentNode.skills, skill]
      });
    }
  };

  const addResource = () => {
    setCurrentNode({
      ...currentNode,
      resources: [
        ...currentNode.resources,
        { type: 'video', title: '', url: '', duration: '', provider: '' }
      ]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Learning Path</h1>
          <p className="text-gray-600">Design a custom learning roadmap</p>
        </div>

        {/* Path Basic Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Path Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Path Name *
              </label>
              <input
                type="text"
                value={path.pathName}
                onChange={(e) => setPath({ ...path, pathName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Full Stack Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={path.category}
                onChange={(e) => setPath({ ...path, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty *
              </label>
              <select
                value={path.difficulty}
                onChange={(e) => setPath({ ...path, difficulty: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Hours *
              </label>
              <input
                type="number"
                value={path.estimatedHours}
                onChange={(e) => setPath({ ...path, estimatedHours: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 300"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={path.description}
              onChange={(e) => setPath({ ...path, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows="3"
              placeholder="Describe what learners will achieve..."
            />
          </div>

          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={path.isPublished}
                onChange={(e) => setPath({ ...path, isPublished: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Publish immediately</span>
            </label>
          </div>
        </div>

        {/* Nodes Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Learning Nodes</h2>
            <Button
              onClick={() => setShowNodeForm(!showNodeForm)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Node
            </Button>
          </div>

          {/* Node Form */}
          {showNodeForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-purple-50 rounded-lg"
            >
              <h3 className="font-semibold text-gray-900 mb-3">New Node</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  value={currentNode.title}
                  onChange={(e) => setCurrentNode({ ...currentNode, title: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Node Title"
                />
                
                <select
                  value={currentNode.difficulty}
                  onChange={(e) => setCurrentNode({ ...currentNode, difficulty: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {difficulties.map(diff => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>

              <textarea
                value={currentNode.description}
                onChange={(e) => setCurrentNode({ ...currentNode, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                rows="2"
                placeholder="Node Description"
              />

              <input
                type="number"
                value={currentNode.estimatedHours}
                onChange={(e) => setCurrentNode({ ...currentNode, estimatedHours: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                placeholder="Estimated Hours"
              />

              <div className="flex gap-2">
                <Button onClick={handleAddNode}>
                  Add Node
                </Button>
                <Button
                  onClick={() => setShowNodeForm(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {/* Nodes List */}
          <div className="space-y-3">
            {path.nodes.map((node, index) => (
              <motion.div
                key={node.nodeId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <h4 className="font-semibold text-gray-900">{node.title}</h4>
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      {node.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{node.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{node.estimatedHours}h</p>
                </div>
                <button
                  onClick={() => handleRemoveNode(node.nodeId)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}

            {path.nodes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No nodes added yet. Click "Add Node" to get started.
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={handleSavePath}
            disabled={saving || !path.pathName || path.nodes.length === 0}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Learning Path'}
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminPathCreator;

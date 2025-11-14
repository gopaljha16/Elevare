import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Loader, Brain, Target, Clock, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import axios from 'axios';
import config from '../../config/environment';

const API_URL = config.apiUrl;

const AIPathGenerator = ({ onPathGenerated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPath, setGeneratedPath] = useState(null);
  const [step, setStep] = useState(1); // 1: input, 2: generating, 3: result

  const samplePrompts = [
    "I want to become a full-stack developer with React and Node.js",
    "Help me learn data science with Python and machine learning",
    "I'm a beginner who wants to learn web development from scratch",
    "Create a path for mobile app development with React Native",
    "I want to learn DevOps and cloud technologies like AWS",
    "Help me become a UI/UX designer with modern tools"
  ];

  const handleGenerate = async () => {
    if (!userInput.trim()) return;

    setIsGenerating(true);
    setStep(2);

    try {
      const response = await axios.post(`${API_URL}/learning-paths/ai-generate`, {
        prompt: userInput,
        userLevel: 'beginner', // Can be made dynamic
        preferences: {
          duration: 'medium', // short, medium, long
          style: 'practical' // theoretical, practical, mixed
        }
      });

      if (response.data.success) {
        setGeneratedPath(response.data.data);
        setStep(3);
      } else {
        throw new Error(response.data.message || 'Failed to generate path');
      }
    } catch (error) {
      console.error('Error generating path:', error);
      alert('Error generating learning path. Please try again.');
      setStep(1);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreatePath = async () => {
    try {
      const response = await axios.post(`${API_URL}/learning-paths/paths`, generatedPath);
      
      if (response.data.success) {
        alert('Learning path created successfully!');
        onPathGenerated?.(response.data.data);
        setIsOpen(false);
        setStep(1);
        setUserInput('');
        setGeneratedPath(null);
      }
    } catch (error) {
      console.error('Error creating path:', error);
      alert('Error creating path. Please try again.');
    }
  };

  const reset = () => {
    setStep(1);
    setUserInput('');
    setGeneratedPath(null);
    setIsGenerating(false);
  };

  return (
    <>
      {/* AI Generator Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl z-50 group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Sparkles className="w-6 h-6 group-hover:animate-spin" />
        <div className="absolute -top-12 right-0 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Generate AI Learning Path
        </div>
      </motion.button>

      {/* AI Generator Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Brain className="w-8 h-8" />
                    <div>
                      <h2 className="text-2xl font-bold">AI Learning Path Generator</h2>
                      <p className="text-purple-100">Tell me what you want to learn, and I'll create a personalized roadmap!</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Step 1: Input */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-3">
                        What do you want to learn? 🎯
                      </label>
                      <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Describe your learning goals, current experience, and what you want to achieve..."
                        className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-none"
                      />
                    </div>

                    {/* Sample Prompts */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">💡 Try these examples:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {samplePrompts.map((prompt, index) => (
                          <button
                            key={index}
                            onClick={() => setUserInput(prompt)}
                            className="text-left p-3 bg-gray-50 hover:bg-purple-50 rounded-lg text-sm transition-colors border hover:border-purple-200"
                          >
                            "{prompt}"
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={handleGenerate}
                      disabled={!userInput.trim()}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-lg"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate My Learning Path
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Generating */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 mx-auto mb-6"
                    >
                      <Brain className="w-16 h-16 text-purple-600" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">AI is creating your path...</h3>
                    <p className="text-gray-600 mb-6">Analyzing your goals and crafting the perfect learning roadmap</p>
                    <div className="flex justify-center">
                      <Loader className="w-6 h-6 animate-spin text-purple-600" />
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Result */}
                {step === 3 && generatedPath && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Path Overview */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                      <div className="flex items-start gap-4">
                        <Target className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{generatedPath.pathName}</h3>
                          <p className="text-gray-700 mb-4">{generatedPath.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span>{generatedPath.estimatedHours} hours</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-600" />
                              <span>{generatedPath.difficulty}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-purple-600" />
                              <span>{generatedPath.nodes?.length || 0} learning steps</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Learning Steps Preview */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Learning Journey:</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {generatedPath.nodes?.map((node, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{node.title}</h5>
                              <p className="text-sm text-gray-600">{node.description}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{node.estimatedHours}h</span>
                                <span>•</span>
                                <span>{node.difficulty}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        onClick={reset}
                        variant="outline"
                        className="flex-1"
                      >
                        Generate Another
                      </Button>
                      <Button
                        onClick={handleCreatePath}
                        className="flex-1 bg-gradient-to-r from-green-600 to-blue-600"
                      >
                        Create This Path
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIPathGenerator;
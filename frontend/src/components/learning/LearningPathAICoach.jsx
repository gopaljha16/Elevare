import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Bot, User, Sparkles, Lightbulb } from 'lucide-react';
import { Button } from '../ui/Button';
import config from '../../config/environment';

const API_URL = config.apiUrl;

const initialBotMessage = {
  id: 'welcome',
  type: 'bot',
  content:
    "I'm your AI learning coach for this path. Ask me to explain topics, suggest a study plan, or recommend what to do next.",
  suggestions: [
    'Explain this learning path step-by-step',
    'What should I focus on next?',
    'Create a weekly study plan for me',
    "Summarize today's topics in simple words",
  ],
};

const LearningPathAICoach = ({ path, progress, userId }) => {
  const [messages, setMessages] = useState([initialBotMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const buildHistory = () => {
    return messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));
  };

  const generateLocalResponse = (message) => {
    const text = message.toLowerCase();
    const nodes = Array.isArray(path?.nodes) ? path.nodes : [];
    const completedNodes = Array.isArray(progress?.completedNodes)
      ? progress.completedNodes
      : [];

    const remainingNodes = nodes.filter((n) =>
      !completedNodes.some((c) => c.nodeId === n.nodeId)
    );

    const totalNodes = nodes.length;
    const completedCount = completedNodes.length;
    const remainingCount = remainingNodes.length;
    const progressPercent = progress?.progress ?? Math.round(
      totalNodes > 0 ? (completedCount / totalNodes) * 100 : 0
    );

    // Helper for next node
    const getNextNode = () => {
      if (!nodes.length) return null;
      if (progress?.currentNode) {
        const currentIndex = nodes.findIndex((n) => n.nodeId === progress.currentNode);
        if (currentIndex >= 0 && currentIndex < nodes.length - 1) {
          return nodes[currentIndex + 1];
        }
      }
      return remainingNodes[0] || nodes[0];
    };

    // Explain path
    if (
      text.includes('explain') ||
      text.includes('overview') ||
      text.includes('step-by-step')
    ) {
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      const content = [
        `This learning path "${path?.pathName || 'your path'}" is a ${
          path?.difficulty || 'mixed'
        } level roadmap in the ${path?.category || 'General'} category.`,
        totalNodes
          ? `It has ${totalNodes} main steps. You'll start with "${
              firstNode?.title || 'fundamentals'
            }" and finish at "${lastNode?.title || 'capstone'}".`
          : 'It does not have any nodes yet. Once nodes are added, I can walk you through them.',
        `Right now you are about ${progressPercent}% done (${completedCount} of ${
          totalNodes || 0
        } steps completed).`,
      ].join('\n\n');

      const suggestions = [
        'What should I focus on next?',
        'Create a 7-day study plan based on my remaining steps.',
        'Summarize the next topic in simple words.',
      ];

      return { content, suggestions };
    }

    // Next step / focus
    if (
      text.includes('next') ||
      text.includes('focus') ||
      text.includes('what now')
    ) {
      const next = getNextNode();
      if (!next) {
        const content =
          'You have already completed all the steps in this path. Consider revising the hardest topics or starting a more advanced path.';
        const suggestions = [
          'Recommend an advanced path for me.',
          'Help me revise the most important topics.',
        ];
        return { content, suggestions };
      }

      const content = [
        `Your next recommended step is "${next.title}" (${next.difficulty || 'Mixed'}).`,
        next.description
          ? `Description: ${next.description}`
          : 'This step will help you build on what you have already learned.',
        typeof next.estimatedHours === 'number'
          ? `Estimated time: ${next.estimatedHours} hour(s).`
          : null,
        next.skills && next.skills.length
          ? `Key skills: ${next.skills.slice(0, 5).join(', ')}.`
          : null,
      ]
        .filter(Boolean)
        .join('\n\n');

      const suggestions = [
        'Explain this next step in simple words.',
        'Give me a mini checklist for this step.',
      ];

      return { content, suggestions };
    }

    // Study plan / schedule
    if (
      text.includes('plan') ||
      text.includes('schedule') ||
      text.includes('7-day') ||
      text.includes('week')
    ) {
      const remainingHours = remainingNodes.reduce((sum, node) => {
        return sum + (typeof node.estimatedHours === 'number' ? node.estimatedHours : 0);
      }, 0);

      const perDay = remainingHours > 0 ? Math.ceil(remainingHours / 7) : 1;

      const days = Array.from({ length: 7 }).map((_, i) => {
        return `Day ${i + 1}: ${remainingNodes[i]
          ? `Work on "${remainingNodes[i].title}" (${remainingNodes[i].estimatedHours ||
              '?'}h)`
          : 'Use this day for revision or practice questions.'}`;
      });

      const content = [
        `Here's a simple 7-day study plan for the remaining part of "${
          path?.pathName || 'this path'
        }".`,
        remainingHours
          ? `You have about ${remainingHours} hour(s) left. Aim for ~${perDay} hour(s) per day.`
          : 'I could not estimate total hours, but you can still follow this sequence of steps.',
        days.join('\n'),
      ].join('\n\n');

      const suggestions = [
        'Make this plan more intense.',
        'Make this plan more relaxed.',
      ];

      return { content, suggestions };
    }

    // Summary of today / progress
    if (text.includes('summarize') || text.includes("today's topics")) {
      const content = [
        `So far you've completed ${completedCount} of ${totalNodes || 0} steps (${progressPercent}%).`,
        completedCount
          ? `Recently completed topics: ${completedNodes
              .slice(-3)
              .map((c) => {
                const node = nodes.find((n) => n.nodeId === c.nodeId);
                return node?.title || c.nodeId;
              })
              .join(', ') || 'recent nodes'}.`
          : 'You have not completed any steps yet. Start with the first node to begin your journey.',
      ].join('\n\n');

      const suggestions = [
        'What should I review from what I learned?',
        'Suggest a quick recap quiz for me.',
      ];

      return { content, suggestions };
    }

    // Fallback generic guidance
    const genericContent = [
      `You're on the "${path?.pathName || 'learning'}" path at ${
        progressPercent
      }% completion.`,
      'Focus on understanding concepts deeply rather than rushing through steps. Take notes, build small projects, and revisit difficult nodes.',
      'You can ask me to explain the path, pick the next step, or create a short study plan for you.',
    ].join('\n\n');

    const genericSuggestions = [
      'Explain this learning path step-by-step',
      'What should I focus on next?',
      'Create a weekly study plan for me',
    ];

    return { content: genericContent, suggestions: genericSuggestions };
  };

  const handleSend = async (text) => {
    const content = text || input;
    if (!content.trim() || !path?.pathId || !userId) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/learning-paths/paths/${path.pathId}/ai/coach`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            message: content,
            history: buildHistory(),
          }),
        }
      );

      const json = await response.json();
      const payload = json?.data || {};

      const botMessage = {
        id: `${Date.now().toString()}-bot`,
        type: 'bot',
        content:
          payload.content ||
          payload.response ||
          'I had trouble generating a response. Try asking in a different way.',
        suggestions: payload.suggestions || payload.followUpQuestions || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const { content: fallbackContent, suggestions } = generateLocalResponse(content);

      const fallbackMessage = {
        id: `${Date.now().toString()}-bot-fallback`,
        type: 'bot',
        content: fallbackContent,
        suggestions,
      };

      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (text) => {
    handleSend(text);
  };

  return (
    <div className="bg-[#121625]/80 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AI Learning Coach</p>
            <p className="text-xs text-white/60">Ask anything about this path</p>
          </div>
        </div>
        <MessageCircle className="w-4 h-4 text-white/40" />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`flex gap-2 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'bot' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-white" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  message.type === 'user'
                    ? 'bg-[#EC4899] text-white'
                    : message.isError
                    ? 'bg-red-500/10 text-red-200 border border-red-500/40'
                    : 'bg-white/5 text-white'
                }`}
              >
                <p>{message.content}</p>

                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1">
                    {message.suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(s)}
                        className="text-xs flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/80"
                      >
                        <Lightbulb className="w-3 h-3" />
                        <span className="truncate">{s}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {message.type === 'user' && (
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 text-white/70" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-white/60">
            <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="px-3 pb-3 pt-2 border-t border-white/10">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask the coach anything..."
            className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#EC4899]"
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="px-3 py-2 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] border-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => handleSend('What should I focus on next in this path?')}
            className="text-[11px] px-2 py-1 rounded-full bg-white/5 text-white/70 flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            Next step?
          </button>
          <button
            onClick={() => handleSend('Create a 7-day study plan based on my current progress.')}
            className="text-[11px] px-2 py-1 rounded-full bg-white/5 text-white/70 flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            7-day plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearningPathAICoach;

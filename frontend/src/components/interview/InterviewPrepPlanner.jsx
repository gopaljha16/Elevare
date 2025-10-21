import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/Accordion';
import { useToast } from '../ui/Toast';
import { cn } from '../../utils/cn';
import {
  Building2,
  Clock,
  Target,
  BookOpen,
  Code,
  MessageSquare,
  ExternalLink,
  CheckCircle,
  Star,
  TrendingUp,
  Users,
  Calendar,
  Filter,
  Bookmark,
  Download
} from 'lucide-react';

const InterviewPrepPlanner = () => {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const [bookmarkedProblems, setBookmarkedProblems] = useState(new Set());
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const { success } = useToast();

  // Company data structure
  const companies = {
    google: {
      name: 'Google',
      logo: '🔍',
      industry: 'Technology',
      size: 'Large (100k+ employees)',
      location: 'Mountain View, CA',
      roles: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Data Engineer', 'Product Manager'],
      overview: {
        duration: '4-6 weeks',
        rounds: '4-5 rounds',
        passRate: '15%',
        salaryRange: '$150k - $300k'
      },
      interviewRounds: [
        {
          name: 'Online Assessment',
          duration: '1-2 hours',
          type: 'Coding',
          description: 'LeetCode-style problems, focus on algorithms and data structures',
          topics: ['Arrays', 'Strings', 'Dynamic Programming'],
          passCriteria: 'Solve 2/3 problems optimally'
        },
        {
          name: 'Technical Phone Screen',
          duration: '45 minutes',
          type: 'Coding + Discussion',
          description: 'Live coding with a Google engineer',
          topics: ['Problem Solving', 'Code Quality', 'Communication'],
          passCriteria: 'Clean, working solution with good explanation'
        },
        {
          name: 'On-site Technical (4 rounds)',
          duration: '4-5 hours',
          type: 'Mixed',
          description: 'Coding, system design, and Googleyness interviews',
          topics: ['Algorithms', 'System Design', 'Leadership', 'Culture Fit'],
          passCriteria: 'Strong performance in 3/4 rounds'
        }
      ],
      requiredSkills: {
        mustHave: [
          { skill: 'Data Structures & Algorithms', level: 'Advanced' },
          { skill: 'Problem Solving', level: 'Advanced' },
          { skill: 'System Design', level: 'Intermediate' },
          { skill: 'Programming Language (Java/Python/C++)', level: 'Advanced' }
        ],
        goodToHave: [
          { skill: 'Distributed Systems', level: 'Intermediate' },
          { skill: 'Google Cloud Platform', level: 'Beginner' },
          { skill: 'Machine Learning', level: 'Beginner' }
        ],
        niceToHave: [
          { skill: 'Open Source Contributions', level: 'Any' },
          { skill: 'Research Publications', level: 'Any' }
        ]
      },
      studyRoadmap: [
        {
          week: '1-2',
          topic: 'Data Structures Fundamentals',
          estimatedHours: 20,
          concepts: ['Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Hash Tables'],
          resources: ['LeetCode Explore', 'Cracking the Coding Interview Ch 1-4']
        },
        {
          week: '3-4',
          topic: 'Advanced Data Structures',
          estimatedHours: 25,
          concepts: ['Trees', 'Graphs', 'Heaps', 'Tries'],
          resources: ['LeetCode Tree/Graph problems', 'Algorithm Design Manual Ch 5-6']
        },
        {
          week: '5-6',
          topic: 'Algorithms & Dynamic Programming',
          estimatedHours: 30,
          concepts: ['Sorting', 'Searching', 'DP', 'Greedy', 'Backtracking'],
          resources: ['LeetCode DP problems', 'Elements of Programming Interviews']
        },
        {
          week: '7-8',
          topic: 'System Design',
          estimatedHours: 20,
          concepts: ['Scalability', 'Load Balancing', 'Databases', 'Caching'],
          resources: ['Designing Data-Intensive Applications', 'System Design Primer']
        },
        {
          week: '9-10',
          topic: 'Mock Interviews & Practice',
          estimatedHours: 15,
          concepts: ['Behavioral Questions', 'Code Reviews', 'Time Management'],
          resources: ['Pramp', 'InterviewBit Mock Interviews']
        }
      ],
      codingProblems: [
        {
          name: 'Two Sum',
          difficulty: 'Easy',
          frequency: 'Very High',
          link: 'https://leetcode.com/problems/two-sum/',
          topics: ['Array', 'Hash Table'],
          timeComplexity: 'O(n)',
          approach: 'Use hash map to store complements'
        },
        {
          name: 'Longest Substring Without Repeating Characters',
          difficulty: 'Medium',
          frequency: 'High',
          link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
          topics: ['String', 'Sliding Window'],
          timeComplexity: 'O(n)',
          approach: 'Sliding window with hash set'
        },
        {
          name: 'Median of Two Sorted Arrays',
          difficulty: 'Hard',
          frequency: 'Medium',
          link: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
          topics: ['Array', 'Binary Search'],
          timeComplexity: 'O(log(min(m,n)))',
          approach: 'Binary search on smaller array'
        },
        {
          name: 'Valid Parentheses',
          difficulty: 'Easy',
          frequency: 'High',
          link: 'https://leetcode.com/problems/valid-parentheses/',
          topics: ['String', 'Stack'],
          timeComplexity: 'O(n)',
          approach: 'Use stack to match pairs'
        },
        {
          name: 'Maximum Subarray',
          difficulty: 'Medium',
          frequency: 'High',
          link: 'https://leetcode.com/problems/maximum-subarray/',
          topics: ['Array', 'Dynamic Programming'],
          timeComplexity: 'O(n)',
          approach: 'Kadane\'s algorithm'
        }
      ],
      behavioralQuestions: [
        {
          question: 'Tell me about yourself',
          lookingFor: 'Concise professional summary, relevant experience, passion for technology',
          sampleAnswer: 'I\'m a software engineer with 3 years of experience building scalable web applications...',
          tips: 'Keep it under 2 minutes, focus on professional achievements'
        },
        {
          question: 'Why do you want to join Google?',
          lookingFor: 'Knowledge of Google\'s mission, specific interest in products/technology',
          sampleAnswer: 'I\'m passionate about Google\'s mission to organize the world\'s information...',
          tips: 'Research Google\'s recent projects and initiatives'
        },
        {
          question: 'Describe a challenging project you worked on',
          lookingFor: 'Problem-solving skills, technical depth, leadership, impact',
          sampleAnswer: 'I led the redesign of our microservices architecture to improve performance...',
          tips: 'Use STAR method: Situation, Task, Action, Result'
        }
      ],
      tips: [
        'Google loves candidates who can think algorithmically and optimize solutions',
        'Practice explaining your thought process clearly during coding',
        'Be prepared for follow-up questions that increase complexity',
        'Show passion for Google\'s products and mission',
        'Demonstrate leadership and collaboration skills'
      ]
    },
    amazon: {
      name: 'Amazon',
      logo: '📦',
      industry: 'E-commerce/Cloud',
      size: 'Large (1M+ employees)',
      location: 'Seattle, WA',
      roles: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Data Engineer', 'Product Manager'],
      overview: {
        duration: '4-6 weeks',
        rounds: '4-5 rounds',
        passRate: '20%',
        salaryRange: '$130k - $280k'
      },
      interviewRounds: [
        {
          name: 'Online Assessment',
          duration: '1.5 hours',
          type: 'Coding + Behavioral',
          description: 'Coding problems + work simulation scenarios',
          topics: ['Algorithms', 'Leadership Principles'],
          passCriteria: 'Strong coding performance + good behavioral responses'
        },
        {
          name: 'Technical Phone Screen',
          duration: '1 hour',
          type: 'Coding',
          description: 'Live coding focused on problem-solving',
          topics: ['Data Structures', 'Algorithms', 'Optimization'],
          passCriteria: 'Optimal solution with clear communication'
        },
        {
          name: 'On-site Loop (5 rounds)',
          duration: '5-6 hours',
          type: 'Mixed',
          description: 'Technical + behavioral interviews focused on Leadership Principles',
          topics: ['Coding', 'System Design', 'Leadership Principles', 'Bar Raiser'],
          passCriteria: 'Meet the bar in all areas, especially leadership'
        }
      ],
      requiredSkills: {
        mustHave: [
          { skill: 'Data Structures & Algorithms', level: 'Advanced' },
          { skill: 'Leadership Principles', level: 'Advanced' },
          { skill: 'System Design', level: 'Intermediate' },
          { skill: 'Programming Language', level: 'Advanced' }
        ],
        goodToHave: [
          { skill: 'AWS Services', level: 'Intermediate' },
          { skill: 'Distributed Systems', level: 'Intermediate' },
          { skill: 'Microservices', level: 'Beginner' }
        ],
        niceToHave: [
          { skill: 'Machine Learning', level: 'Beginner' },
          { skill: 'DevOps', level: 'Beginner' }
        ]
      },
      studyRoadmap: [
        {
          week: '1-2',
          topic: 'Leadership Principles Deep Dive',
          estimatedHours: 15,
          concepts: ['Customer Obsession', 'Ownership', 'Invent and Simplify', 'Learn and Be Curious'],
          resources: ['Amazon Leadership Principles Guide', 'STAR Method Practice']
        },
        {
          week: '3-4',
          topic: 'Core Data Structures',
          estimatedHours: 25,
          concepts: ['Arrays', 'Trees', 'Graphs', 'Dynamic Programming'],
          resources: ['LeetCode Amazon Tagged Problems', 'Elements of Programming Interviews']
        },
        {
          week: '5-6',
          topic: 'System Design Fundamentals',
          estimatedHours: 20,
          concepts: ['Scalability', 'AWS Services', 'Database Design', 'API Design'],
          resources: ['AWS Architecture Center', 'System Design Interview Book']
        },
        {
          week: '7-8',
          topic: 'Advanced Algorithms',
          estimatedHours: 25,
          concepts: ['Graph Algorithms', 'Advanced DP', 'String Algorithms'],
          resources: ['LeetCode Hard Problems', 'Competitive Programming']
        },
        {
          week: '9-10',
          topic: 'Mock Interviews & Behavioral Prep',
          estimatedHours: 15,
          concepts: ['Leadership Stories', 'Technical Communication', 'Time Management'],
          resources: ['Pramp', 'Amazon Interview Stories']
        }
      ],
      codingProblems: [
        {
          name: 'Critical Connections in a Network',
          difficulty: 'Hard',
          frequency: 'High',
          link: 'https://leetcode.com/problems/critical-connections-in-a-network/',
          topics: ['Graph', 'DFS'],
          timeComplexity: 'O(V+E)',
          approach: 'Tarjan\'s algorithm for bridges'
        },
        {
          name: 'Number of Islands',
          difficulty: 'Medium',
          frequency: 'Very High',
          link: 'https://leetcode.com/problems/number-of-islands/',
          topics: ['Graph', 'DFS', 'BFS'],
          timeComplexity: 'O(m*n)',
          approach: 'DFS/BFS to mark connected components'
        },
        {
          name: 'Merge k Sorted Lists',
          difficulty: 'Hard',
          frequency: 'High',
          link: 'https://leetcode.com/problems/merge-k-sorted-lists/',
          topics: ['Linked List', 'Heap'],
          timeComplexity: 'O(n log k)',
          approach: 'Min heap or divide and conquer'
        }
      ],
      behavioralQuestions: [
        {
          question: 'Tell me about a time you had to work with limited resources',
          lookingFor: 'Frugality leadership principle, resourcefulness, creativity',
          sampleAnswer: 'When our team\'s budget was cut, I found ways to optimize our infrastructure costs...',
          tips: 'Focus on how you delivered results despite constraints'
        },
        {
          question: 'Describe a time you disagreed with your manager',
          lookingFor: 'Have Backbone; Disagree and Commit principle',
          sampleAnswer: 'I respectfully disagreed with the technical approach my manager suggested...',
          tips: 'Show you can disagree respectfully and commit to decisions'
        }
      ],
      tips: [
        'Amazon heavily emphasizes Leadership Principles - prepare stories for each',
        'Practice the STAR method for behavioral questions',
        'Focus on customer impact in your examples',
        'Be prepared to dive deep into technical details',
        'Show ownership and accountability in your stories'
      ]
    },
    microsoft: {
      name: 'Microsoft',
      logo: '🪟',
      industry: 'Technology',
      size: 'Large (200k+ employees)',
      location: 'Redmond, WA',
      roles: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Data Engineer', 'Product Manager'],
      overview: {
        duration: '3-4 weeks',
        rounds: '3-4 rounds',
        passRate: '25%',
        salaryRange: '$120k - $250k'
      },
      interviewRounds: [
        {
          name: 'Phone Screen',
          duration: '1 hour',
          type: 'Coding + Behavioral',
          description: 'Technical problem solving and culture fit assessment',
          topics: ['Problem Solving', 'Communication', 'Microsoft Values'],
          passCriteria: 'Strong technical skills and cultural alignment'
        },
        {
          name: 'Virtual On-site (4 rounds)',
          duration: '4 hours',
          type: 'Mixed',
          description: 'Technical interviews with different team members',
          topics: ['Coding', 'System Design', 'Behavioral', 'Role-specific'],
          passCriteria: 'Consistent performance across all rounds'
        }
      ],
      requiredSkills: {
        mustHave: [
          { skill: 'Problem Solving', level: 'Advanced' },
          { skill: 'Programming Fundamentals', level: 'Advanced' },
          { skill: 'Communication', level: 'Advanced' },
          { skill: 'Collaboration', level: 'Intermediate' }
        ],
        goodToHave: [
          { skill: 'Azure Cloud Services', level: 'Intermediate' },
          { skill: 'System Design', level: 'Intermediate' },
          { skill: '.NET Framework', level: 'Beginner' }
        ],
        niceToHave: [
          { skill: 'Open Source Contributions', level: 'Any' },
          { skill: 'Microsoft Technologies', level: 'Beginner' }
        ]
      },
      studyRoadmap: [
        {
          week: '1-2',
          topic: 'Core Programming Concepts',
          estimatedHours: 20,
          concepts: ['OOP', 'Data Structures', 'Algorithms', 'Problem Solving'],
          resources: ['LeetCode Easy/Medium', 'Programming Interviews Exposed']
        },
        {
          week: '3-4',
          topic: 'System Design & Architecture',
          estimatedHours: 15,
          concepts: ['Scalability', 'Microservices', 'Database Design', 'API Design'],
          resources: ['System Design Primer', 'Azure Architecture Patterns']
        },
        {
          week: '5-6',
          topic: 'Microsoft Culture & Values',
          estimatedHours: 10,
          concepts: ['Growth Mindset', 'Inclusion', 'Customer Focus', 'Partner Success'],
          resources: ['Microsoft Culture Guide', 'Behavioral Interview Prep']
        }
      ],
      codingProblems: [
        {
          name: 'Reverse Linked List',
          difficulty: 'Easy',
          frequency: 'High',
          link: 'https://leetcode.com/problems/reverse-linked-list/',
          topics: ['Linked List'],
          timeComplexity: 'O(n)',
          approach: 'Iterative or recursive reversal'
        },
        {
          name: 'Binary Tree Level Order Traversal',
          difficulty: 'Medium',
          frequency: 'High',
          link: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
          topics: ['Tree', 'BFS'],
          timeComplexity: 'O(n)',
          approach: 'BFS with queue'
        }
      ],
      behavioralQuestions: [
        {
          question: 'Tell me about a time you learned something new',
          lookingFor: 'Growth mindset, learning agility, curiosity',
          sampleAnswer: 'When I needed to learn React for a new project...',
          tips: 'Emphasize your learning process and how you applied new knowledge'
        }
      ],
      tips: [
        'Microsoft values growth mindset - show how you learn and adapt',
        'Emphasize collaboration and teamwork in your examples',
        'Be prepared to discuss how you handle ambiguity',
        'Show passion for technology and continuous learning'
      ]
    },
    meta: {
      name: 'Meta (Facebook)',
      logo: '👥',
      industry: 'Social Media/Technology',
      size: 'Large (80k+ employees)',
      location: 'Menlo Park, CA',
      roles: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Data Engineer', 'Product Manager'],
      overview: {
        duration: '4-6 weeks',
        rounds: '4-5 rounds',
        passRate: '18%',
        salaryRange: '$140k - $290k'
      },
      interviewRounds: [
        {
          name: 'Recruiter Screen',
          duration: '30 minutes',
          type: 'Behavioral',
          description: 'Initial screening with recruiter about background and interest',
          topics: ['Background', 'Interest in Meta', 'Role Expectations'],
          passCriteria: 'Clear communication and genuine interest'
        },
        {
          name: 'Technical Phone Screen',
          duration: '45 minutes',
          type: 'Coding',
          description: 'Live coding session with focus on problem-solving speed',
          topics: ['Algorithms', 'Data Structures', 'Code Quality'],
          passCriteria: 'Optimal solution within time limit'
        },
        {
          name: 'On-site Virtual Loop (4 rounds)',
          duration: '4-5 hours',
          type: 'Mixed',
          description: 'Technical coding, system design, and behavioral interviews',
          topics: ['Coding', 'System Design', 'Behavioral', 'Product Sense'],
          passCriteria: 'Strong performance in 3/4 rounds'
        }
      ],
      requiredSkills: {
        mustHave: [
          { skill: 'Fast Problem Solving', level: 'Advanced' },
          { skill: 'System Design', level: 'Advanced' },
          { skill: 'Coding Speed & Accuracy', level: 'Advanced' },
          { skill: 'Communication', level: 'Advanced' }
        ],
        goodToHave: [
          { skill: 'React/Frontend Technologies', level: 'Intermediate' },
          { skill: 'Distributed Systems', level: 'Intermediate' },
          { skill: 'Product Thinking', level: 'Beginner' }
        ],
        niceToHave: [
          { skill: 'Social Media Understanding', level: 'Any' },
          { skill: 'Mobile Development', level: 'Beginner' }
        ]
      },
      studyRoadmap: [
        {
          week: '1-2',
          topic: 'Speed Coding Practice',
          estimatedHours: 25,
          concepts: ['Fast Implementation', 'Clean Code', 'Edge Cases', 'Testing'],
          resources: ['LeetCode Speed Practice', 'Meta Interview Questions']
        },
        {
          week: '3-4',
          topic: 'Graph & Tree Algorithms',
          estimatedHours: 30,
          concepts: ['BFS/DFS', 'Tree Traversals', 'Graph Algorithms', 'Social Network Problems'],
          resources: ['Graph Theory Course', 'Social Network Analysis']
        },
        {
          week: '5-6',
          topic: 'System Design at Scale',
          estimatedHours: 25,
          concepts: ['News Feed Design', 'Chat Systems', 'Notification Systems', 'CDN'],
          resources: ['High Scalability Blog', 'Meta Engineering Blog']
        },
        {
          week: '7-8',
          topic: 'Product & Behavioral Prep',
          estimatedHours: 15,
          concepts: ['Product Sense', 'User Experience', 'Meta Values', 'Impact Stories'],
          resources: ['Product Management Books', 'Meta Culture Guide']
        }
      ],
      codingProblems: [
        {
          name: 'Binary Tree Vertical Order Traversal',
          difficulty: 'Medium',
          frequency: 'Very High',
          link: 'https://leetcode.com/problems/binary-tree-vertical-order-traversal/',
          topics: ['Tree', 'BFS', 'Hash Table'],
          timeComplexity: 'O(n)',
          approach: 'BFS with column tracking using hash map'
        },
        {
          name: 'Add and Search Word - Data Structure Design',
          difficulty: 'Medium',
          frequency: 'High',
          link: 'https://leetcode.com/problems/add-and-search-word-data-structure-design/',
          topics: ['Trie', 'DFS', 'Design'],
          timeComplexity: 'O(n)',
          approach: 'Trie with wildcard search using DFS'
        },
        {
          name: 'Remove Invalid Parentheses',
          difficulty: 'Hard',
          frequency: 'High',
          link: 'https://leetcode.com/problems/remove-invalid-parentheses/',
          topics: ['String', 'BFS', 'DFS'],
          timeComplexity: 'O(2^n)',
          approach: 'BFS to find minimum removals'
        }
      ],
      behavioralQuestions: [
        {
          question: 'Tell me about a time you had to move fast and break things',
          lookingFor: 'Meta\'s move fast culture, calculated risk-taking, learning from failures',
          sampleAnswer: 'When we needed to ship a critical feature quickly, I took a calculated risk...',
          tips: 'Show you can balance speed with quality and learn from mistakes'
        },
        {
          question: 'How would you improve Facebook/Instagram?',
          lookingFor: 'Product sense, user empathy, technical feasibility, business impact',
          sampleAnswer: 'I would focus on improving user engagement through better content discovery...',
          tips: 'Consider user needs, technical constraints, and business metrics'
        }
      ],
      tips: [
        'Meta interviews focus heavily on speed and efficiency',
        'Practice coding problems under time pressure',
        'Understand Meta\'s products and recent feature launches',
        'Be prepared for system design questions about social media platforms',
        'Show passion for connecting people and building community'
      ]
    },
    apple: {
      name: 'Apple',
      logo: '🍎',
      industry: 'Technology/Hardware',
      size: 'Large (150k+ employees)',
      location: 'Cupertino, CA',
      roles: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'iOS Developer', 'macOS Developer', 'Product Manager'],
      overview: {
        duration: '3-4 weeks',
        rounds: '3-4 rounds',
        passRate: '22%',
        salaryRange: '$130k - $270k'
      },
      interviewRounds: [
        {
          name: 'Phone Screen',
          duration: '1 hour',
          type: 'Technical + Behavioral',
          description: 'Technical problem solving with focus on clean, efficient code',
          topics: ['Algorithms', 'Code Quality', 'Apple Values'],
          passCriteria: 'Elegant solution with attention to detail'
        },
        {
          name: 'On-site Interviews (3-4 rounds)',
          duration: '4-5 hours',
          type: 'Mixed',
          description: 'Technical depth, system design, and cultural fit',
          topics: ['Deep Technical Knowledge', 'System Design', 'Innovation', 'Attention to Detail'],
          passCriteria: 'Excellence in technical depth and cultural alignment'
        }
      ],
      requiredSkills: {
        mustHave: [
          { skill: 'Attention to Detail', level: 'Advanced' },
          { skill: 'Code Quality & Performance', level: 'Advanced' },
          { skill: 'Problem Solving', level: 'Advanced' },
          { skill: 'System Optimization', level: 'Intermediate' }
        ],
        goodToHave: [
          { skill: 'iOS/macOS Development', level: 'Intermediate' },
          { skill: 'Performance Optimization', level: 'Intermediate' },
          { skill: 'Hardware-Software Integration', level: 'Beginner' }
        ],
        niceToHave: [
          { skill: 'Design Sensibility', level: 'Any' },
          { skill: 'Swift/Objective-C', level: 'Beginner' }
        ]
      },
      studyRoadmap: [
        {
          week: '1-2',
          topic: 'Code Quality & Optimization',
          estimatedHours: 20,
          concepts: ['Clean Code', 'Performance Optimization', 'Memory Management', 'Algorithms'],
          resources: ['Clean Code Book', 'Performance Optimization Guides']
        },
        {
          week: '3-4',
          topic: 'System Design & Architecture',
          estimatedHours: 20,
          concepts: ['Scalable Systems', 'Performance', 'Reliability', 'User Experience'],
          resources: ['System Design Books', 'Apple Developer Documentation']
        },
        {
          week: '5-6',
          topic: 'Apple Ecosystem & Culture',
          estimatedHours: 10,
          concepts: ['Apple Values', 'Innovation', 'User Privacy', 'Design Principles'],
          resources: ['Apple Keynotes', 'Design Guidelines']
        }
      ],
      codingProblems: [
        {
          name: 'LRU Cache',
          difficulty: 'Medium',
          frequency: 'High',
          link: 'https://leetcode.com/problems/lru-cache/',
          topics: ['Design', 'Hash Table', 'Linked List'],
          timeComplexity: 'O(1)',
          approach: 'Hash map + doubly linked list'
        },
        {
          name: 'Design Hit Counter',
          difficulty: 'Medium',
          frequency: 'Medium',
          link: 'https://leetcode.com/problems/design-hit-counter/',
          topics: ['Design', 'Queue'],
          timeComplexity: 'O(1)',
          approach: 'Circular buffer or sliding window'
        }
      ],
      behavioralQuestions: [
        {
          question: 'Tell me about a time you paid attention to detail',
          lookingFor: 'Meticulousness, quality focus, user experience awareness',
          sampleAnswer: 'When developing a user interface, I noticed subtle inconsistencies...',
          tips: 'Show how attention to detail improved user experience or product quality'
        }
      ],
      tips: [
        'Apple values perfection and attention to detail',
        'Focus on code quality and elegant solutions',
        'Understand Apple\'s design principles and user experience focus',
        'Be prepared to discuss performance optimization',
        'Show passion for creating exceptional user experiences'
      ]
    }
  };

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner (0-1 years)' },
    { value: 'intermediate', label: 'Intermediate (1-3 years)' },
    { value: 'advanced', label: 'Advanced (3+ years)' }
  ];

  const toggleTopicCompletion = (topicId) => {
    const newCompleted = new Set(completedTopics);
    if (newCompleted.has(topicId)) {
      newCompleted.delete(topicId);
    } else {
      newCompleted.add(topicId);
    }
    setCompletedTopics(newCompleted);
    success(newCompleted.has(topicId) ? 'Topic marked as complete!' : 'Topic unmarked');
  };

  const toggleProblemBookmark = (problemName) => {
    const newBookmarked = new Set(bookmarkedProblems);
    if (newBookmarked.has(problemName)) {
      newBookmarked.delete(problemName);
    } else {
      newBookmarked.add(problemName);
    }
    setBookmarkedProblems(newBookmarked);
  };

  const getFilteredProblems = (problems) => {
    if (difficultyFilter === 'all') return problems;
    return problems.filter(p => p.difficulty.toLowerCase() === difficultyFilter);
  };

  const calculateProgress = () => {
    if (!selectedCompany || !companies[selectedCompany]) return 0;
    const totalTopics = companies[selectedCompany].studyRoadmap.length;
    return totalTopics > 0 ? (completedTopics.size / totalTopics) * 100 : 0;
  };

  if (!selectedCompany || !selectedRole || !selectedExperience) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
              Interview Prep Planner
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Get a personalized, AI-curated preparation roadmap with company-specific questions, skills, and resources
            </p>
          </motion.div>

          {/* Company Selection */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Select Target Company
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(companies).map(([key, company]) => (
                    <motion.button
                      key={key}
                      onClick={() => setSelectedCompany(key)}
                      className={cn(
                        "p-6 rounded-lg border-2 transition-all duration-200 text-left",
                        selectedCompany === key
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-4xl mb-2">{company.logo}</div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{company.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{company.industry}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{company.size}</p>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Role Selection */}
          {selectedCompany && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Select Role
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {companies[selectedCompany].roles.map((role) => (
                      <Button
                        key={role}
                        variant={selectedRole === role ? "default" : "outline"}
                        onClick={() => setSelectedRole(role)}
                        className="justify-start"
                      >
                        {role}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Experience Level Selection */}
          {selectedCompany && selectedRole && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Experience Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {experienceLevels.map((level) => (
                      <Button
                        key={level.value}
                        variant={selectedExperience === level.value ? "default" : "outline"}
                        onClick={() => setSelectedExperience(level.value)}
                        className="p-4 h-auto flex-col"
                      >
                        <div className="font-semibold">{level.label.split(' ')[0]}</div>
                        <div className="text-sm opacity-70">{level.label.split(' ').slice(1).join(' ')}</div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {selectedCompany && selectedRole && selectedExperience && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button
                size="lg"
                className="px-8 py-4 text-lg"
                onClick={() => setActiveTab('overview')}
              >
                Generate My Prep Plan
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  const company = companies[selectedCompany];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{company.logo}</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {company.name} Interview Prep
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedRole} • {experienceLevels.find(l => l.value === selectedExperience)?.label}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCompany('');
                setSelectedRole('');
                setSelectedExperience('');
              }}
            >
              Change Selection
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Overall Progress
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(calculateProgress())}% Complete
              </span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rounds">Rounds</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="problems">Problems</TabsTrigger>
            <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>    
      {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Interview Overview Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Interview Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                      <Badge variant="outline">{company.overview.duration}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Rounds</span>
                      <Badge variant="outline">{company.overview.rounds}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Pass Rate</span>
                      <Badge variant="secondary">{company.overview.passRate}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Salary Range</span>
                      <Badge variant="success">{company.overview.salaryRange}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Preparation Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{company.studyRoadmap.length}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Study Topics</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{company.codingProblems.length}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Coding Problems</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{company.behavioralQuestions.length}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Behavioral Questions</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Key Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Key Success Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {company.tips.slice(0, 3).map((tip, index) => (
                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Interview Rounds Tab */}
          <TabsContent value="rounds">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Interview Rounds Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {company.interviewRounds.map((round, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Round {index + 1}: {round.name}
                          </h3>
                          <div className="flex gap-2">
                            <Badge variant="outline">{round.duration}</Badge>
                            <Badge variant="secondary">{round.type}</Badge>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">{round.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Topics Covered</h4>
                            <div className="flex flex-wrap gap-1">
                              {round.topics.map((topic, topicIndex) => (
                                <Badge key={topicIndex} variant="outline" className="text-xs">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Pass Criteria</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{round.passCriteria}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Must Have Skills */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Star className="w-5 h-5" />
                    Must-Have Skills (Priority 1)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {company.requiredSkills.mustHave.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <span className="font-medium text-gray-900 dark:text-white">{skill.skill}</span>
                        <Badge variant="destructive">{skill.level}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Good to Have Skills */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-600">
                    <Star className="w-5 h-5" />
                    Good-to-Have Skills (Priority 2)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {company.requiredSkills.goodToHave.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <span className="font-medium text-gray-900 dark:text-white">{skill.skill}</span>
                        <Badge variant="warning">{skill.level}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Nice to Have Skills */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Star className="w-5 h-5" />
                    Nice-to-Have Skills (Priority 3)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {company.requiredSkills.niceToHave.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <span className="font-medium text-gray-900 dark:text-white">{skill.skill}</span>
                        <Badge variant="success">{skill.level}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Study Roadmap Tab */}
          <TabsContent value="roadmap">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Week-by-Week Study Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {company.studyRoadmap.map((week, index) => {
                      const topicId = `${selectedCompany}-${index}`;
                      const isCompleted = completedTopics.has(topicId);
                      
                      return (
                        <div key={index} className={cn(
                          "border rounded-lg p-6 transition-all duration-200",
                          isCompleted 
                            ? "border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700" 
                            : "border-gray-200 dark:border-gray-700"
                        )}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => toggleTopicCompletion(topicId)}
                                className={cn(
                                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                  isCompleted
                                    ? "border-green-500 bg-green-500 text-white"
                                    : "border-gray-300 dark:border-gray-600 hover:border-green-400"
                                )}
                              >
                                {isCompleted && <CheckCircle className="w-4 h-4" />}
                              </button>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Week {week.week}: {week.topic}
                              </h3>
                            </div>
                            <Badge variant="outline">{week.estimatedHours}h</Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Key Concepts</h4>
                              <div className="flex flex-wrap gap-1">
                                {week.concepts.map((concept, conceptIndex) => (
                                  <Badge key={conceptIndex} variant="secondary" className="text-xs">
                                    {concept}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Resources</h4>
                              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                {week.resources.map((resource, resourceIndex) => (
                                  <li key={resourceIndex} className="flex items-center gap-2">
                                    <BookOpen className="w-3 h-3" />
                                    {resource}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Coding Problems Tab */}
          <TabsContent value="problems">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      Curated Coding Problems
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getFilteredProblems(company.codingProblems).map((problem, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleProblemBookmark(problem.name)}
                              className={cn(
                                "p-1 rounded transition-colors",
                                bookmarkedProblems.has(problem.name)
                                  ? "text-yellow-500 hover:text-yellow-600"
                                  : "text-gray-400 hover:text-gray-600"
                              )}
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{problem.name}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                problem.difficulty === 'Hard' ? 'destructive' : 
                                problem.difficulty === 'Medium' ? 'warning' : 'success'
                              }
                            >
                              {problem.difficulty}
                            </Badge>
                            <Badge variant="outline">{problem.frequency}</Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topics</h4>
                            <div className="flex flex-wrap gap-1">
                              {problem.topics.map((topic, topicIndex) => (
                                <Badge key={topicIndex} variant="secondary" className="text-xs">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Complexity</h4>
                            <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {problem.timeComplexity}
                            </code>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Approach</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{problem.approach}</p>
                        </div>
                        
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <a href={problem.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            Solve on LeetCode
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Behavioral Questions Tab */}
          <TabsContent value="behavioral">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Behavioral Interview Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-4">
                    {company.behavioralQuestions.map((question, index) => (
                      <AccordionItem key={index} value={`question-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-lg px-4">
                        <AccordionTrigger className="text-left">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {question.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">What they're looking for:</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{question.lookingFor}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Sample Answer Structure:</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">{question.sampleAnswer}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tips:</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{question.tips}</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Company Tips */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    {company.name}-Specific Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {company.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Learning Resources */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Recommended Learning Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Books</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <BookOpen className="w-4 h-4" />
                          Cracking the Coding Interview
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <BookOpen className="w-4 h-4" />
                          Elements of Programming Interviews
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <BookOpen className="w-4 h-4" />
                          System Design Interview
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Online Platforms</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <ExternalLink className="w-4 h-4" />
                          LeetCode Premium
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <ExternalLink className="w-4 h-4" />
                          Pramp (Mock Interviews)
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <ExternalLink className="w-4 h-4" />
                          InterviewBit
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Export Your Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export as PDF
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export to Google Sheets
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InterviewPrepPlanner;
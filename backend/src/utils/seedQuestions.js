const Question = require('../models/Question');

const sampleQuestions = [
  // Technical Questions
  {
    type: 'technical',
    difficulty: 'easy',
    content: 'What is the difference between let, const, and var in JavaScript?',
    category: 'technical-concepts',
    suggestedAnswer: 'let and const are block-scoped, while var is function-scoped. const cannot be reassigned after declaration, let can be reassigned, and var can be both reassigned and redeclared.',
    explanation: 'Understanding variable declarations is fundamental in JavaScript programming.',
    tags: ['javascript', 'variables', 'scope'],
    estimatedTime: 5
  },
  {
    type: 'technical',
    difficulty: 'medium',
    content: 'Explain the concept of closures in JavaScript with an example.',
    category: 'technical-concepts',
    suggestedAnswer: 'A closure is when an inner function has access to variables from its outer function scope even after the outer function has returned. Example: function outer() { let x = 10; return function inner() { return x; }; }',
    explanation: 'Closures are a powerful feature in JavaScript that enables data privacy and function factories.',
    tags: ['javascript', 'closures', 'scope'],
    estimatedTime: 10
  },
  {
    type: 'coding',
    difficulty: 'easy',
    content: 'Write a function to reverse a string in JavaScript.',
    category: 'algorithms',
    suggestedAnswer: 'function reverseString(str) { return str.split("").reverse().join(""); } or using a loop to build the reversed string.',
    explanation: 'String manipulation is a common programming task that tests basic algorithmic thinking.',
    tags: ['javascript', 'strings', 'algorithms'],
    estimatedTime: 10
  },
  {
    type: 'coding',
    difficulty: 'medium',
    content: 'Implement a function to find the first non-repeating character in a string.',
    category: 'algorithms',
    suggestedAnswer: 'Use a hash map to count character frequencies, then iterate through the string to find the first character with count 1.',
    explanation: 'This problem tests understanding of hash maps and string traversal.',
    tags: ['algorithms', 'hash-map', 'strings'],
    estimatedTime: 15
  },
  {
    type: 'system-design',
    difficulty: 'hard',
    content: 'Design a URL shortening service like bit.ly. What are the key components and considerations?',
    category: 'system-design',
    suggestedAnswer: 'Key components: URL encoding service, database for mappings, cache layer, load balancer. Considerations: scalability, custom URLs, analytics, expiration.',
    explanation: 'System design questions test architectural thinking and scalability considerations.',
    tags: ['system-design', 'scalability', 'databases'],
    estimatedTime: 30
  },
  
  // Behavioral Questions
  {
    type: 'behavioral',
    difficulty: 'medium',
    content: 'Tell me about a time when you had to work with a difficult team member. How did you handle the situation?',
    category: 'behavioral',
    suggestedAnswer: 'Use the STAR method: Situation, Task, Action, Result. Focus on communication, empathy, and problem-solving skills.',
    explanation: 'Behavioral questions assess soft skills and cultural fit.',
    tags: ['teamwork', 'communication', 'conflict-resolution'],
    estimatedTime: 5
  },
  {
    type: 'behavioral',
    difficulty: 'medium',
    content: 'Describe a challenging project you worked on and how you overcame the obstacles.',
    category: 'behavioral',
    suggestedAnswer: 'Structure your answer with STAR method, emphasizing problem-solving, persistence, and learning from challenges.',
    explanation: 'This question evaluates resilience and problem-solving abilities.',
    tags: ['problem-solving', 'resilience', 'project-management'],
    estimatedTime: 5
  },
  
  // Multiple Choice Questions
  {
    type: 'multiple-choice',
    difficulty: 'easy',
    content: 'Which of the following is NOT a JavaScript data type?',
    options: [
      { text: 'String', isCorrect: false },
      { text: 'Boolean', isCorrect: false },
      { text: 'Float', isCorrect: true },
      { text: 'Number', isCorrect: false }
    ],
    category: 'technical-concepts',
    explanation: 'JavaScript has Number type for all numeric values, not separate Integer and Float types.',
    tags: ['javascript', 'data-types'],
    estimatedTime: 2
  },
  {
    type: 'multiple-choice',
    difficulty: 'medium',
    content: 'What is the time complexity of searching in a balanced binary search tree?',
    options: [
      { text: 'O(1)', isCorrect: false },
      { text: 'O(log n)', isCorrect: true },
      { text: 'O(n)', isCorrect: false },
      { text: 'O(n log n)', isCorrect: false }
    ],
    category: 'algorithms',
    explanation: 'In a balanced BST, search operations take O(log n) time due to the tree structure.',
    tags: ['data-structures', 'binary-search-tree', 'time-complexity'],
    estimatedTime: 3
  },
  
  // Company-specific questions
  {
    type: 'technical',
    difficulty: 'medium',
    content: 'How would you implement a real-time chat feature in a web application?',
    category: 'technical-concepts',
    company: 'Google',
    role: 'Software Engineer',
    suggestedAnswer: 'Use WebSockets for real-time communication, implement message queuing, consider scalability with multiple servers, handle offline users.',
    explanation: 'Real-time features require understanding of WebSockets, event-driven architecture, and scalability.',
    tags: ['websockets', 'real-time', 'scalability'],
    estimatedTime: 15
  },
  {
    type: 'behavioral',
    difficulty: 'medium',
    content: 'How do you stay updated with the latest technology trends?',
    category: 'behavioral',
    company: 'Microsoft',
    role: 'Software Developer',
    suggestedAnswer: 'Mention specific resources like tech blogs, conferences, online courses, open source contributions, and continuous learning mindset.',
    explanation: 'Tech companies value continuous learning and staying current with industry trends.',
    tags: ['continuous-learning', 'technology-trends'],
    estimatedTime: 5
  }
];

const seedQuestions = async () => {
  try {
    // Clear existing questions (optional - remove in production)
    // await Question.deleteMany({});
    
    // Check if questions already exist
    const existingCount = await Question.countDocuments();
    if (existingCount > 0) {
      console.log(`${existingCount} questions already exist. Skipping seed.`);
      return;
    }
    
    // Insert sample questions
    const insertedQuestions = await Question.insertMany(sampleQuestions);
    console.log(`Successfully seeded ${insertedQuestions.length} questions`);
    
    return insertedQuestions;
  } catch (error) {
    console.error('Error seeding questions:', error);
    throw error;
  }
};

module.exports = { seedQuestions, sampleQuestions };
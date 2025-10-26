const LearningPath = require('../models/LearningPath');

const samplePaths = [
  {
    pathId: 'full-stack-developer',
    pathName: 'Full Stack Developer Roadmap',
    description: 'Complete roadmap to become a professional full-stack developer. Learn frontend, backend, databases, and deployment.',
    category: 'Full Stack',
    difficulty: 'Intermediate',
    estimatedHours: 400,
    isPublished: true,
    tags: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Full Stack', 'Web Development'],
    nodes: [
      {
        nodeId: 'html-css-basics',
        title: 'HTML & CSS Fundamentals',
        description: 'Master the foundation of web development with semantic HTML and modern CSS techniques',
        skills: ['HTML5', 'CSS3', 'Semantic HTML', 'Responsive Design', 'Flexbox', 'CSS Grid', 'CSS Variables'],
        resources: [
          {
            type: 'course',
            title: 'HTML & CSS Complete Course',
            url: 'https://www.youtube.com/watch?v=mU6anWqZJcc',
            duration: '4 hours',
            provider: 'freeCodeCamp'
          },
          {
            type: 'documentation',
            title: 'MDN Web Docs',
            url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
            provider: 'Mozilla'
          }
        ],
        projects: [
          {
            title: 'Personal Portfolio Website',
            description: 'Build a responsive portfolio website using HTML and CSS',
            difficulty: 'Easy',
            estimatedHours: 8
          }
        ],
        prerequisites: [],
        sequentialOrder: 1,
        difficulty: 'Beginner',
        estimatedHours: 20,
        position: { x: 0, y: 0 }
      },
      {
        nodeId: 'javascript-fundamentals',
        title: 'JavaScript Programming',
        description: 'Learn modern JavaScript from basics to advanced concepts including ES6+ features',
        skills: ['Variables & Data Types', 'Functions & Scope', 'Arrays & Objects', 'ES6+ Features', 'DOM Manipulation', 'Event Handling', 'Async/Await'],
        resources: [
          {
            type: 'course',
            title: 'JavaScript Full Course',
            url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
            duration: '8 hours',
            provider: 'freeCodeCamp'
          },
          {
            type: 'book',
            title: 'Eloquent JavaScript',
            url: 'https://eloquentjavascript.net/',
            provider: 'Marijn Haverbeke'
          }
        ],
        projects: [
          {
            title: 'Todo List Application',
            description: 'Create an interactive todo list with local storage',
            difficulty: 'Medium',
            estimatedHours: 10
          }
        ],
        prerequisites: ['html-css-basics'],
        sequentialOrder: 2,
        difficulty: 'Beginner',
        estimatedHours: 40,
        position: { x: 1, y: 0 }
      },
      {
        nodeId: 'react-basics',
        title: 'React Development',
        description: 'Build dynamic user interfaces with React library and modern development patterns',
        skills: ['JSX Syntax', 'Components & Props', 'State Management', 'React Hooks', 'Event Handling', 'React Router', 'Context API'],
        resources: [
          {
            type: 'course',
            title: 'React Course for Beginners',
            url: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
            duration: '12 hours',
            provider: 'freeCodeCamp'
          },
          {
            type: 'documentation',
            title: 'Official React Documentation',
            url: 'https://react.dev/',
            provider: 'React Team'
          }
        ],
        projects: [
          {
            title: 'Weather App',
            description: 'Build a weather application using React and a weather API',
            difficulty: 'Medium',
            estimatedHours: 15
          }
        ],
        prerequisites: ['javascript-fundamentals'],
        sequentialOrder: 3,
        difficulty: 'Intermediate',
        estimatedHours: 50,
        position: { x: 2, y: 0 }
      },
      {
        nodeId: 'nodejs-express',
        title: 'Node.js & Express',
        description: 'Build server-side applications with Node.js',
        skills: ['Node.js', 'Express', 'REST APIs', 'Middleware', 'Authentication'],
        resources: [
          {
            type: 'course',
            title: 'Node.js and Express.js Full Course',
            url: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
            duration: '8 hours',
            provider: 'freeCodeCamp'
          }
        ],
        projects: [
          {
            title: 'RESTful API',
            description: 'Create a complete REST API with authentication',
            difficulty: 'Medium',
            estimatedHours: 20
          }
        ],
        prerequisites: ['javascript-fundamentals'],
        sequentialOrder: 4,
        difficulty: 'Intermediate',
        estimatedHours: 40,
        position: { x: 3, y: 0 }
      },
      {
        nodeId: 'mongodb-database',
        title: 'MongoDB & Database Design',
        description: 'Learn NoSQL database management with MongoDB',
        skills: ['MongoDB', 'Mongoose', 'Database Design', 'CRUD Operations', 'Aggregation'],
        resources: [
          {
            type: 'course',
            title: 'MongoDB Crash Course',
            url: 'https://www.youtube.com/watch?v=-56x56UppqQ',
            duration: '2 hours',
            provider: 'Traversy Media'
          }
        ],
        projects: [
          {
            title: 'Blog Platform',
            description: 'Build a blog platform with MongoDB backend',
            difficulty: 'Medium',
            estimatedHours: 25
          }
        ],
        prerequisites: ['nodejs-express'],
        sequentialOrder: 5,
        difficulty: 'Intermediate',
        estimatedHours: 30,
        position: { x: 4, y: 0 }
      },
      {
        nodeId: 'full-stack-project',
        title: 'Full Stack Project',
        description: 'Build a complete MERN stack application',
        skills: ['MERN Stack', 'State Management', 'Deployment', 'Testing'],
        resources: [
          {
            type: 'course',
            title: 'MERN Stack Tutorial',
            url: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
            duration: '5 hours',
            provider: 'Traversy Media'
          }
        ],
        projects: [
          {
            title: 'E-commerce Platform',
            description: 'Build a complete e-commerce application with cart, payments, and admin panel',
            difficulty: 'Hard',
            estimatedHours: 60
          }
        ],
        prerequisites: ['react-basics', 'mongodb-database'],
        sequentialOrder: 6,
        difficulty: 'Advanced',
        estimatedHours: 80,
        position: { x: 5, y: 0 }
      }
    ],
    connections: [
      { from: 'html-css-basics', to: 'javascript-fundamentals', type: 'prerequisite' },
      { from: 'javascript-fundamentals', to: 'react-basics', type: 'prerequisite' },
      { from: 'javascript-fundamentals', to: 'nodejs-express', type: 'prerequisite' },
      { from: 'nodejs-express', to: 'mongodb-database', type: 'prerequisite' },
      { from: 'react-basics', to: 'full-stack-project', type: 'prerequisite' },
      { from: 'mongodb-database', to: 'full-stack-project', type: 'prerequisite' }
    ]
  },
  {
    pathId: 'frontend-developer',
    pathName: 'Frontend Developer',
    description: 'Become a professional frontend developer with modern tools and frameworks',
    category: 'Frontend',
    difficulty: 'Beginner',
    estimatedHours: 200,
    isPublished: true,
    tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Frontend'],
    nodes: [
      {
        nodeId: 'web-basics',
        title: 'Web Development Basics',
        description: 'Start your journey with HTML, CSS, and web fundamentals',
        skills: ['HTML', 'CSS', 'Web Basics'],
        resources: [
          {
            type: 'course',
            title: 'Web Development for Beginners',
            url: 'https://www.youtube.com/watch?v=ysEN5RaKOlA',
            duration: '3 hours',
            provider: 'freeCodeCamp'
          }
        ],
        projects: [
          {
            title: 'Landing Page',
            description: 'Create a modern landing page',
            difficulty: 'Easy',
            estimatedHours: 5
          }
        ],
        prerequisites: [],
        sequentialOrder: 1,
        difficulty: 'Beginner',
        estimatedHours: 25,
        position: { x: 0, y: 0 }
      },
      {
        nodeId: 'advanced-css',
        title: 'Advanced CSS & Animations',
        description: 'Master CSS Grid, Flexbox, and animations',
        skills: ['CSS Grid', 'Flexbox', 'Animations', 'Transitions', 'Sass'],
        resources: [
          {
            type: 'course',
            title: 'Advanced CSS and Sass',
            url: 'https://www.udemy.com/course/advanced-css-and-sass/',
            provider: 'Udemy'
          }
        ],
        projects: [
          {
            title: 'Animated Portfolio',
            description: 'Build a portfolio with smooth animations',
            difficulty: 'Medium',
            estimatedHours: 12
          }
        ],
        prerequisites: ['web-basics'],
        sequentialOrder: 2,
        difficulty: 'Intermediate',
        estimatedHours: 30,
        position: { x: 1, y: 0 }
      },
      {
        nodeId: 'modern-javascript',
        title: 'Modern JavaScript',
        description: 'Learn ES6+ features and modern JavaScript',
        skills: ['ES6+', 'Async/Await', 'Promises', 'Modules'],
        resources: [
          {
            type: 'course',
            title: 'Modern JavaScript',
            url: 'https://javascript.info/',
            provider: 'JavaScript.info'
          }
        ],
        projects: [
          {
            title: 'API Dashboard',
            description: 'Create a dashboard that fetches and displays API data',
            difficulty: 'Medium',
            estimatedHours: 15
          }
        ],
        prerequisites: ['web-basics'],
        sequentialOrder: 3,
        difficulty: 'Intermediate',
        estimatedHours: 40,
        position: { x: 2, y: 0 }
      },
      {
        nodeId: 'react-advanced',
        title: 'React & State Management',
        description: 'Build complex applications with React and Redux',
        skills: ['React', 'Redux', 'Context API', 'Custom Hooks'],
        resources: [
          {
            type: 'course',
            title: 'Complete React Developer',
            url: 'https://www.udemy.com/course/complete-react-developer-zero-to-mastery/',
            provider: 'Udemy'
          }
        ],
        projects: [
          {
            title: 'Social Media App',
            description: 'Build a social media application with React',
            difficulty: 'Hard',
            estimatedHours: 40
          }
        ],
        prerequisites: ['modern-javascript'],
        sequentialOrder: 4,
        difficulty: 'Advanced',
        estimatedHours: 60,
        position: { x: 3, y: 0 }
      },
      {
        nodeId: 'testing-deployment',
        title: 'Testing & Deployment',
        description: 'Learn testing and deploy your applications',
        skills: ['Jest', 'React Testing Library', 'CI/CD', 'Deployment'],
        resources: [
          {
            type: 'course',
            title: 'Testing React Applications',
            url: 'https://testingjavascript.com/',
            provider: 'Kent C. Dodds'
          }
        ],
        projects: [
          {
            title: 'Production App',
            description: 'Deploy a fully tested application to production',
            difficulty: 'Medium',
            estimatedHours: 20
          }
        ],
        prerequisites: ['react-advanced'],
        sequentialOrder: 5,
        difficulty: 'Advanced',
        estimatedHours: 45,
        position: { x: 4, y: 0 }
      }
    ],
    connections: [
      { from: 'web-basics', to: 'advanced-css', type: 'prerequisite' },
      { from: 'web-basics', to: 'modern-javascript', type: 'prerequisite' },
      { from: 'modern-javascript', to: 'react-advanced', type: 'prerequisite' },
      { from: 'react-advanced', to: 'testing-deployment', type: 'prerequisite' }
    ]
  }
];

const seedLearningPaths = async () => {
  try {
    // Clear existing paths
    await LearningPath.deleteMany({});
    console.log('Cleared existing learning paths');

    // Insert sample paths
    await LearningPath.insertMany(samplePaths);
    console.log('Successfully seeded learning paths');
    
    return { success: true, message: 'Learning paths seeded successfully' };
  } catch (error) {
    console.error('Error seeding learning paths:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { seedLearningPaths, samplePaths };

const request = require('supertest');
const express = require('express');
const { analyzeResumeWithAI } = require('./src/controllers/resumeController');
const { authenticate } = require('./src/middleware/auth');

// Mock the middleware and dependencies
jest.mock('./src/middleware/auth');
jest.mock('./src/services/aiService');
jest.mock('./src/middleware/redis');

const app = express();
app.use(express.json());

// Mock authentication middleware
app.use((req, res, next) => {
  req.userId = 'test-user-id';
  next();
});

// Add the route
app.post('/api/resumes/analyze', analyzeResumeWithAI);

// Test data
const testResumeData = {
  personalInfo: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    location: 'New York, NY',
    linkedin: 'https://linkedin.com/in/johndoe',
    portfolio: 'https://johndoe.dev'
  },
  experience: [
    {
      company: 'Tech Corp',
      position: 'Software Engineer',
      startDate: '2022-01-01',
      endDate: '2023-12-31',
      description: 'Developed web applications using React and Node.js',
      achievements: ['Improved performance by 30%', 'Led team of 3 developers']
    }
  ],
  education: [
    {
      institution: 'University of Technology',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      graduationDate: '2021-05-15',
      gpa: '3.8'
    }
  ],
  skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
  projects: [
    {
      name: 'E-commerce Platform',
      description: 'Built a full-stack e-commerce application',
      technologies: ['React', 'Node.js', 'MongoDB'],
      link: 'https://github.com/johndoe/ecommerce'
    }
  ],
  achievements: ['Dean\'s List 2020', 'Hackathon Winner 2021']
};

// Simple test function
async function testAnalyzeEndpoint() {
  try {
    console.log('Testing /api/resumes/analyze endpoint...');
    
    const response = await request(app)
      .post('/api/resumes/analyze')
      .send(testResumeData)
      .expect('Content-Type', /json/);
    
    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(response.body, null, 2));
    
    if (response.status === 200) {
      console.log('✅ Endpoint test passed!');
      console.log('Analysis score:', response.body.data?.overallScore);
      console.log('Cached:', response.body.cached);
      console.log('Fallback:', response.body.fallback);
    } else {
      console.log('❌ Endpoint test failed!');
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAnalyzeEndpoint();
}

module.exports = { testAnalyzeEndpoint };
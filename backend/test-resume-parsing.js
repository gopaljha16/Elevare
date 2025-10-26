// Test script to verify resume parsing functionality
require('dotenv').config();

const aiService = require('./src/services/aiService');

async function testResumeParsingSetup() {
  console.log('🧪 Testing Resume Parsing Setup...\n');
  
  // Test 1: Check environment variables
  console.log('1️⃣ Checking Environment Variables:');
  console.log('   GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('');
  
  // Test 2: Check AI Service initialization
  console.log('2️⃣ Checking AI Service:');
  console.log('   AI Service Model:', aiService.model ? '✅ Initialized' : '❌ Failed');
  console.log('   GenAI Instance:', aiService.genAI ? '✅ Created' : '❌ Failed');
  console.log('');
  
  // Test 3: Test AI parsing with sample text
  if (aiService.model) {
    console.log('3️⃣ Testing AI Parsing with Sample Resume Text:');
    
    const sampleResumeText = `
    John Doe
    Software Developer
    john.doe@email.com
    +1-234-567-8900
    San Francisco, CA
    LinkedIn: linkedin.com/in/johndoe
    GitHub: github.com/johndoe
    
    PROFESSIONAL SUMMARY
    Experienced Full Stack Developer with 3+ years of experience in React, Node.js, and MongoDB.
    
    TECHNICAL SKILLS
    Programming Languages: JavaScript, Python, TypeScript
    Frontend: React, HTML, CSS, Bootstrap
    Backend: Node.js, Express, Django
    Databases: MongoDB, PostgreSQL, MySQL
    Tools: Git, Docker, VS Code, Postman
    
    WORK EXPERIENCE
    Senior Frontend Developer
    TechCorp Inc. | San Francisco, CA | Jan 2022 - Present
    • Developed responsive web applications using React and TypeScript
    • Improved application performance by 40% through code optimization
    • Led a team of 3 junior developers
    
    Frontend Developer Intern
    StartupXYZ | Remote | Jun 2021 - Dec 2021
    • Built user interfaces using React and Material-UI
    • Collaborated with backend team to integrate APIs
    
    PROJECTS
    E-commerce Platform
    • Built a full-stack e-commerce application using MERN stack
    • Implemented payment integration with Stripe
    • Technologies: React, Node.js, MongoDB, Express
    • GitHub: github.com/johndoe/ecommerce
    • Live: ecommerce-demo.com
    
    EDUCATION
    Bachelor of Science in Computer Science
    University of California, Berkeley | 2017 - 2021
    GPA: 3.8/4.0
    `;
    
    try {
      const result = await aiService.parseWithAI(sampleResumeText);
      console.log('   ✅ AI Parsing Successful!');
      console.log('   📊 Extracted Data Summary:');
      console.log('      Name:', result.personalInfo?.name || 'Not found');
      console.log('      Email:', result.personalInfo?.email || 'Not found');
      console.log('      Phone:', result.personalInfo?.phone || 'Not found');
      console.log('      Technical Skills:', result.skills?.technical?.length || 0);
      console.log('      Experience Entries:', result.experience?.length || 0);
      console.log('      Projects:', result.projects?.length || 0);
      console.log('      Education:', result.education?.length || 0);
      console.log('');
      console.log('   📋 Full Result:');
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.log('   ❌ AI Parsing Failed:', error.message);
    }
  }
  
  // Test 4: Check required dependencies
  console.log('4️⃣ Checking Dependencies:');
  try {
    require('pdf-parse');
    console.log('   pdf-parse: ✅ Available');
  } catch (e) {
    console.log('   pdf-parse: ❌ Missing');
  }
  
  try {
    require('mammoth');
    console.log('   mammoth: ✅ Available');
  } catch (e) {
    console.log('   mammoth: ❌ Missing');
  }
  
  try {
    require('@google/generative-ai');
    console.log('   @google/generative-ai: ✅ Available');
  } catch (e) {
    console.log('   @google/generative-ai: ❌ Missing');
  }
  
  console.log('\n🏁 Test Complete!');
  console.log('\n💡 Next Steps:');
  console.log('   1. Ensure GEMINI_API_KEY is set in your .env file');
  console.log('   2. Start your backend server: npm run dev');
  console.log('   3. Test with actual resume files through the frontend');
}

// Run the test
testResumeParsingSetup().catch(console.error);

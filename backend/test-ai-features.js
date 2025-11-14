#!/usr/bin/env node

/**
 * Comprehensive AI Features Testing Script
 * Tests all AI-powered features in JobSphere Resume Builder
 */

require('dotenv').config();
const aiService = require('./src/services/aiService');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results storage
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
  startTime: Date.now(),
};

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, status, details = '') {
  const symbol = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⚠';
  const color = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
  log(`${symbol} ${name}${details ? ': ' + details : ''}`, color);
}

function recordTest(name, status, details = {}) {
  testResults.total++;
  if (status === 'PASS') testResults.passed++;
  else if (status === 'FAIL') testResults.failed++;
  else testResults.warnings++;
  
  testResults.tests.push({
    name,
    status,
    details,
    timestamp: new Date().toISOString(),
  });
}

// Test data generators
const TestDataGenerator = {
  generateCompleteResume() {
    return {
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        location: 'San Francisco, CA',
        linkedin: 'https://linkedin.com/in/johndoe',
        portfolio: 'https://johndoe.dev',
      },
      experience: [
        {
          company: 'Tech Corp',
          position: 'Senior Software Engineer',
          startDate: '2020-01',
          endDate: '2024-01',
          current: false,
          description: 'Led development of scalable web applications',
          achievements: [
            'Improved system performance by 40%',
            'Led team of 5 developers',
            'Implemented CI/CD pipeline reducing deployment time by 60%',
          ],
        },
      ],
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'Stanford University',
          graduationDate: '2019',
          gpa: '3.8',
        },
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
      projects: [
        {
          name: 'E-commerce Platform',
          description: 'Built full-stack e-commerce solution',
          technologies: ['React', 'Node.js', 'MongoDB'],
        },
      ],
      achievements: ['AWS Certified Solutions Architect', 'Published 3 technical articles'],
    };
  },

  generatePartialResume() {
    return {
      personalInfo: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
      },
      experience: [
        {
          company: 'StartupXYZ',
          position: 'Developer',
          startDate: '2022-01',
          current: true,
        },
      ],
      skills: ['JavaScript', 'React'],
    };
  },

  generateJobDescription() {
    return `We are seeking a Senior Software Engineer to join our team.
    
Requirements:
- 5+ years of experience in software development
- Strong proficiency in JavaScript, React, and Node.js
- Experience with cloud platforms (AWS, Azure, or GCP)
- Excellent problem-solving skills
- Strong communication and teamwork abilities

Responsibilities:
- Design and develop scalable web applications
- Collaborate with cross-functional teams
- Mentor junior developers
- Participate in code reviews`;
  },
};

// Test Suite 1: AI Service Initialization
async function testAIServiceInitialization() {
  log('\n=== Testing AI Service Initialization ===', 'cyan');
  
  try {
    // Test 1.1: Check if AI service is initialized
    const hasModel = aiService.model !== null && aiService.model !== undefined;
    const hasGenAI = aiService.genAI !== null && aiService.genAI !== undefined;
    
    if (hasModel && hasGenAI) {
      logTest('AI Service Initialization', 'PASS', 'Service initialized successfully');
      recordTest('AI Service Initialization', 'PASS', { hasModel, hasGenAI });
    } else {
      logTest('AI Service Initialization', 'WARNING', 'Service in fallback mode');
      recordTest('AI Service Initialization', 'WARNING', { hasModel, hasGenAI });
    }
    
    // Test 1.2: Check API key
    const hasApiKey = !!process.env.GEMINI_API_KEY;
    if (hasApiKey) {
      logTest('API Key Configuration', 'PASS', 'GEMINI_API_KEY is set');
      recordTest('API Key Configuration', 'PASS');
    } else {
      logTest('API Key Configuration', 'FAIL', 'GEMINI_API_KEY not found');
      recordTest('API Key Configuration', 'FAIL');
    }
    
  } catch (error) {
    logTest('AI Service Initialization', 'FAIL', error.message);
    recordTest('AI Service Initialization', 'FAIL', { error: error.message });
  }
}

// Test Suite 2: Resume Comprehensive Analysis
async function testResumeAnalysis() {
  log('\n=== Testing Resume Comprehensive Analysis ===', 'cyan');
  
  try {
    // Test 2.1: Complete resume analysis
    log('Testing complete resume analysis...', 'blue');
    const completeResume = TestDataGenerator.generateCompleteResume();
    const startTime = Date.now();
    
    const analysis = await aiService.analyzeResumeComprehensive(completeResume);
    const duration = Date.now() - startTime;
    
    // Validate response structure
    const hasOverallScore = typeof analysis.overallScore === 'number';
    const hasSectionAnalysis = analysis.sectionAnalysis && typeof analysis.sectionAnalysis === 'object';
    const hasActionableFeedback = Array.isArray(analysis.actionableFeedback);
    
    if (hasOverallScore && hasSectionAnalysis && hasActionableFeedback) {
      logTest('Complete Resume Analysis', 'PASS', `Score: ${analysis.overallScore}, Time: ${duration}ms`);
      recordTest('Complete Resume Analysis', 'PASS', { 
        score: analysis.overallScore, 
        duration,
        cached: analysis.metadata?.cached 
      });
    } else {
      logTest('Complete Resume Analysis', 'FAIL', 'Invalid response structure');
      recordTest('Complete Resume Analysis', 'FAIL', { analysis });
    }
    
    // Test 2.2: Partial resume analysis
    log('Testing partial resume analysis...', 'blue');
    const partialResume = TestDataGenerator.generatePartialResume();
    const partialAnalysis = await aiService.analyzeResumeComprehensive(partialResume);
    
    if (partialAnalysis.overallScore < analysis.overallScore) {
      logTest('Partial Resume Analysis', 'PASS', `Lower score as expected: ${partialAnalysis.overallScore}`);
      recordTest('Partial Resume Analysis', 'PASS', { score: partialAnalysis.overallScore });
    } else {
      logTest('Partial Resume Analysis', 'WARNING', 'Score not lower than complete resume');
      recordTest('Partial Resume Analysis', 'WARNING', { score: partialAnalysis.overallScore });
    }
    
  } catch (error) {
    logTest('Resume Analysis', 'FAIL', error.message);
    recordTest('Resume Analysis', 'FAIL', { error: error.message });
  }
}

// Test Suite 3: ATS Scoring
async function testATSScoring() {
  log('\n=== Testing ATS Scoring ===', 'cyan');
  
  try {
    // Create resume text for ATS analysis
    const resumeText = `
John Doe
john.doe@example.com | +1-555-0123 | San Francisco, CA
LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Senior Software Engineer with 5+ years of experience in full-stack development.

EXPERIENCE
Senior Software Engineer | Tech Corp | 2020-2024
- Developed scalable web applications using React and Node.js
- Improved system performance by 40%
- Led team of 5 developers

EDUCATION
Bachelor of Science in Computer Science
Stanford University | 2019 | GPA: 3.8

SKILLS
JavaScript, React, Node.js, Python, AWS, Docker, MongoDB
    `;
    
    log('Testing ATS scoring...', 'blue');
    const startTime = Date.now();
    const atsResult = await aiService.analyzeResumeForATS(resumeText);
    const duration = Date.now() - startTime;
    
    // Validate ATS response
    const hasScore = typeof atsResult.overallScore === 'number';
    const hasSectionAnalysis = atsResult.sectionAnalysis && typeof atsResult.sectionAnalysis === 'object';
    const hasActionableSteps = Array.isArray(atsResult.actionableSteps);
    
    if (hasScore && hasSectionAnalysis) {
      logTest('ATS Scoring', 'PASS', `Score: ${atsResult.overallScore}, Time: ${duration}ms`);
      recordTest('ATS Scoring', 'PASS', { 
        score: atsResult.overallScore, 
        duration,
        sections: Object.keys(atsResult.sectionAnalysis || {}).length 
      });
    } else {
      logTest('ATS Scoring', 'FAIL', 'Invalid response structure');
      recordTest('ATS Scoring', 'FAIL', { atsResult });
    }
    
  } catch (error) {
    logTest('ATS Scoring', 'FAIL', error.message);
    recordTest('ATS Scoring', 'FAIL', { error: error.message });
  }
}

// Test Suite 4: Resume Optimization
async function testResumeOptimization() {
  log('\n=== Testing Resume Optimization ===', 'cyan');
  
  try {
    const resumeData = TestDataGenerator.generateCompleteResume();
    const jobDescription = TestDataGenerator.generateJobDescription();
    
    log('Testing optimization with job description...', 'blue');
    const startTime = Date.now();
    const optimization = await aiService.optimizeResumeContent(resumeData, jobDescription);
    const duration = Date.now() - startTime;
    
    // Validate optimization response
    const hasKeywords = Array.isArray(optimization.keywordSuggestions);
    const hasGrammar = Array.isArray(optimization.grammarImprovements);
    const hasScore = typeof optimization.effectivenessScore === 'number';
    
    if (hasKeywords && hasGrammar && hasScore) {
      logTest('Resume Optimization', 'PASS', `Score: ${optimization.effectivenessScore}, Time: ${duration}ms`);
      recordTest('Resume Optimization', 'PASS', { 
        score: optimization.effectivenessScore,
        keywords: optimization.keywordSuggestions?.length || 0,
        duration 
      });
    } else {
      logTest('Resume Optimization', 'FAIL', 'Invalid response structure');
      recordTest('Resume Optimization', 'FAIL', { optimization });
    }
    
  } catch (error) {
    logTest('Resume Optimization', 'FAIL', error.message);
    recordTest('Resume Optimization', 'FAIL', { error: error.message });
  }
}

// Test Suite 5: Interview Preparation
async function testInterviewPreparation() {
  log('\n=== Testing Interview Preparation ===', 'cyan');
  
  try {
    // Test 5.1: Question Generation
    log('Testing interview question generation...', 'blue');
    const params = {
      company: 'Google',
      role: 'Software Engineer',
      difficulty: 'medium',
      questionType: 'technical',
      count: 3,
    };
    
    const startTime = Date.now();
    const questions = await aiService.generateInterviewQuestions(params);
    const duration = Date.now() - startTime;
    
    const hasQuestions = questions.questions && Array.isArray(questions.questions);
    const correctCount = questions.questions?.length === 3;
    
    if (hasQuestions && correctCount) {
      logTest('Interview Question Generation', 'PASS', `Generated ${questions.questions.length} questions, Time: ${duration}ms`);
      recordTest('Interview Question Generation', 'PASS', { 
        count: questions.questions.length,
        duration 
      });
    } else {
      logTest('Interview Question Generation', 'FAIL', 'Invalid response or count');
      recordTest('Interview Question Generation', 'FAIL', { questions });
    }
    
    // Test 5.2: Answer Evaluation
    if (hasQuestions && questions.questions.length > 0) {
      log('Testing answer evaluation...', 'blue');
      const question = questions.questions[0].content;
      const goodAnswer = 'I would approach this by first understanding the requirements, then designing a scalable solution using appropriate data structures. I have experience with similar problems where I implemented a solution that improved performance by 50%.';
      
      const evalStartTime = Date.now();
      const evaluation = await aiService.evaluateInterviewAnswer(question, goodAnswer, 'technical');
      const evalDuration = Date.now() - evalStartTime;
      
      const hasScore = typeof evaluation.score === 'number';
      const hasFeedback = typeof evaluation.feedback === 'string';
      
      if (hasScore && hasFeedback) {
        logTest('Answer Evaluation', 'PASS', `Score: ${evaluation.score}, Time: ${evalDuration}ms`);
        recordTest('Answer Evaluation', 'PASS', { 
          score: evaluation.score,
          duration: evalDuration 
        });
      } else {
        logTest('Answer Evaluation', 'FAIL', 'Invalid response structure');
        recordTest('Answer Evaluation', 'FAIL', { evaluation });
      }
    }
    
  } catch (error) {
    logTest('Interview Preparation', 'FAIL', error.message);
    recordTest('Interview Preparation', 'FAIL', { error: error.message });
  }
}

// Test Suite 6: Cover Letter Generation
async function testCoverLetterGeneration() {
  log('\n=== Testing Cover Letter Generation ===', 'cyan');
  
  try {
    const resumeData = TestDataGenerator.generateCompleteResume();
    const jobDescription = TestDataGenerator.generateJobDescription();
    const companyInfo = 'Google is a leading technology company known for innovation and cutting-edge products.';
    
    log('Testing cover letter generation...', 'blue');
    const startTime = Date.now();
    const coverLetter = await aiService.generateCoverLetter(resumeData, jobDescription, companyInfo);
    const duration = Date.now() - startTime;
    
    const hasLetter = typeof coverLetter.coverLetter === 'string';
    const hasLength = coverLetter.coverLetter?.length > 100;
    
    if (hasLetter && hasLength) {
      logTest('Cover Letter Generation', 'PASS', `Length: ${coverLetter.coverLetter.length} chars, Time: ${duration}ms`);
      recordTest('Cover Letter Generation', 'PASS', { 
        length: coverLetter.coverLetter.length,
        duration 
      });
    } else {
      logTest('Cover Letter Generation', 'FAIL', 'Invalid or too short');
      recordTest('Cover Letter Generation', 'FAIL', { coverLetter });
    }
    
  } catch (error) {
    logTest('Cover Letter Generation', 'FAIL', error.message);
    recordTest('Cover Letter Generation', 'FAIL', { error: error.message });
  }
}

// Test Suite 7: Skill Gap Analysis
async function testSkillGapAnalysis() {
  log('\n=== Testing Skill Gap Analysis ===', 'cyan');
  
  try {
    const userSkills = ['JavaScript', 'React', 'Node.js'];
    const targetRole = 'Senior Full Stack Engineer';
    const targetCompany = 'Amazon';
    
    log('Testing skill gap analysis...', 'blue');
    const startTime = Date.now();
    const analysis = await aiService.analyzeSkillGaps(userSkills, targetRole, targetCompany);
    const duration = Date.now() - startTime;
    
    const hasRelevant = Array.isArray(analysis.relevantSkills);
    const hasMissing = Array.isArray(analysis.missingSkills);
    const hasPath = typeof analysis.learningPath === 'string';
    
    if (hasRelevant && hasMissing && hasPath) {
      logTest('Skill Gap Analysis', 'PASS', `Found ${analysis.missingSkills.length} missing skills, Time: ${duration}ms`);
      recordTest('Skill Gap Analysis', 'PASS', { 
        relevant: analysis.relevantSkills.length,
        missing: analysis.missingSkills.length,
        duration 
      });
    } else {
      logTest('Skill Gap Analysis', 'FAIL', 'Invalid response structure');
      recordTest('Skill Gap Analysis', 'FAIL', { analysis });
    }
    
  } catch (error) {
    logTest('Skill Gap Analysis', 'FAIL', error.message);
    recordTest('Skill Gap Analysis', 'FAIL', { error: error.message });
  }
}

// Test Suite 8: Caching Performance
async function testCachingPerformance() {
  log('\n=== Testing Caching Performance ===', 'cyan');
  
  try {
    const resumeData = TestDataGenerator.generateCompleteResume();
    
    // First request (should not be cached)
    log('Testing first request (cache miss)...', 'blue');
    const startTime1 = Date.now();
    const result1 = await aiService.analyzeResumeComprehensive(resumeData);
    const duration1 = Date.now() - startTime1;
    
    // Second request (should be cached)
    log('Testing second request (cache hit)...', 'blue');
    const startTime2 = Date.now();
    const result2 = await aiService.analyzeResumeComprehensive(resumeData);
    const duration2 = Date.now() - startTime2;
    
    const isCached = result2.metadata?.cached === true;
    const isFaster = duration2 < duration1;
    
    if (isCached || isFaster) {
      logTest('Caching Performance', 'PASS', `First: ${duration1}ms, Second: ${duration2}ms, Cached: ${isCached}`);
      recordTest('Caching Performance', 'PASS', { 
        firstRequest: duration1,
        secondRequest: duration2,
        cached: isCached,
        improvement: `${Math.round((1 - duration2/duration1) * 100)}%`
      });
    } else {
      logTest('Caching Performance', 'WARNING', 'Cache may not be working optimally');
      recordTest('Caching Performance', 'WARNING', { duration1, duration2, isCached });
    }
    
  } catch (error) {
    logTest('Caching Performance', 'FAIL', error.message);
    recordTest('Caching Performance', 'FAIL', { error: error.message });
  }
}

// Test Suite 9: Error Handling
async function testErrorHandling() {
  log('\n=== Testing Error Handling ===', 'cyan');
  
  try {
    // Test with invalid data
    log('Testing with invalid data...', 'blue');
    const invalidData = { invalid: 'data' };
    
    try {
      const result = await aiService.analyzeResumeComprehensive(invalidData);
      // Should still return a result (fallback)
      if (result && typeof result.overallScore === 'number') {
        logTest('Error Handling - Invalid Data', 'PASS', 'Fallback mechanism worked');
        recordTest('Error Handling - Invalid Data', 'PASS');
      } else {
        logTest('Error Handling - Invalid Data', 'WARNING', 'Unexpected response');
        recordTest('Error Handling - Invalid Data', 'WARNING', { result });
      }
    } catch (err) {
      logTest('Error Handling - Invalid Data', 'FAIL', err.message);
      recordTest('Error Handling - Invalid Data', 'FAIL', { error: err.message });
    }
    
  } catch (error) {
    logTest('Error Handling', 'FAIL', error.message);
    recordTest('Error Handling', 'FAIL', { error: error.message });
  }
}

// Generate final report
function generateReport() {
  const duration = Date.now() - testResults.startTime;
  const passRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  
  log('\n' + '='.repeat(60), 'bright');
  log('AI FEATURES TEST REPORT', 'bright');
  log('='.repeat(60), 'bright');
  
  log(`\nTest Execution Summary:`, 'cyan');
  log(`  Total Tests: ${testResults.total}`);
  log(`  Passed: ${testResults.passed}`, 'green');
  log(`  Failed: ${testResults.failed}`, 'red');
  log(`  Warnings: ${testResults.warnings}`, 'yellow');
  log(`  Pass Rate: ${passRate}%`, passRate >= 80 ? 'green' : 'yellow');
  log(`  Duration: ${(duration / 1000).toFixed(2)}s`);
  
  log(`\nDetailed Results:`, 'cyan');
  testResults.tests.forEach((test, index) => {
    const symbol = test.status === 'PASS' ? '✓' : test.status === 'FAIL' ? '✗' : '⚠';
    const color = test.status === 'PASS' ? 'green' : test.status === 'FAIL' ? 'red' : 'yellow';
    log(`  ${index + 1}. ${symbol} ${test.name}`, color);
    if (test.details && Object.keys(test.details).length > 0) {
      log(`     ${JSON.stringify(test.details)}`, 'reset');
    }
  });
  
  // Recommendations
  log(`\nRecommendations:`, 'cyan');
  if (testResults.failed > 0) {
    log(`  ⚠ ${testResults.failed} test(s) failed - review error details above`, 'yellow');
  }
  if (testResults.warnings > 0) {
    log(`  ⚠ ${testResults.warnings} warning(s) - consider investigating`, 'yellow');
  }
  if (testResults.passed === testResults.total) {
    log(`  ✓ All tests passed! AI features are working correctly`, 'green');
  }
  
  log('\n' + '='.repeat(60), 'bright');
  
  // Save report to file
  saveReportToFile();
}

// Save report to file
function saveReportToFile() {
  const fs = require('fs');
  const path = require('path');
  
  const reportDir = path.join(__dirname, 'test-results');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(reportDir, `ai-features-test-${timestamp}.json`);
  
  const report = {
    ...testResults,
    duration: Date.now() - testResults.startTime,
    passRate: ((testResults.passed / testResults.total) * 100).toFixed(1),
    timestamp: new Date().toISOString(),
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\nReport saved to: ${reportPath}`, 'cyan');
}

// Main test execution
async function runAllTests() {
  log('\n' + '='.repeat(60), 'bright');
  log('STARTING AI FEATURES COMPREHENSIVE TEST', 'bright');
  log('='.repeat(60), 'bright');
  log(`Start Time: ${new Date().toISOString()}`, 'cyan');
  
  try {
    await testAIServiceInitialization();
    await testResumeAnalysis();
    await testATSScoring();
    await testResumeOptimization();
    await testInterviewPreparation();
    await testCoverLetterGeneration();
    await testSkillGapAnalysis();
    await testCachingPerformance();
    await testErrorHandling();
  } catch (error) {
    log(`\nCritical Error: ${error.message}`, 'red');
    console.error(error);
  }
  
  generateReport();
}

// Run tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, testResults };

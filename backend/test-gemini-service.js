// Test script for Gemini Portfolio Service
require('dotenv').config();
const geminiPortfolioService = require('./src/services/geminiPortfolioService');

async function testGeminiService() {
  console.log('=== Testing Gemini Portfolio Service ===\n');
  
  // Test 1: Check if service is available
  console.log('Test 1: Service Availability');
  const isAvailable = geminiPortfolioService.isAvailable();
  console.log(`✓ Service available: ${isAvailable}`);
  console.log(`✓ Current model: ${geminiPortfolioService.currentModel || 'Not initialized'}\n`);
  
  if (!isAvailable) {
    console.log('❌ Service not available. Check GEMINI_API_KEY in .env file');
    process.exit(1);
  }
  
  // Test 2: Test connection
  console.log('Test 2: Connection Test');
  try {
    const connectionTest = await geminiPortfolioService.testConnection();
    console.log(`✓ Connection test: ${connectionTest ? 'PASSED' : 'FAILED'}\n`);
  } catch (error) {
    console.log(`❌ Connection test failed: ${error.message}\n`);
  }
  
  // Test 3: Test portfolio generation
  console.log('Test 3: Portfolio Generation');
  try {
    const result = await geminiPortfolioService.generatePortfolioCode(
      'Create a modern developer portfolio with dark theme',
      'Test User',
      null,
      false
    );
    
    console.log('✓ Portfolio generated successfully');
    console.log(`✓ HTML length: ${result.html?.length || 0} characters`);
    console.log(`✓ CSS length: ${result.css?.length || 0} characters`);
    console.log(`✓ JS length: ${result.js?.length || 0} characters`);
    console.log(`✓ Message: ${result.message}\n`);
    
    // Verify structure
    if (result.html && result.css && result.js) {
      console.log('✓ All code components present');
    } else {
      console.log('⚠️ Some code components missing');
    }
  } catch (error) {
    console.log(`❌ Portfolio generation failed: ${error.message}\n`);
  }
  
  console.log('\n=== Test Complete ===');
}

testGeminiService().catch(error => {
  console.error('Test failed with error:', error);
  process.exit(1);
});

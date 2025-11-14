// Test script to check available Gemini models
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModels() {
  console.log('=== Testing Gemini API ===\n');
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('❌ GEMINI_API_KEY not found in environment');
    process.exit(1);
  }
  
  console.log(`✓ API Key found: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Test different model names
  const modelsToTest = [
    'gemini-2.0-flash-exp',
    'gemini-exp-1206',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro',
    'gemini-pro',
    'models/gemini-2.0-flash-exp',
    'models/gemini-1.5-pro',
    'models/gemini-1.5-flash'
  ];
  
  console.log('Testing model availability:\n');
  
  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Say OK' }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 10 }
      });
      
      const response = await result.response;
      const text = response.text();
      console.log(`  ✓ SUCCESS - Response: ${text.trim()}\n`);
      break; // Found a working model
    } catch (error) {
      console.log(`  ❌ FAILED - ${error.message.substring(0, 100)}...\n`);
    }
  }
}

testModels().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});

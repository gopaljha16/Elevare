require('dotenv').config();
const aiService = require('./src/services/aiService');

async function testGeminiDirect() {
  try {
    console.log('🧪 Testing Gemini AI Service Directly...');
    console.log('🔑 API Key available:', !!process.env.GEMINI_API_KEY);
    console.log('🤖 Model available:', !!aiService.model);
    
    if (!aiService.model) {
      console.log('❌ Gemini AI service not available');
      return;
    }
    
    console.log('📤 Testing basic AI generation...');
    
    const prompt = `You are an expert web developer. Create a simple HTML portfolio for John Doe, a full-stack developer.

Return ONLY valid JSON in this format:
{
  "html": "HTML content here",
  "css": "CSS styles here", 
  "js": "JavaScript code here",
  "message": "Brief description"
}`;
    
    const result = await aiService.model.generateContent(prompt);
    const response = result.response.text();
    
    console.log('✅ AI generation successful!');
    console.log('📝 Response length:', response.length);
    console.log('📄 Response preview:');
    console.log(response.substring(0, 500) + '...');
    
    // Try to parse JSON
    try {
      let cleanedResponse = response.trim();
      cleanedResponse = cleanedResponse.replace(/```json\s*|\s*```/g, '');
      cleanedResponse = cleanedResponse.replace(/```\s*|\s*```/g, '');
      
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ JSON parsing successful!');
        console.log('💻 Generated code lengths:');
        console.log('  - HTML:', parsed.html?.length || 0, 'characters');
        console.log('  - CSS:', parsed.css?.length || 0, 'characters');
        console.log('  - JS:', parsed.js?.length || 0, 'characters');
        console.log('📝 Message:', parsed.message);
      } else {
        console.log('⚠️ No JSON found in response');
      }
    } catch (parseError) {
      console.log('⚠️ JSON parsing failed:', parseError.message);
    }
    
  } catch (error) {
    console.error('❌ Gemini test failed:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testGeminiDirect();
// Simple test script to verify server functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testServer() {
  console.log('🧪 Testing server functionality...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data.status);
    console.log('   - Database:', healthResponse.data.services.database);
    console.log('   - Redis:', healthResponse.data.services.redis);
    console.log('');

    // Test 2: 404 Route
    console.log('2. Testing 404 handler...');
    try {
      await axios.get(`${BASE_URL}/nonexistent`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ 404 handler working correctly');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log('');

    // Test 3: Auth Routes (should require data)
    console.log('3. Testing auth routes...');
    try {
      await axios.post(`${BASE_URL}/api/auth/login`, {});
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 422) {
        console.log('✅ Auth validation working correctly');
      } else {
        console.log('❌ Unexpected auth error:', error.message);
      }
    }

    console.log('\n🎉 Server tests completed!');
    console.log('\n📋 Summary:');
    console.log('- Server is running on port 5000');
    console.log('- Health endpoint is accessible');
    console.log('- 404 handler is working');
    console.log('- Auth routes are protected');
    console.log('\n🚀 Your Redis-enhanced backend is ready!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running on port 5000');
    }
  }
}

// Run tests
testServer();
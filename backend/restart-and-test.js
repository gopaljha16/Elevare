// Script to test the learning path APIs
require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:5000/api/learning-paths';

async function testAPIs() {
  try {
    console.log('🧪 Testing Learning Path APIs...\n');

    // Test 1: Get all paths
    console.log('1. Testing GET /paths...');
    const pathsResponse = await axios.get(`${API_URL}/paths`);
    console.log('✅ GET /paths works!');
    console.log(`   Found ${pathsResponse.data.data.length} paths\n`);

    // Test 2: Enroll user
    console.log('2. Testing POST /progress/enroll...');
    const enrollResponse = await axios.post(`${API_URL}/progress/enroll`, {
      userId: 'demo-user-test-123',
      pathId: 'frontend-developer'
    });
    console.log('✅ POST /progress/enroll works!');
    console.log(`   User enrolled with progress: ${enrollResponse.data.data.progress}%\n`);

    // Test 3: Get user progress
    console.log('3. Testing GET /progress/:userId...');
    const progressResponse = await axios.get(`${API_URL}/progress/demo-user-test-123`);
    console.log('✅ GET /progress/:userId works!');
    console.log(`   Found ${progressResponse.data.data.length} enrolled paths\n`);

    // Test 4: Complete a node
    console.log('4. Testing PUT /progress/.../complete...');
    const completeResponse = await axios.put(
      `${API_URL}/progress/demo-user-test-123/paths/frontend-developer/nodes/web-basics/complete`,
      { timeSpent: 60 }
    );
    console.log('✅ PUT /progress/.../complete works!');
    console.log(`   Progress updated to: ${completeResponse.data.data.progress}%\n`);

    console.log('🎉 All APIs are working perfectly!');
    console.log('✅ Frontend should work now!');

  } catch (error) {
    console.error('❌ API Test Failed:');
    console.error('   Error:', error.response?.data || error.message);
    console.error('   Status:', error.response?.status);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Solution: Restart the backend server to load new routes');
    }
  }
}

testAPIs();
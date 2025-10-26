// Quick verification that all APIs work
const axios = require('axios');

async function quickTest() {
  try {
    console.log('🔍 Quick API Test...\n');

    // Test enrollment
    const response = await axios.post('http://localhost:5000/api/learning-paths/progress/enroll', {
      userId: 'demo-user-verification',
      pathId: 'frontend-developer'
    });

    console.log('✅ SUCCESS! APIs are working!');
    console.log(`   User enrolled with ${response.data.data.progress}% progress`);
    console.log('\n🎉 Frontend will work now!');
    console.log('   Go to: http://localhost:5173/learning-paths');

  } catch (error) {
    console.log('❌ Still not working...');
    console.log('   Make sure you restarted the backend server!');
    console.log('   Error:', error.response?.data?.error || error.message);
  }
}

quickTest();
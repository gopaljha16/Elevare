/**
 * Deployment Test Script
 * Run this to test your deployment endpoints
 */

const https = require('https');

const BACKEND_URL = 'https://elevare-hvtr.onrender.com';
const FRONTEND_URL = 'https://elevare-seven.vercel.app';

console.log('🧪 Testing Deployment...\n');
console.log('Backend URL:', BACKEND_URL);
console.log('Frontend URL:', FRONTEND_URL);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test 1: Backend Health Check
function testBackendHealth() {
  return new Promise((resolve) => {
    console.log('Test 1: Backend Health Check');
    console.log('URL:', `${BACKEND_URL}/health`);
    
    https.get(`${BACKEND_URL}/health`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('✅ Status:', res.statusCode);
          console.log('Response:', JSON.stringify(json, null, 2));
          resolve(true);
        } catch (error) {
          console.log('❌ Failed to parse response');
          console.log('Raw response:', data);
          resolve(false);
        }
      });
    }).on('error', (error) => {
      console.log('❌ Error:', error.message);
      resolve(false);
    });
  });
}

// Test 2: CORS Preflight
function testCORS() {
  return new Promise((resolve) => {
    console.log('\nTest 2: CORS Preflight');
    console.log('URL:', `${BACKEND_URL}/api/auth/login`);
    console.log('Origin:', FRONTEND_URL);
    
    const options = {
      method: 'OPTIONS',
      hostname: 'elevare-hvtr.onrender.com',
      path: '/api/auth/login',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    };
    
    const req = https.request(options, (res) => {
      console.log('✅ Status:', res.statusCode);
      console.log('CORS Headers:');
      console.log('  Access-Control-Allow-Origin:', res.headers['access-control-allow-origin']);
      console.log('  Access-Control-Allow-Methods:', res.headers['access-control-allow-methods']);
      console.log('  Access-Control-Allow-Headers:', res.headers['access-control-allow-headers']);
      console.log('  Access-Control-Allow-Credentials:', res.headers['access-control-allow-credentials']);
      resolve(true);
    });
    
    req.on('error', (error) => {
      console.log('❌ Error:', error.message);
      resolve(false);
    });
    
    req.end();
  });
}

// Test 3: Frontend Accessibility
function testFrontend() {
  return new Promise((resolve) => {
    console.log('\nTest 3: Frontend Accessibility');
    console.log('URL:', FRONTEND_URL);
    
    https.get(FRONTEND_URL, (res) => {
      console.log('✅ Status:', res.statusCode);
      console.log('Content-Type:', res.headers['content-type']);
      
      if (res.statusCode === 200) {
        console.log('✅ Frontend is accessible');
        resolve(true);
      } else {
        console.log('⚠️  Unexpected status code');
        resolve(false);
      }
    }).on('error', (error) => {
      console.log('❌ Error:', error.message);
      resolve(false);
    });
  });
}

// Run all tests
async function runTests() {
  const test1 = await testBackendHealth();
  const test2 = await testCORS();
  const test3 = await testFrontend();
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Test Results:');
  console.log('  Backend Health:', test1 ? '✅ PASS' : '❌ FAIL');
  console.log('  CORS:', test2 ? '✅ PASS' : '❌ FAIL');
  console.log('  Frontend:', test3 ? '✅ PASS' : '❌ FAIL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (test1 && test2 && test3) {
    console.log('🎉 All tests passed! Your deployment looks good.');
    console.log('\n💡 Next steps:');
    console.log('   1. Open https://elevare-seven.vercel.app in your browser');
    console.log('   2. Open DevTools (F12) and check the Console tab');
    console.log('   3. Look for environment detection logs');
    console.log('   4. Try signing up or logging in');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.');
    console.log('\n💡 Troubleshooting:');
    if (!test1) {
      console.log('   - Backend health check failed');
      console.log('   - Check Render logs for errors');
      console.log('   - Verify backend is running');
    }
    if (!test2) {
      console.log('   - CORS test failed');
      console.log('   - Check FRONTEND_URL in Render environment variables');
      console.log('   - Verify CORS configuration in backend');
    }
    if (!test3) {
      console.log('   - Frontend accessibility failed');
      console.log('   - Check Vercel deployment status');
      console.log('   - Verify build completed successfully');
    }
  }
}

runTests();

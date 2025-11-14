#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Checks if frontend and backend are properly configured
 */

const https = require('https');
const http = require('http');

const FRONTEND_URL = 'https://elevare-seven.vercel.app';
const BACKEND_URL = 'https://elevare-hvtr.onrender.com';

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║           🔍 DEPLOYMENT VERIFICATION SCRIPT                    ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function checkBackendHealth() {
  console.log('🔍 Checking Backend Health...');
  console.log(`   URL: ${BACKEND_URL}/health`);
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);
    
    if (response.statusCode === 200) {
      console.log('   Status: ✅ Backend is UP');
      console.log(`   Response: ${response.body.substring(0, 100)}...`);
      return true;
    } else {
      console.log(`   Status: ❌ Backend returned ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`   Status: ❌ Backend is DOWN`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function checkBackendCORS() {
  console.log('\n🔍 Checking Backend CORS Configuration...');
  console.log(`   Testing if backend allows: ${FRONTEND_URL}`);
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);
    const corsHeader = response.headers['access-control-allow-origin'];
    
    if (corsHeader === FRONTEND_URL || corsHeader === '*') {
      console.log('   CORS: ✅ Frontend origin is allowed');
      console.log(`   Access-Control-Allow-Origin: ${corsHeader}`);
      return true;
    } else {
      console.log('   CORS: ⚠️  Frontend origin might not be allowed');
      console.log(`   Access-Control-Allow-Origin: ${corsHeader || 'NOT SET'}`);
      console.log(`   Expected: ${FRONTEND_URL}`);
      return false;
    }
  } catch (error) {
    console.log(`   CORS: ❌ Could not check CORS`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function checkFrontend() {
  console.log('\n🔍 Checking Frontend...');
  console.log(`   URL: ${FRONTEND_URL}`);
  
  try {
    const response = await makeRequest(FRONTEND_URL);
    
    if (response.statusCode === 200) {
      console.log('   Status: ✅ Frontend is UP');
      
      // Check if the HTML contains the backend URL
      if (response.body.includes(BACKEND_URL)) {
        console.log('   Config: ✅ Backend URL found in HTML (env vars likely set)');
      } else {
        console.log('   Config: ⚠️  Backend URL NOT found in HTML');
        console.log('   This might mean environment variables are not set in Vercel');
      }
      
      return true;
    } else {
      console.log(`   Status: ❌ Frontend returned ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`   Status: ❌ Frontend is DOWN`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testLoginEndpoint() {
  console.log('\n🔍 Testing Login Endpoint...');
  console.log(`   URL: ${BACKEND_URL}/api/auth/login`);
  
  try {
    // We expect this to fail with 400 (bad request) not 405 (method not allowed)
    const response = await new Promise((resolve, reject) => {
      const url = new URL(`${BACKEND_URL}/api/auth/login`);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': FRONTEND_URL
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      });
      
      req.on('error', (err) => reject(err));
      req.write(JSON.stringify({ email: 'test@test.com', password: 'test' }));
      req.end();
    });
    
    if (response.statusCode === 405) {
      console.log('   Status: ❌ 405 Method Not Allowed');
      console.log('   This means the endpoint is not properly configured');
      return false;
    } else if (response.statusCode === 400 || response.statusCode === 401) {
      console.log('   Status: ✅ Endpoint is working (400/401 expected for invalid credentials)');
      console.log(`   Response: ${response.statusCode}`);
      return true;
    } else {
      console.log(`   Status: ⚠️  Unexpected response: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`   Status: ❌ Request failed`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function main() {
  const results = {
    backendHealth: false,
    backendCORS: false,
    frontend: false,
    loginEndpoint: false
  };
  
  results.backendHealth = await checkBackendHealth();
  results.backendCORS = await checkBackendCORS();
  results.frontend = await checkFrontend();
  results.loginEndpoint = await testLoginEndpoint();
  
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    📊 VERIFICATION RESULTS                     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  console.log(`Backend Health:     ${results.backendHealth ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Backend CORS:       ${results.backendCORS ? '✅ PASS' : '⚠️  CHECK'}`);
  console.log(`Frontend:           ${results.frontend ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Login Endpoint:     ${results.loginEndpoint ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    console.log('\n🎉 All checks passed! Your deployment should be working.');
  } else {
    console.log('\n⚠️  Some checks failed. Please review the issues above.');
    console.log('\n📖 Next Steps:');
    
    if (!results.backendHealth) {
      console.log('   1. Check Render dashboard for backend errors');
      console.log('   2. Verify backend environment variables are set');
    }
    
    if (!results.backendCORS) {
      console.log('   3. Set FRONTEND_URL in Render to: ' + FRONTEND_URL);
    }
    
    if (!results.frontend) {
      console.log('   4. Check Vercel dashboard for frontend errors');
    }
    
    if (!results.loginEndpoint) {
      console.log('   5. Verify login route is properly configured in backend');
    }
    
    console.log('\n📚 See API_405_ERROR_FIX.md for detailed instructions');
  }
  
  console.log('\n════════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);

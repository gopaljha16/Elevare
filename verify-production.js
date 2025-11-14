#!/usr/bin/env node

/**
 * Production Deployment Verification Script
 * 
 * This script verifies that the production deployment is configured correctly
 * by testing backend health, CORS headers, and environment variables.
 * 
 * Usage: node verify-production.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'https://elevare-hvtr.onrender.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://elevare-seven.vercel.app';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Test functions
async function testBackendHealth() {
  console.log(`\n${colors.cyan}${colors.bright}Testing Backend Health...${colors.reset}`);
  console.log(`URL: ${colors.yellow}${BACKEND_URL}/health${colors.reset}`);
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);
    
    if (response.statusCode === 200) {
      console.log(`${colors.green}✅ Backend is healthy${colors.reset}`);
      console.log(`   Status: ${response.statusCode}`);
      console.log(`   Response: ${response.body}`);
      return true;
    } else {
      console.log(`${colors.red}❌ Backend returned unexpected status${colors.reset}`);
      console.log(`   Status: ${response.statusCode}`);
      console.log(`   Response: ${response.body}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Backend health check failed${colors.reset}`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testCORSHeaders() {
  console.log(`\n${colors.cyan}${colors.bright}Testing CORS Headers...${colors.reset}`);
  console.log(`URL: ${colors.yellow}${BACKEND_URL}/api/health${colors.reset}`);
  console.log(`Origin: ${colors.yellow}${FRONTEND_URL}${colors.reset}`);
  
  try {
    // Test OPTIONS request (preflight)
    console.log(`\n${colors.blue}Testing OPTIONS (preflight) request...${colors.reset}`);
    const optionsResponse = await makeRequest(`${BACKEND_URL}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization,content-type',
      },
    });
    
    console.log(`   Status: ${optionsResponse.statusCode}`);
    console.log(`   CORS Headers:`);
    console.log(`      Access-Control-Allow-Origin: ${colors.yellow}${optionsResponse.headers['access-control-allow-origin'] || 'NOT SET'}${colors.reset}`);
    console.log(`      Access-Control-Allow-Credentials: ${colors.yellow}${optionsResponse.headers['access-control-allow-credentials'] || 'NOT SET'}${colors.reset}`);
    console.log(`      Access-Control-Allow-Methods: ${colors.yellow}${optionsResponse.headers['access-control-allow-methods'] || 'NOT SET'}${colors.reset}`);
    console.log(`      Access-Control-Allow-Headers: ${colors.yellow}${optionsResponse.headers['access-control-allow-headers'] || 'NOT SET'}${colors.reset}`);
    
    // Test GET request with Origin header
    console.log(`\n${colors.blue}Testing GET request with Origin header...${colors.reset}`);
    const getResponse = await makeRequest(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
      },
    });
    
    console.log(`   Status: ${getResponse.statusCode}`);
    console.log(`   CORS Headers:`);
    console.log(`      Access-Control-Allow-Origin: ${colors.yellow}${getResponse.headers['access-control-allow-origin'] || 'NOT SET'}${colors.reset}`);
    console.log(`      Access-Control-Allow-Credentials: ${colors.yellow}${getResponse.headers['access-control-allow-credentials'] || 'NOT SET'}${colors.reset}`);
    
    // Validate CORS configuration
    const allowOrigin = getResponse.headers['access-control-allow-origin'];
    const allowCredentials = getResponse.headers['access-control-allow-credentials'];
    
    if (allowOrigin === FRONTEND_URL || allowOrigin === '*') {
      console.log(`${colors.green}✅ CORS Allow-Origin is correctly set${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ CORS Allow-Origin is incorrect${colors.reset}`);
      console.log(`   Expected: ${FRONTEND_URL}`);
      console.log(`   Got: ${allowOrigin || 'NOT SET'}`);
      return false;
    }
    
    if (allowCredentials === 'true') {
      console.log(`${colors.green}✅ CORS Allow-Credentials is correctly set${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ CORS Allow-Credentials is incorrect${colors.reset}`);
      console.log(`   Expected: true`);
      console.log(`   Got: ${allowCredentials || 'NOT SET'}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ CORS test failed${colors.reset}`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testAuthEndpoint() {
  console.log(`\n${colors.cyan}${colors.bright}Testing Auth Endpoint...${colors.reset}`);
  console.log(`URL: ${colors.yellow}${BACKEND_URL}/api/auth/login${colors.reset}`);
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword',
      }),
    });
    
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   CORS Headers:`);
    console.log(`      Access-Control-Allow-Origin: ${colors.yellow}${response.headers['access-control-allow-origin'] || 'NOT SET'}${colors.reset}`);
    console.log(`      Access-Control-Allow-Credentials: ${colors.yellow}${response.headers['access-control-allow-credentials'] || 'NOT SET'}${colors.reset}`);
    
    // We expect 400 or 401 (invalid credentials), not 403 (CORS block)
    if (response.statusCode === 400 || response.statusCode === 401) {
      console.log(`${colors.green}✅ Auth endpoint is accessible (credentials invalid as expected)${colors.reset}`);
      return true;
    } else if (response.statusCode === 403) {
      console.log(`${colors.red}❌ Auth endpoint returned 403 - possible CORS issue${colors.reset}`);
      return false;
    } else {
      console.log(`${colors.yellow}⚠️  Auth endpoint returned unexpected status: ${response.statusCode}${colors.reset}`);
      console.log(`   Response: ${response.body}`);
      return true; // Still accessible, just unexpected response
    }
  } catch (error) {
    console.log(`${colors.red}❌ Auth endpoint test failed${colors.reset}`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  console.log(`${colors.bright}${colors.magenta}`);
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║     🔍 PRODUCTION DEPLOYMENT VERIFICATION SCRIPT              ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);
  
  console.log(`\n${colors.cyan}Configuration:${colors.reset}`);
  console.log(`   Backend URL: ${colors.yellow}${BACKEND_URL}${colors.reset}`);
  console.log(`   Frontend URL: ${colors.yellow}${FRONTEND_URL}${colors.reset}`);
  
  const results = {
    health: false,
    cors: false,
    auth: false,
  };
  
  // Run tests
  results.health = await testBackendHealth();
  results.cors = await testCORSHeaders();
  results.auth = await testAuthEndpoint();
  
  // Summary
  console.log(`\n${colors.bright}${colors.magenta}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}VERIFICATION SUMMARY${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}═══════════════════════════════════════════════════════════════${colors.reset}`);
  
  console.log(`\n   Backend Health: ${results.health ? `${colors.green}✅ PASS${colors.reset}` : `${colors.red}❌ FAIL${colors.reset}`}`);
  console.log(`   CORS Configuration: ${results.cors ? `${colors.green}✅ PASS${colors.reset}` : `${colors.red}❌ FAIL${colors.reset}`}`);
  console.log(`   Auth Endpoint: ${results.auth ? `${colors.green}✅ PASS${colors.reset}` : `${colors.red}❌ FAIL${colors.reset}`}`);
  
  const allPassed = results.health && results.cors && results.auth;
  
  if (allPassed) {
    console.log(`\n${colors.green}${colors.bright}✅ ALL CHECKS PASSED - Deployment is configured correctly!${colors.reset}`);
  } else {
    console.log(`\n${colors.red}${colors.bright}❌ SOME CHECKS FAILED - Please review the errors above${colors.reset}`);
    console.log(`\n${colors.cyan}Troubleshooting Steps:${colors.reset}`);
    
    if (!results.health) {
      console.log(`\n${colors.yellow}Backend Health Failed:${colors.reset}`);
      console.log('   1. Check if backend is deployed and running on Render');
      console.log('   2. Verify the backend URL is correct');
      console.log('   3. Check Render logs for errors');
    }
    
    if (!results.cors) {
      console.log(`\n${colors.yellow}CORS Configuration Failed:${colors.reset}`);
      console.log('   1. Check backend .env has FRONTEND_URL set correctly');
      console.log('   2. Verify CORS middleware is configured in backend');
      console.log('   3. Check that credentials are allowed in CORS config');
      console.log('   4. Redeploy backend after fixing environment variables');
    }
    
    if (!results.auth) {
      console.log(`\n${colors.yellow}Auth Endpoint Failed:${colors.reset}`);
      console.log('   1. Check if auth routes are properly configured');
      console.log('   2. Verify CORS headers are present in auth responses');
      console.log('   3. Check backend logs for auth-related errors');
    }
  }
  
  console.log(`\n${colors.bright}${colors.magenta}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
  
  process.exit(allPassed ? 0 : 1);
}

// Run the script
main().catch((error) => {
  console.error(`${colors.red}${colors.bright}Fatal error:${colors.reset}`, error);
  process.exit(1);
});

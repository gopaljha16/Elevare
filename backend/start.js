#!/usr/bin/env node

/**
 * Production startup script with better error handling
 */

// Validate critical environment variables before starting
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GEMINI_API_KEYS'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease set these variables in your Render dashboard.');
  console.error('Go to: Dashboard > Service > Environment');
  process.exit(1);
}

// Validate optional but recommended variables
const recommendedVars = [
  'FRONTEND_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

const missingRecommended = recommendedVars.filter(varName => !process.env[varName]);

if (missingRecommended.length > 0) {
  console.warn('⚠️  Missing recommended environment variables:');
  missingRecommended.forEach(varName => {
    console.warn(`   - ${varName}`);
  });
  console.warn('Some features may not work correctly.\n');
}

// Start the application
console.log('✅ Environment validation passed');
console.log('🚀 Starting application...\n');

try {
  require('./src/index.js');
} catch (error) {
  console.error('❌ Failed to start application:', error.message);
  console.error(error.stack);
  process.exit(1);
}

#!/usr/bin/env node

/**
 * Simple health check script for deployment verification
 * Usage: node healthcheck.js [url]
 */

const https = require('https');
const http = require('http');

const url = process.argv[2] || 'http://localhost:5000/health';

console.log(`🔍 Checking health of: ${url}\n`);

const client = url.startsWith('https') ? https : http;

client.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      console.log('✅ Service is healthy!\n');
      try {
        const parsed = JSON.parse(data);
        console.log('Response:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Response:', data);
      }
      process.exit(0);
    } else {
      console.log('❌ Service is unhealthy');
      console.log('Response:', data);
      process.exit(1);
    }
  });

}).on('error', (err) => {
  console.error('❌ Health check failed:', err.message);
  process.exit(1);
});

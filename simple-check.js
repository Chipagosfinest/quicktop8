#!/usr/bin/env node

const axios = require('axios');

const APP_URL = 'https://quicktop8-cp6gdzsz7-chipagosfinests-projects.vercel.app';

async function checkHealth() {
  console.log('🔍 Checking app health...');
  try {
    const response = await axios.get(`${APP_URL}/api/health`);
    console.log('✅ App is healthy');
    console.log(`   Status: ${response.data.status}`);
    console.log(`   Neynar configured: ${response.data.neynarConfigured}`);
    console.log(`   Cache hit rate: ${response.data.performance.cacheHitRate}%`);
    console.log(`   Average response time: ${response.data.performance.averageResponseTime}ms`);
    return true;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
}

async function checkUserData() {
  console.log('\n🔍 Checking user data endpoint...');
  try {
    const response = await axios.get(`${APP_URL}/api/user?fid=4044`);
    if (response.data.test === false) {
      console.log('✅ User data endpoint working');
      console.log(`   Username: ${response.data.username}`);
      console.log(`   Test flag: ${response.data.test}`);
      console.log(`   Has real data: ${response.data.hasRealData}`);
      return true;
    } else {
      console.log('❌ Still showing test data');
      return false;
    }
  } catch (error) {
    console.log('❌ User data endpoint failed:', error.message);
    return false;
  }
}

async function checkRateLimits() {
  console.log('\n🔍 Checking rate limits...');
  try {
    const response = await axios.get(`${APP_URL}/api/health`);
    const rateLimits = response.data.rateLimits;
    
    console.log('✅ Rate limits status:');
    console.log(`   Global: ${rateLimits.global.current}/${rateLimits.global.limit} RPM`);
    
    const endpoints = Object.keys(rateLimits.endpoints);
    endpoints.forEach(endpoint => {
      const limit = rateLimits.endpoints[endpoint];
      console.log(`   ${endpoint}: ${limit.current}/${limit.limit} RPM`);
    });
    
    return true;
  } catch (error) {
    console.log('❌ Rate limits check failed:', error.message);
    return false;
  }
}

async function runSimpleChecks() {
  console.log('🚀 QuickTop8 Simplified App Check\n');
  console.log('=' .repeat(50));
  
  const checks = [
    { name: 'App Health', fn: checkHealth },
    { name: 'User Data', fn: checkUserData },
    { name: 'Rate Limits', fn: checkRateLimits }
  ];
  
  const results = [];
  
  for (const check of checks) {
    const result = await check.fn();
    results.push({ name: check.name, passed: result });
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 SUMMARY:');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
  });
  
  console.log(`\nOverall: ${passed}/${total} checks passed`);
  
  if (passed === total) {
    console.log('\n🎉 All systems operational! Simplified app is working.');
  } else {
    console.log('\n⚠️  Some issues detected. Review failed checks above.');
  }
  
  return passed === total;
}

// Run the checks
runSimpleChecks()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Script error:', error);
    process.exit(1);
  }); 
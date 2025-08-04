#!/usr/bin/env node

const axios = require('axios');

const BACKEND_URL = 'https://quicktop8-k5zoc4rsj-chipagosfinests-projects.vercel.app';
const FRONTEND_URL = 'https://quicktop8-507vsjtn6-chipagosfinests-projects.vercel.app';

async function checkBackendHealth() {
  console.log('🔍 Checking backend health...');
  try {
    const response = await axios.get(`${BACKEND_URL}/health`);
    console.log('✅ Backend is healthy');
    console.log(`   Status: ${response.data.status}`);
    console.log(`   Neynar configured: ${response.data.neynarConfigured}`);
    console.log(`   Cache hit rate: ${response.data.performance.cacheHitRate}%`);
    console.log(`   Average response time: ${response.data.performance.averageResponseTime}ms`);
    return true;
  } catch (error) {
    console.log('❌ Backend health check failed:', error.message);
    return false;
  }
}

async function checkUserData() {
  console.log('\n🔍 Checking user data endpoint...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/user/4044`);
    const user = response.data.data?.users?.[0];
    if (user) {
      console.log('✅ User data endpoint working');
      console.log(`   Username: ${user.username}`);
      console.log(`   Display name: ${user.display_name}`);
      console.log(`   Followers: ${user.follower_count}`);
      return true;
    } else {
      console.log('❌ No user data found');
      return false;
    }
  } catch (error) {
    console.log('❌ User data endpoint failed:', error.message);
    return false;
  }
}

async function checkTopInteractions() {
  console.log('\n🔍 Checking top interactions endpoint...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/user/4044/top-interactions`);
    const interactions = response.data.data?.topInteractions;
    if (interactions && interactions.length > 0) {
      console.log('✅ Top interactions endpoint working');
      console.log(`   Found ${interactions.length} top interactions`);
      console.log(`   First interaction: ${interactions[0].username}`);
      return true;
    } else {
      console.log('❌ No top interactions found');
      return false;
    }
  } catch (error) {
    console.log('❌ Top interactions endpoint failed:', error.message);
    return false;
  }
}

async function checkFrontendAPI() {
  console.log('\n🔍 Checking frontend API route...');
  try {
    const response = await axios.get(`${FRONTEND_URL}/api/user?fid=4044`);
    if (response.data.test === false) {
      console.log('✅ Frontend API returning real data');
      console.log(`   Username: ${response.data.username}`);
      console.log(`   Test flag: ${response.data.test}`);
      console.log(`   Has real data: ${response.data.hasRealData}`);
      return true;
    } else {
      console.log('❌ Frontend still showing test data');
      return false;
    }
  } catch (error) {
    console.log('❌ Frontend API check failed:', error.message);
    return false;
  }
}

async function checkRateLimits() {
  console.log('\n🔍 Checking rate limits...');
  try {
    const response = await axios.get(`${BACKEND_URL}/health`);
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

async function runCleanupChecks() {
  console.log('🚀 QuickTop8 Production Cleanup & Check\n');
  console.log('=' .repeat(50));
  
  const checks = [
    { name: 'Backend Health', fn: checkBackendHealth },
    { name: 'User Data', fn: checkUserData },
    { name: 'Top Interactions', fn: checkTopInteractions },
    { name: 'Frontend API', fn: checkFrontendAPI },
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
    console.log('\n🎉 All systems operational! Production ready.');
  } else {
    console.log('\n⚠️  Some issues detected. Review failed checks above.');
  }
  
  return passed === total;
}

// Run the cleanup checks
runCleanupChecks()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Script error:', error);
    process.exit(1);
  }); 
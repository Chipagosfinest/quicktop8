#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = process.env.TEST_URL || 'http://localhost:4000';
const TEST_FID = 4044; // alec.eth

console.log('🧪 QuickTop8 API Test Suite\n');

async function testEndpoint(endpoint, description) {
  try {
    console.log(`Testing: ${description}`);
    const response = await axios.get(`${BASE_URL}${endpoint}`);
    
    if (response.status === 200) {
      console.log(`✅ ${description} - Status: ${response.status}`);
      return true;
    } else {
      console.log(`❌ ${description} - Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description} - Error: ${error.message}`);
    return false;
  }
}

async function testUserEndpoint(fid, description) {
  try {
    console.log(`Testing: ${description}`);
    const response = await axios.get(`${BASE_URL}/api/user/${fid}`);
    
    if (response.status === 200 && response.data.success) {
      console.log(`✅ ${description} - Status: ${response.status}`);
      if (response.data.data && response.data.data.users) {
        console.log(`   📊 Found ${response.data.data.users.length} user(s)`);
      }
      return true;
    } else {
      console.log(`❌ ${description} - Status: ${response.status}`);
      if (response.data.error) {
        console.log(`   Error: ${response.data.error}`);
      }
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description} - Error: ${error.message}`);
    return false;
  }
}

async function testTopInteractions(fid, description) {
  try {
    console.log(`Testing: ${description}`);
    const response = await axios.get(`${BASE_URL}/api/user/${fid}/top-interactions?limit=8&filter_spam=true`);
    
    if (response.status === 200 && response.data.success) {
      console.log(`✅ ${description} - Status: ${response.status}`);
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`   📊 Found ${response.data.data.length} top interactions`);
      }
      return true;
    } else {
      console.log(`❌ ${description} - Status: ${response.status}`);
      if (response.data.error) {
        console.log(`   Error: ${response.data.error}`);
      }
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description} - Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log(`🌐 Testing against: ${BASE_URL}\n`);
  
  const tests = [
    () => testEndpoint('/health', 'Health Check'),
    () => testEndpoint('/api/indexer/stats', 'Indexer Stats'),
    () => testUserEndpoint(TEST_FID, `User Data (FID: ${TEST_FID})`),
    () => testTopInteractions(TEST_FID, `Top Interactions (FID: ${TEST_FID})`),
    () => testEndpoint('/api/users/bulk?fids=4044,194', 'Bulk Users'),
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const result = await test();
    if (result) passed++;
    console.log(''); // Add spacing between tests
  }
  
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.');
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests }; 
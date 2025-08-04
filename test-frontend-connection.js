const axios = require('axios');

async function testFrontendConnection() {
  console.log('🔍 Testing Frontend-Backend Connection\n');
  
  const tests = [
    {
      name: 'Backend Health Check',
      url: 'http://localhost:4000/health',
      method: 'GET'
    },
    {
      name: 'User Data API',
      url: 'http://localhost:4000/api/user/4044',
      method: 'GET'
    },
    {
      name: 'Top Interactions API',
      url: 'http://localhost:4000/api/user/4044/top-interactions?limit=8',
      method: 'GET'
    },
    {
      name: 'Frontend API (via Next.js)',
      url: 'http://localhost:3000/api/user?fid=4044',
      method: 'GET'
    }
  ];
  
  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      const startTime = Date.now();
      
      const response = await axios({
        method: test.method,
        url: test.url,
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const duration = Date.now() - startTime;
      
      console.log(`✅ ${test.name} - ${response.status} (${duration}ms)`);
      
      if (test.name.includes('User Data') || test.name.includes('Top Interactions')) {
        console.log(`   Data received: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ ${test.name} - ${error.response?.status || 'Network Error'} (${duration}ms)`);
      console.log(`   Error: ${error.message}`);
      
      if (error.response?.data) {
        console.log(`   Details: ${JSON.stringify(error.response.data)}`);
      }
    }
    
    console.log('');
  }
  
  console.log('🎯 Connection Test Summary:');
  console.log('- Backend should be running on port 4000');
  console.log('- Frontend should be running on port 3000');
  console.log('- Check CORS configuration if frontend tests fail');
  console.log('- Verify environment variables are set correctly');
}

// Run the test
testFrontendConnection().catch(console.error); 
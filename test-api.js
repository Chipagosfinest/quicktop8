const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testAPI() {
  console.log('🧪 Testing QuickTop8 Backend API\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', health.data);
    console.log('');

    // Test user search
    console.log('2. Testing user search...');
    const search = await axios.get(`${BASE_URL}/api/search/users?q=dwr&limit=3`);
    console.log(`✅ Found ${search.data.result.users.length} users matching "dwr"`);
    search.data.result.users.forEach(user => {
      console.log(`   - ${user.display_name} (@${user.username}) - ${user.follower_count} followers`);
    });
    console.log('');

    // Test trending casts
    console.log('3. Testing trending casts...');
    const trending = await axios.get(`${BASE_URL}/api/trending/casts?limit=2`);
    console.log(`✅ Found ${trending.data.casts.length} trending casts`);
    trending.data.casts.forEach(cast => {
      console.log(`   - ${cast.author.display_name}: "${cast.text.substring(0, 50)}..."`);
    });
    console.log('');

    // Test user info (using Dan Romero's FID)
    console.log('4. Testing user info...');
    const user = await axios.get(`${BASE_URL}/api/user/3`);
    console.log(`✅ User info: ${user.data.result.user.display_name} (@${user.data.result.user.username})`);
    console.log(`   Followers: ${user.data.result.user.follower_count}, Following: ${user.data.result.user.following_count}`);
    console.log('');

    // Test user followers
    console.log('5. Testing user followers...');
    const followers = await axios.get(`${BASE_URL}/api/user/3/followers?limit=3`);
    console.log(`✅ Found ${followers.data.result.users.length} followers`);
    followers.data.result.users.forEach(follower => {
      console.log(`   - ${follower.display_name} (@${follower.username})`);
    });
    console.log('');

    console.log('🎉 All API tests passed!');
    console.log('\n📊 API Endpoints Summary:');
    console.log('   - GET /health - Server health check');
    console.log('   - GET /api/search/users?q=query - Search users');
    console.log('   - GET /api/trending/casts - Get trending casts');
    console.log('   - GET /api/user/:fid - Get user info');
    console.log('   - GET /api/user/:fid/followers - Get user followers');
    console.log('   - GET /api/user/:fid/following - Get user following');
    console.log('   - GET /api/user/:fid/casts - Get user casts');
    console.log('   - GET /api/cast/:hash - Get cast by hash');
    console.log('   - GET /api/cast/:hash/reactions - Get cast reactions');

  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

testAPI(); 
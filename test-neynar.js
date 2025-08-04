const fetch = require('node-fetch');

async function testNeynarAPI() {
  const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
  const fid = 4044; // alec.eth's FID
  
  console.log('🔍 Testing Neynar API calls...');
  console.log('API Key present:', !!NEYNAR_API_KEY);
  
  if (!NEYNAR_API_KEY) {
    console.log('❌ No Neynar API key found');
    return;
  }
  
  // Test 1: User info
  console.log('\n📊 Test 1: User Info');
  try {
    const userResponse = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    });
    
    console.log('Status:', userResponse.status);
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ User data fetched successfully');
      console.log('User:', userData.users?.[0]?.display_name);
    } else {
      const errorText = await userResponse.text();
      console.log('❌ User API failed:', errorText);
    }
  } catch (error) {
    console.log('❌ User API error:', error.message);
  }
  
  // Test 2: Followers
  console.log('\n👥 Test 2: Followers');
  try {
    const followersResponse = await fetch(`https://api.neynar.com/v2/farcaster/user/followers?fid=${fid}&limit=10`, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    });
    
    console.log('Status:', followersResponse.status);
    if (followersResponse.ok) {
      const followersData = await followersResponse.json();
      console.log('✅ Followers fetched successfully');
      console.log('Followers count:', followersData.users?.length || 0);
      if (followersData.users?.length > 0) {
        console.log('First follower:', followersData.users[0].username);
      }
    } else {
      const errorText = await followersResponse.text();
      console.log('❌ Followers API failed:', errorText);
    }
  } catch (error) {
    console.log('❌ Followers API error:', error.message);
  }
  
  // Test 3: Popular casts
  console.log('\n📝 Test 3: Popular Casts');
  try {
    const popularCastsResponse = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/popular/?fid=${fid}&viewer_fid=${fid}`, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    });
    
    console.log('Status:', popularCastsResponse.status);
    if (popularCastsResponse.ok) {
      const popularCastsData = await popularCastsResponse.json();
      console.log('✅ Popular casts fetched successfully');
      console.log('Casts count:', popularCastsData.casts?.length || 0);
    } else {
      const errorText = await popularCastsResponse.text();
      console.log('❌ Popular casts API failed:', errorText);
    }
  } catch (error) {
    console.log('❌ Popular casts API error:', error.message);
  }
}

testNeynarAPI(); 
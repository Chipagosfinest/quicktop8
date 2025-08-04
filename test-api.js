const NEYNAR_API_KEY = "1E58A226-A64C-4CF3-A047-FBED94F36101"

async function testAPI() {
  console.log('Testing Neynar API...')
  
  // Test 1: Try to get user info for a known FID (Dwr, FID 194)
  try {
    console.log('\n1. Testing user info endpoint...')
    const userResponse = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=194`, {
      headers: {
        'x-api-key': NEYNAR_API_KEY,
        'accept': 'application/json'
      }
    })
    
    if (userResponse.ok) {
      const userData = await userResponse.json()
      console.log('✅ User info endpoint works:', userData.users?.length || 0, 'users found')
    } else {
      console.log('❌ User info endpoint failed:', userResponse.status, userResponse.statusText)
    }
  } catch (error) {
    console.log('❌ User info endpoint error:', error.message)
  }

  // Test 2: Try to get casts for FID 194
  try {
    console.log('\n2. Testing user casts endpoint...')
    const castsResponse = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/casts?fid=194&limit=5`, {
      headers: {
        'x-api-key': NEYNAR_API_KEY,
        'accept': 'application/json'
      }
    })
    
    if (castsResponse.ok) {
      const castsData = await castsResponse.json()
      console.log('✅ User casts endpoint works:', castsData.casts?.length || 0, 'casts found')
    } else {
      const errorText = await castsResponse.text()
      console.log('❌ User casts endpoint failed:', castsResponse.status, castsResponse.statusText)
      console.log('Error details:', errorText)
    }
  } catch (error) {
    console.log('❌ User casts endpoint error:', error.message)
  }

  // Test 3: Try popular casts endpoint
  try {
    console.log('\n3. Testing popular casts endpoint...')
    const popularResponse = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/popular?fid=194`, {
      headers: {
        'x-api-key': NEYNAR_API_KEY,
        'accept': 'application/json'
      }
    })
    
    if (popularResponse.ok) {
      const popularData = await popularResponse.json()
      console.log('✅ Popular casts endpoint works:', popularData.casts?.length || 0, 'casts found')
    } else {
      const errorText = await popularResponse.text()
      console.log('❌ Popular casts endpoint failed:', popularResponse.status, popularResponse.statusText)
      console.log('Error details:', errorText)
    }
  } catch (error) {
    console.log('❌ Popular casts endpoint error:', error.message)
  }
}

testAPI() 
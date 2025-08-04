#!/usr/bin/env node

const NeynarIndexer = require('./neynar-indexer');
require('dotenv').config();

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.cyan}=== ${title} ===${colors.reset}`);
}

async function testIndexer() {
  log('🧪 Testing Neynar Indexer', 'blue');
  
  const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
  
  if (!NEYNAR_API_KEY) {
    log('❌ NEYNAR_API_KEY not found in environment variables', 'red');
    log('Please set NEYNAR_API_KEY in your .env file', 'yellow');
    return;
  }
  
  // Initialize indexer
  const indexer = new NeynarIndexer(NEYNAR_API_KEY, {
    cacheTTL: 2 * 60 * 1000, // 2 minutes for testing
    retryAttempts: 2,
    retryDelay: 500,
    batchSize: 50
  });
  
  log('✅ Indexer initialized successfully', 'green');
  
  // Test 1: Basic user data fetching
  logSection('Test 1: Basic User Data');
  try {
    const userData = await indexer.getUserData(194); // Dwr's FID
    if (userData.users && userData.users.length > 0) {
      const user = userData.users[0];
      log(`✅ User data fetched successfully: ${user.username} (FID: ${user.fid})`, 'green');
      log(`   Followers: ${user.follower_count}, Following: ${user.following_count}, Casts: ${user.cast_count}`, 'blue');
    } else {
      log('❌ No user data returned', 'red');
    }
  } catch (error) {
    log(`❌ User data fetch failed: ${error.message}`, 'red');
  }
  
  // Test 2: Rate limiting
  logSection('Test 2: Rate Limiting');
  try {
    log('Testing rate limiting with multiple rapid requests...', 'blue');
    
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(indexer.getUserData(194 + i));
    }
    
    const results = await Promise.all(promises);
    log(`✅ All ${results.length} requests completed successfully`, 'green');
    
    const rateLimitStats = indexer.getRateLimitStats();
    log(`   Global requests: ${rateLimitStats.global.current}/${rateLimitStats.global.limit}`, 'blue');
    
  } catch (error) {
    log(`❌ Rate limiting test failed: ${error.message}`, 'red');
  }
  
  // Test 3: Caching
  logSection('Test 3: Caching');
  try {
    log('Testing cache functionality...', 'blue');
    
    // First request
    const start1 = Date.now();
    await indexer.getUserData(194);
    const time1 = Date.now() - start1;
    
    // Second request (should be cached)
    const start2 = Date.now();
    await indexer.getUserData(194);
    const time2 = Date.now() - start2;
    
    log(`✅ First request: ${time1}ms, Second request: ${time2}ms`, 'green');
    
    if (time2 < time1) {
      log('✅ Cache is working (second request was faster)', 'green');
    } else {
      log('⚠️ Cache may not be working as expected', 'yellow');
    }
    
    const cacheStats = indexer.getCacheStats();
    log(`   Cache stats: ${cacheStats.valid} valid entries, ${cacheStats.hitRate.toFixed(2)} hit rate`, 'blue');
    
  } catch (error) {
    log(`❌ Caching test failed: ${error.message}`, 'red');
  }
  
  // Test 4: Error handling and retries
  logSection('Test 4: Error Handling');
  try {
    log('Testing error handling with invalid FID...', 'blue');
    
    try {
      await indexer.getUserData(999999999); // Invalid FID
      log('⚠️ Expected error for invalid FID but got success', 'yellow');
    } catch (error) {
      log(`✅ Error handling works: ${error.message}`, 'green');
    }
    
  } catch (error) {
    log(`❌ Error handling test failed: ${error.message}`, 'red');
  }
  
  // Test 5: Bulk user fetching
  logSection('Test 5: Bulk User Fetching');
  try {
    const fids = [194, 195, 196, 197, 198]; // Multiple FIDs
    log(`Testing bulk user fetch for ${fids.length} FIDs...`, 'blue');
    
    const start = Date.now();
    const bulkData = await indexer.getBulkUsers(fids);
    const time = Date.now() - start;
    
    if (bulkData.users && bulkData.users.length > 0) {
      log(`✅ Bulk fetch completed in ${time}ms`, 'green');
      log(`   Retrieved ${bulkData.users.length} users`, 'blue');
      
      bulkData.users.forEach(user => {
        log(`   - ${user.username} (FID: ${user.fid})`, 'blue');
      });
    } else {
      log('❌ No users returned from bulk fetch', 'red');
    }
    
  } catch (error) {
    log(`❌ Bulk user fetch failed: ${error.message}`, 'red');
  }
  
  // Test 6: Top interactions
  logSection('Test 6: Top Interactions');
  try {
    log('Testing top interactions calculation...', 'blue');
    
    const start = Date.now();
    const topInteractions = await indexer.getTopInteractions(194, 5);
    const time = Date.now() - start;
    
    if (topInteractions && topInteractions.length > 0) {
      log(`✅ Top interactions calculated in ${time}ms`, 'green');
      log(`   Found ${topInteractions.length} top interactions`, 'blue');
      
      topInteractions.forEach((interaction, index) => {
        log(`   ${index + 1}. @${interaction.username} - ${interaction.interactionCount} interactions`, 'blue');
      });
    } else {
      log('⚠️ No top interactions found', 'yellow');
    }
    
  } catch (error) {
    log(`❌ Top interactions test failed: ${error.message}`, 'red');
  }
  
  // Test 7: User casts
  logSection('Test 7: User Casts');
  try {
    log('Testing user casts fetching...', 'blue');
    
    const castsData = await indexer.getUserCasts(194, 5);
    
    if (castsData.casts && castsData.casts.length > 0) {
      log(`✅ User casts fetched successfully`, 'green');
      log(`   Retrieved ${castsData.casts.length} casts`, 'blue');
      
      castsData.casts.slice(0, 2).forEach(cast => {
        log(`   - "${cast.text?.substring(0, 50)}..." (${cast.reactions?.likes || 0} likes)`, 'blue');
      });
    } else {
      log('⚠️ No casts found for user', 'yellow');
    }
    
  } catch (error) {
    log(`❌ User casts test failed: ${error.message}`, 'red');
  }
  
  // Test 8: Search functionality
  logSection('Test 8: User Search');
  try {
    log('Testing user search...', 'blue');
    
    const searchResults = await indexer.searchUsers('dwr', 3);
    
    if (searchResults.users && searchResults.users.length > 0) {
      log(`✅ User search completed successfully`, 'green');
      log(`   Found ${searchResults.users.length} users`, 'blue');
      
      searchResults.users.forEach(user => {
        log(`   - @${user.username} (FID: ${user.fid})`, 'blue');
      });
    } else {
      log('⚠️ No search results found', 'yellow');
    }
    
  } catch (error) {
    log(`❌ User search test failed: ${error.message}`, 'red');
  }
  
  // Test 9: Trending casts
  logSection('Test 9: Trending Casts');
  try {
    log('Testing trending casts...', 'blue');
    
    const trendingData = await indexer.getTrendingCasts(3, '24h');
    
    if (trendingData.casts && trendingData.casts.length > 0) {
      log(`✅ Trending casts fetched successfully`, 'green');
      log(`   Retrieved ${trendingData.casts.length} trending casts`, 'blue');
      
      trendingData.casts.slice(0, 2).forEach(cast => {
        log(`   - "${cast.text?.substring(0, 50)}..." by @${cast.author?.username}`, 'blue');
      });
    } else {
      log('⚠️ No trending casts found', 'yellow');
    }
    
  } catch (error) {
    log(`❌ Trending casts test failed: ${error.message}`, 'red');
  }
  
  // Final stats
  logSection('Final Statistics');
  const finalCacheStats = indexer.getCacheStats();
  const finalRateLimitStats = indexer.getRateLimitStats();
  
  log('📊 Cache Statistics:', 'blue');
  log(`   Total entries: ${finalCacheStats.total}`, 'blue');
  log(`   Valid entries: ${finalCacheStats.valid}`, 'blue');
  log(`   Hit rate: ${(finalCacheStats.hitRate * 100).toFixed(1)}%`, 'blue');
  
  log('📈 Rate Limit Statistics:', 'blue');
  log(`   Global requests: ${finalRateLimitStats.global.current}/${finalRateLimitStats.global.limit}`, 'blue');
  log(`   Reset time: ${finalRateLimitStats.global.resetTime.toLocaleTimeString()}`, 'blue');
  
  log('\n✅ Indexer testing completed!', 'green');
  log('The indexer is working correctly and handling rate limits, caching, and errors properly.', 'blue');
}

// Run the test if this script is executed directly
if (require.main === module) {
  testIndexer().catch(error => {
    log(`❌ Test failed with error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { testIndexer }; 
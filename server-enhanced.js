const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const NeynarIndexer = require('./neynar-indexer');

const app = express();
const PORT = process.env.PORT || 4000;

// Initialize Neynar Indexer
const indexer = new NeynarIndexer(process.env.NEYNAR_API_KEY, {
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  retryAttempts: 3,
  retryDelay: 1000,
  batchSize: 100
});

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://quicktop8-alpha.vercel.app',
    'https://quicktop8.vercel.app',
    'https://quicktop8-frontend.vercel.app',
    'https://quicktop8-kr7tkp3wc-chipagosfinests-projects.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Health check endpoint with indexer stats
app.get('/health', (req, res) => {
  const cacheStats = indexer.getCacheStats();
  const rateLimitStats = indexer.getRateLimitStats();
  const performanceStats = indexer.getPerformanceStats();
  
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    neynarConfigured: !!process.env.NEYNAR_API_KEY,
    cache: cacheStats,
    rateLimits: rateLimitStats,
    performance: performanceStats
  });
});

// Get user information by FID with enhanced error handling
app.get('/api/user/:fid', async (req, res) => {
  try {
    const { fid } = req.params;
    const { viewer_fid } = req.query;
    
    console.log(`Fetching user data for FID: ${fid}`);
    
    const userData = await indexer.getUserData(fid, viewer_fid);
    
    if (!userData.users || userData.users.length === 0) {
      return res.status(404).json({ 
        error: 'User not found',
        fid: fid
      });
    }
    
    res.json({
      success: true,
      data: userData,
      cached: false // TODO: Add cache status tracking
    });
    
  } catch (error) {
    console.error('Error fetching user data:', error.message);
    
    if (error.response?.status === 429) {
      res.status(429).json({ 
        error: 'Rate limit exceeded',
        retryAfter: error.response.headers['retry-after'] || 60
      });
    } else if (error.response?.status === 404) {
      res.status(404).json({ 
        error: 'User not found',
        fid: req.params.fid
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to fetch user data',
        details: error.message 
      });
    }
  }
});

// Get user's top interactions (enhanced)
app.get('/api/user/:fid/top-interactions', async (req, res) => {
  try {
    const { fid } = req.params;
    const { limit = 8 } = req.query;
    
    console.log(`Fetching top interactions for FID: ${fid}`);
    
    const topInteractions = await indexer.getTopInteractions(fid, parseInt(limit));
    
    res.json({
      success: true,
      data: {
        fid: parseInt(fid),
        topInteractions: topInteractions
      }
    });
    
  } catch (error) {
    console.error('Error fetching top interactions:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch top interactions',
      details: error.message 
    });
  }
});

// Get user's followers with pagination
app.get('/api/user/:fid/followers', async (req, res) => {
  try {
    const { fid } = req.params;
    const { limit = 25, cursor } = req.query;
    
    console.log(`Fetching followers for FID: ${fid}`);
    
    const followersData = await indexer.getUserFollowers(fid, parseInt(limit), cursor);
    
    res.json({
      success: true,
      data: followersData
    });
    
  } catch (error) {
    console.error('Error fetching followers:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch followers',
      details: error.message 
    });
  }
});

// Get user's following with pagination
app.get('/api/user/:fid/following', async (req, res) => {
  try {
    const { fid } = req.params;
    const { limit = 25, cursor } = req.query;
    
    console.log(`Fetching following for FID: ${fid}`);
    
    const followingData = await indexer.getUserFollowing(fid, parseInt(limit), cursor);
    
    res.json({
      success: true,
      data: followingData
    });
    
  } catch (error) {
    console.error('Error fetching following:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch following',
      details: error.message 
    });
  }
});

// Get user's casts with pagination
app.get('/api/user/:fid/casts', async (req, res) => {
  try {
    const { fid } = req.params;
    const { limit = 25, cursor } = req.query;
    
    console.log(`Fetching casts for FID: ${fid}`);
    
    const castsData = await indexer.getUserCasts(fid, parseInt(limit), cursor);
    
    res.json({
      success: true,
      data: castsData
    });
    
  } catch (error) {
    console.error('Error fetching casts:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch casts',
      details: error.message 
    });
  }
});

// Search users with enhanced error handling
app.get('/api/search/users', async (req, res) => {
  try {
    const { q, limit = 25 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    console.log(`Searching users with query: ${q}`);
    
    const searchData = await indexer.searchUsers(q.trim(), parseInt(limit));
    
    res.json({
      success: true,
      data: searchData
    });
    
  } catch (error) {
    console.error('Error searching users:', error.message);
    res.status(500).json({ 
      error: 'Failed to search users',
      details: error.message 
    });
  }
});

// Get trending casts
app.get('/api/trending/casts', async (req, res) => {
  try {
    const { limit = 25, time_window = '24h' } = req.query;
    
    console.log(`Fetching trending casts for time window: ${time_window}`);
    
    const trendingData = await indexer.getTrendingCasts(parseInt(limit), time_window);
    
    res.json({
      success: true,
      data: trendingData
    });
    
  } catch (error) {
    console.error('Error fetching trending casts:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch trending casts',
      details: error.message 
    });
  }
});

// Get cast by hash
app.get('/api/cast/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    console.log(`Fetching cast with hash: ${hash}`);
    
    const castData = await indexer.getCastData(hash, 'hash');
    
    res.json({
      success: true,
      data: castData
    });
    
  } catch (error) {
    console.error('Error fetching cast:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch cast',
      details: error.message 
    });
  }
});

// Get cast reactions
app.get('/api/cast/:hash/reactions', async (req, res) => {
  try {
    const { hash } = req.params;
    
    console.log(`Fetching reactions for cast: ${hash}`);
    
    const reactionsData = await indexer.getCastReactions(hash, 'hash');
    
    res.json({
      success: true,
      data: reactionsData
    });
    
  } catch (error) {
    console.error('Error fetching cast reactions:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch cast reactions',
      details: error.message 
    });
  }
});

// Bulk user lookup
app.get('/api/users/bulk', async (req, res) => {
  try {
    const { fids, viewer_fid } = req.query;
    
    if (!fids) {
      return res.status(400).json({ error: 'FIDs parameter is required' });
    }
    
    const fidArray = fids.split(',').map(fid => parseInt(fid.trim())).filter(fid => !isNaN(fid));
    
    if (fidArray.length === 0) {
      return res.status(400).json({ error: 'No valid FIDs provided' });
    }
    
    console.log(`Fetching bulk user data for ${fidArray.length} FIDs`);
    
    const userData = await indexer.getBulkUsers(fidArray, viewer_fid ? parseInt(viewer_fid) : null);
    
    res.json({
      success: true,
      data: userData
    });
    
  } catch (error) {
    console.error('Error fetching bulk users:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch bulk users',
      details: error.message 
    });
  }
});

// Indexer management endpoints
app.get('/api/indexer/stats', (req, res) => {
  const cacheStats = indexer.getCacheStats();
  const rateLimitStats = indexer.getRateLimitStats();
  const performanceStats = indexer.getPerformanceStats();
  
  res.json({
    success: true,
    data: {
      cache: cacheStats,
      rateLimits: rateLimitStats,
      performance: performanceStats,
      timestamp: new Date().toISOString()
    }
  });
});

app.post('/api/indexer/cache/clear', (req, res) => {
  indexer.clearCache();
  res.json({
    success: true,
    message: 'Cache cleared successfully'
  });
});

// Reset performance statistics
app.post('/api/indexer/stats/reset', (req, res) => {
  indexer.resetPerformanceStats();
  res.json({ 
    success: true, 
    message: 'Performance statistics reset',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /api/user/:fid',
      'GET /api/user/:fid/top-interactions',
      'GET /api/user/:fid/followers',
      'GET /api/user/:fid/following',
      'GET /api/user/:fid/casts',
      'GET /api/search/users',
      'GET /api/trending/casts',
      'GET /api/cast/:hash',
      'GET /api/cast/:hash/reactions',
      'GET /api/users/bulk',
      'GET /api/indexer/stats',
      'POST /api/indexer/cache/clear'
    ]
  });
});

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Enhanced server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔑 Neynar API configured: ${!!process.env.NEYNAR_API_KEY}`);
    console.log(`📈 Indexer stats: http://localhost:${PORT}/api/indexer/stats`);
  });
}

module.exports = app; 
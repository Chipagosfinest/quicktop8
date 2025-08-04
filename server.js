const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const NeynarIndexer = require('./neynar-indexer');

const app = express();
const PORT = process.env.PORT || 4000;

// Initialize Neynar Indexer with optimized settings
const indexer = new NeynarIndexer(process.env.NEYNAR_API_KEY, {
  cacheTTL: 10 * 60 * 1000, // 10 minutes for better performance
  retryAttempts: 2, // Reduced for faster failure detection
  retryDelay: 500, // Faster retry
  batchSize: 50 // Smaller batches for better reliability
});

// Optimized middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.neynar.com", "https://warpcast.com"]
    }
  }
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// CORS configuration for quicktop8-alpha.vercel.app
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://quicktop8-alpha.vercel.app',
    'https://quicktop8.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Health check endpoint
app.get('/health', (req, res) => {
  const cacheStats = indexer.getCacheStats();
  const performanceStats = indexer.getPerformanceStats();
  
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    neynarConfigured: !!process.env.NEYNAR_API_KEY,
    cache: cacheStats,
    performance: performanceStats,
    uptime: process.uptime()
  });
});

// Main user data endpoint with optimized error handling
app.get('/api/user/:fid', async (req, res) => {
  try {
    const { fid } = req.params;
    const { viewer_fid } = req.query;
    
    if (!fid || isNaN(parseInt(fid))) {
      return res.status(400).json({ 
        error: 'Invalid FID provided',
        fid: fid
      });
    }
    
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
      timestamp: new Date().toISOString()
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
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
});

// Enhanced user profile with detailed data
app.get('/api/user/:fid/profile', async (req, res) => {
  try {
    const { fid } = req.params;
    const { viewer_fid } = req.query;

    if (!fid || isNaN(parseInt(fid))) {
      return res.status(400).json({
        error: 'Invalid FID provided',
        fid: fid
      });
    }

    console.log(`Fetching detailed profile for FID: ${fid}`);

    const userData = await indexer.getUserData(fid, viewer_fid);
    const followers = await indexer.getFollowers(fid, 20);
    const following = await indexer.getFollowing(fid, 20);
    const mutualFollowers = await indexer.getMutualFollowers(fid, viewer_fid);

    res.json({
      success: true,
      data: {
        user: userData.users?.[0] || null,
        followers: followers.followers || [],
        following: following.following || [],
        mutualFollowers: mutualFollowers.users || [],
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({
      error: 'Failed to fetch user profile',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Top interactions endpoint
app.get('/api/user/:fid/top-interactions', async (req, res) => {
  try {
    const { fid } = req.params;
    const { limit = 8, filter_spam = 'true' } = req.query;

    if (!fid || isNaN(parseInt(fid))) {
      return res.status(400).json({
        error: 'Invalid FID provided',
        fid: fid
      });
    }

    console.log(`Fetching top interactions for FID: ${fid}`);

    const topInteractions = await indexer.getTopInteractions(fid, parseInt(limit), {
      filterSpam: filter_spam === 'true'
    });

    res.json({
      success: true,
      data: topInteractions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching top interactions:', error.message);
    res.status(500).json({
      error: 'Failed to fetch top interactions',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Wallet interaction endpoints
app.post('/api/wallet/tip', async (req, res) => {
  try {
    const { from_fid, to_fid, amount, message } = req.body;

    if (!from_fid || !to_fid || !amount) {
      return res.status(400).json({
        error: 'Missing required parameters: from_fid, to_fid, amount'
      });
    }

    console.log(`Processing tip from ${from_fid} to ${to_fid}: ${amount}`);

    // TODO: Implement actual wallet interaction
    // For now, return a mock response
    res.json({
      success: true,
      data: {
        transaction_hash: '0x' + Math.random().toString(16).substr(2, 64),
        from_fid,
        to_fid,
        amount,
        message,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error processing tip:', error.message);
    res.status(500).json({
      error: 'Failed to process tip',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

app.post('/api/wallet/mint', async (req, res) => {
  try {
    const { recipient_fid, token_type, metadata } = req.body;

    if (!recipient_fid || !token_type) {
      return res.status(400).json({
        error: 'Missing required parameters: recipient_fid, token_type'
      });
    }

    console.log(`Minting ${token_type} for FID: ${recipient_fid}`);

    // TODO: Implement actual NFT minting
    // For now, return a mock response
    res.json({
      success: true,
      data: {
        transaction_hash: '0x' + Math.random().toString(16).substr(2, 64),
        recipient_fid,
        token_type,
        metadata,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error minting token:', error.message);
    res.status(500).json({
      error: 'Failed to mint token',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Bulk users endpoint for efficient batch processing
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
    
    if (fidArray.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 FIDs allowed per request' });
    }
    
    console.log(`Fetching bulk user data for ${fidArray.length} FIDs`);
    
    const userData = await indexer.getBulkUsers(fidArray, viewer_fid ? parseInt(viewer_fid) : null);
    
    res.json({
      success: true,
      data: userData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching bulk users:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch bulk users',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Indexer stats endpoint
app.get('/api/indexer/stats', (req, res) => {
  const cacheStats = indexer.getCacheStats();
  const performanceStats = indexer.getPerformanceStats();
  
  res.json({
    success: true,
    data: {
      cache: cacheStats,
      performance: performanceStats,
      timestamp: new Date().toISOString()
    }
  });
});

// Cache management
app.post('/api/indexer/cache/clear', (req, res) => {
  indexer.clearCache();
  res.json({
    success: true,
    message: 'Cache cleared successfully',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
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
      'GET /api/users/bulk',
      'GET /api/indexer/stats',
      'POST /api/indexer/cache/clear'
    ]
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 QuickTop8 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔑 Neynar API configured: ${!!process.env.NEYNAR_API_KEY}`);
    console.log(`🌐 Domain: quicktop8-alpha.vercel.app`);
  });
}

module.exports = app; 
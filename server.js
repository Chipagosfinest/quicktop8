const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Neynar API configuration
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const NEYNAR_CLIENT_ID = process.env.NEYNAR_CLIENT_ID;
const NEYNAR_BASE_URL = 'https://api.neynar.com/v2';

// Helper function to make authenticated requests to Neynar API
const makeNeynarRequest = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${NEYNAR_BASE_URL}${endpoint}`, {
      headers: {
        'api_key': NEYNAR_API_KEY,
        'Content-Type': 'application/json'
      },
      params
    });
    return response.data;
  } catch (error) {
    console.error('Neynar API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    neynarConfigured: !!NEYNAR_API_KEY 
  });
});

// Get user information by FID
app.get('/api/user/:fid', async (req, res) => {
  try {
    const { fid } = req.params;
    const userData = await makeNeynarRequest('/farcaster/user/bulk', { fids: fid });
    res.json(userData);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch user data',
      details: error.message 
    });
  }
});

// Get user's followers
app.get('/api/user/:fid/followers', async (req, res) => {
  try {
    const { fid } = req.params;
    const { limit = 25, cursor } = req.query;
    
    const followersData = await makeNeynarRequest('/farcaster/followers', {
      fid,
      limit: parseInt(limit),
      ...(cursor && { cursor })
    });
    
    res.json(followersData);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch followers',
      details: error.message 
    });
  }
});

// Get user's following
app.get('/api/user/:fid/following', async (req, res) => {
  try {
    const { fid } = req.params;
    const { limit = 25, cursor } = req.query;
    
    const followingData = await makeNeynarRequest('/farcaster/user/following', {
      fid,
      limit: parseInt(limit),
      ...(cursor && { cursor })
    });
    
    res.json(followingData);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch following',
      details: error.message 
    });
  }
});

// Get user's casts
app.get('/api/user/:fid/casts', async (req, res) => {
  try {
    const { fid } = req.params;
    const { limit = 25, cursor } = req.query;
    
    const castsData = await makeNeynarRequest('/farcaster/casts', {
      fid,
      limit: parseInt(limit),
      ...(cursor && { cursor })
    });
    
    res.json(castsData);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch casts',
      details: error.message 
    });
  }
});

// Search users
app.get('/api/search/users', async (req, res) => {
  try {
    const { q, limit = 25 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const searchData = await makeNeynarRequest('/farcaster/user/search', {
      q,
      limit: parseInt(limit)
    });
    
    res.json(searchData);
  } catch (error) {
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
    
    const trendingData = await makeNeynarRequest('/farcaster/feed/trending', {
      limit: parseInt(limit),
      time_window
    });
    
    res.json(trendingData);
  } catch (error) {
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
    
    const castData = await makeNeynarRequest('/farcaster/cast', {
      identifier: hash,
      type: 'hash'
    });
    
    res.json(castData);
  } catch (error) {
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
    
    const reactionsData = await makeNeynarRequest('/farcaster/cast/reactions', {
      identifier: hash,
      type: 'hash'
    });
    
    res.json(reactionsData);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch cast reactions',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
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
      'GET /api/user/:fid/followers',
      'GET /api/user/:fid/following',
      'GET /api/user/:fid/casts',
      'GET /api/search/users',
      'GET /api/trending/casts',
      'GET /api/cast/:hash',
      'GET /api/cast/:hash/reactions'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Neynar API configured: ${!!NEYNAR_API_KEY}`);
}); 
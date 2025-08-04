const axios = require('axios');
const { setTimeout } = require('timers/promises');

class NeynarIndexer {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.neynar.com/v2';
    this.rateLimits = {
      global: { rpm: 500, rps: 5, current: 0, resetTime: Date.now() },
      endpoints: new Map()
    };
    this.cache = new Map();
    this.cacheTTL = options.cacheTTL || 5 * 60 * 1000; // 5 minutes
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.batchSize = options.batchSize || 100;
    
    // Initialize rate limit tracking
    this.initializeRateLimits();
  }

  initializeRateLimits() {
    // Set up rate limit tracking for different endpoints
    const endpoints = [
      '/farcaster/user/bulk',
      '/farcaster/casts',
      '/farcaster/followers',
      '/farcaster/user/following',
      '/farcaster/feed/trending',
      '/farcaster/cast',
      '/farcaster/cast/reactions'
    ];

    endpoints.forEach(endpoint => {
      this.rateLimits.endpoints.set(endpoint, {
        rpm: 300,
        rps: 5,
        current: 0,
        resetTime: Date.now()
      });
    });
  }

  async checkRateLimit(endpoint) {
    const now = Date.now();
    
    // Check global rate limit
    if (now > this.rateLimits.global.resetTime) {
      this.rateLimits.global.current = 0;
      this.rateLimits.global.resetTime = now + 60000; // Reset in 1 minute
    }
    
    if (this.rateLimits.global.current >= this.rateLimits.global.rpm) {
      const waitTime = this.rateLimits.global.resetTime - now;
      console.log(`Global rate limit reached. Waiting ${waitTime}ms`);
      await setTimeout(waitTime);
      this.rateLimits.global.current = 0;
    }
    
    // Check endpoint-specific rate limit
    const endpointLimit = this.rateLimits.endpoints.get(endpoint);
    if (endpointLimit) {
      if (now > endpointLimit.resetTime) {
        endpointLimit.current = 0;
        endpointLimit.resetTime = now + 60000;
      }
      
      if (endpointLimit.current >= endpointLimit.rpm) {
        const waitTime = endpointLimit.resetTime - now;
        console.log(`Endpoint rate limit reached for ${endpoint}. Waiting ${waitTime}ms`);
        await setTimeout(waitTime);
        endpointLimit.current = 0;
      }
    }
  }

  async makeRequest(endpoint, params = {}, retryCount = 0, useExperimental = false) {
    try {
      await this.checkRateLimit(endpoint);
      
      const cacheKey = `${endpoint}?${JSON.stringify(params)}&exp=${useExperimental}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        console.log(`Cache hit for ${endpoint}`);
        return cached.data;
      }
      
      const headers = {
        'api_key': this.apiKey,
        'Content-Type': 'application/json'
      };
      
      // Add experimental header for spam filtering
      if (useExperimental) {
        headers['x-neynar-experimental'] = 'true';
      }
      
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        headers,
        params,
        timeout: 10000
      });
      
      // Update rate limit counters
      this.rateLimits.global.current++;
      const endpointLimit = this.rateLimits.endpoints.get(endpoint);
      if (endpointLimit) {
        endpointLimit.current++;
      }
      
      // Cache the response
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      
      return response.data;
      
    } catch (error) {
      console.error(`Request failed for ${endpoint}:`, error.message);
      
      if (retryCount < this.retryAttempts) {
        console.log(`Retrying request (${retryCount + 1}/${this.retryAttempts})`);
        await setTimeout(this.retryDelay * Math.pow(2, retryCount)); // Exponential backoff
        return this.makeRequest(endpoint, params, retryCount + 1, useExperimental);
      }
      
      throw error;
    }
  }

  async getUserData(fid, viewerFid = null, useSpamFilter = true) {
    const params = { fids: fid };
    if (viewerFid) params.viewer_fid = viewerFid;
    
    return this.makeRequest('/farcaster/user/bulk', params, 0, useSpamFilter);
  }

  async getBulkUsers(fids, viewerFid = null) {
    // Split large batches to avoid rate limits
    const batches = [];
    for (let i = 0; i < fids.length; i += this.batchSize) {
      batches.push(fids.slice(i, i + this.batchSize));
    }
    
    const results = [];
    for (const batch of batches) {
      const params = { fids: batch.join(',') };
      if (viewerFid) params.viewer_fid = viewerFid;
      
      const data = await this.makeRequest('/farcaster/user/bulk', params);
      results.push(...(data.users || []));
      
      // Small delay between batches
      if (batches.length > 1) {
        await setTimeout(100);
      }
    }
    
    return { users: results };
  }

  async getUserCasts(fid, limit = 25, cursor = null) {
    const params = { fid, limit };
    if (cursor) params.cursor = cursor;
    
    return this.makeRequest('/farcaster/feed/user/casts', params);
  }

  async getUserFollowers(fid, limit = 25, cursor = null, useSpamFilter = true) {
    const params = { fid, limit };
    if (cursor) params.cursor = cursor;
    
    return this.makeRequest('/farcaster/followers', params, 0, useSpamFilter);
  }

  async getUserFollowing(fid, limit = 25, cursor = null) {
    const params = { fid, limit };
    if (cursor) params.cursor = cursor;
    
    return this.makeRequest('/farcaster/following', params);
  }

  async getCastData(identifier, type = 'hash') {
    return this.makeRequest('/farcaster/cast', { identifier, type });
  }

  async getCastReactions(identifier, type = 'hash') {
    return this.makeRequest('/farcaster/reactions/cast', { hash: identifier });
  }

  async getTrendingCasts(limit = 25, timeWindow = '24h') {
    return this.makeRequest('/farcaster/feed/trending', { limit, time_window: timeWindow });
  }

  async searchUsers(query, limit = 25) {
    return this.makeRequest('/farcaster/user/search', { q: query, limit });
  }

  // Advanced indexing methods
  async indexUserInteractions(fid, depth = 2) {
    console.log(`Indexing interactions for FID ${fid} with depth ${depth}`);
    
    const userData = await this.getUserData(fid);
    const user = userData.users?.[0];
    
    if (!user) {
      throw new Error(`User with FID ${fid} not found`);
    }
    
    const interactions = {
      user,
      followers: [],
      following: [],
      recentCasts: [],
      interactions: new Map()
    };
    
    // Get followers and following
    const [followersData, followingData, castsData] = await Promise.all([
      this.getUserFollowers(fid, 100),
      this.getUserFollowing(fid, 100),
      this.getUserCasts(fid, 50)
    ]);
    
    interactions.followers = followersData.users || [];
    interactions.following = followingData.users || [];
    interactions.recentCasts = castsData.casts || [];
    
    // Analyze interactions if depth > 1
    if (depth > 1) {
      const topFollowers = interactions.followers.slice(0, 10);
      const topFollowing = interactions.following.slice(0, 10);
      
      const allUsers = [...topFollowers, ...topFollowing];
      const uniqueFids = [...new Set(allUsers.map(u => u.fid))];
      
      // Get interaction data for top connections
      for (const connectionFid of uniqueFids) {
        try {
          const connectionCasts = await this.getUserCasts(connectionFid, 20);
          interactions.interactions.set(connectionFid, {
            casts: connectionCasts.casts || [],
            interactionCount: 0
          });
        } catch (error) {
          console.warn(`Failed to get casts for FID ${connectionFid}:`, error.message);
        }
      }
    }
    
    return interactions;
  }

  async getTopInteractions(fid, limit = 8, filterOptions = {}) {
    console.log(`Getting top interactions for FID ${fid} with filtering`);
    
    try {
      // Get followers with spam filtering enabled
      const followersData = await this.getUserFollowers(fid, 100, null, true);
      const followers = followersData.users || [];
      
      if (followers.length === 0) {
        console.log('No followers found for top interactions');
        return [];
      }
      
      // Extract user data from the nested structure
      const users = followers.map(follow => follow.user).filter(Boolean);
      
      if (users.length === 0) {
        console.log('No valid user data found in followers');
        return [];
      }
      
      // Apply content filtering
      const filteredUsers = this.filterUsers(users, {
        minUserScore: 0.3,
        filterHateful: true,
        filterSpam: true,
        filterLowQuality: true,
        ...filterOptions
      });
      
      console.log(`Filtered ${users.length} users down to ${filteredUsers.length} quality users`);
      
      if (filteredUsers.length === 0) {
        console.log('No quality users found after filtering');
        return [];
      }
      
      // Enhanced interaction scoring based on multiple factors
      const scoredUsers = filteredUsers.map(user => {
        const userScore = user.experimental?.neynar_user_score || user.score || 0;
        const followerCount = user.follower_count || 0;
        const castCount = user.cast_count || 0;
        const verifiedCount = user.verified_addresses?.eth_addresses?.length || 0;
        
        // Weighted scoring: user quality + engagement + verification
        const score = (
          userScore * 1000 + // User quality (0-1000)
          followerCount * 0.1 + // Follower count (weighted)
          castCount * 5 + // Activity level
          verifiedCount * 50 // Verification bonus
        );
        
        return { ...user, score };
      });
      
      // Sort by score and take top users
      scoredUsers.sort((a, b) => b.score - a.score);
      
      return scoredUsers.slice(0, limit).map(user => ({
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        avatar: user.pfp_url,
        followerCount: user.follower_count,
        castCount: user.cast_count,
        userScore: user.experimental?.neynar_user_score || user.score || 0,
        verified: (user.verified_addresses?.eth_addresses?.length || 0) > 0,
        interactionCount: Math.floor(user.score / 100), // Normalize score
        likes: Math.floor(user.score / 50),
        replies: Math.floor(user.score / 75),
        recasts: Math.floor(user.score / 100)
      }));
      
    } catch (error) {
      console.error(`Failed to get top interactions for FID ${fid}:`, error.message);
      return [];
    }
  }

  // Content filtering functions
  isHatefulContent(text) {
    if (!text) return false;
    
    const hatefulPatterns = [
      /\b(nazi|hitler|fascist|racist|sexist|homophobic|transphobic)\b/i,
      /\b(kill|murder|death|hate)\s+(all|every|everyone)\b/i,
      /\b(white\s+supremacy|white\s+power)\b/i,
      /\b(genocide|ethnic\s+cleansing)\b/i,
      /\b(rape|pedo|pedophile)\b/i,
      /\b(slave|slavery)\b/i,
      /\b(terrorist|terrorism)\b/i
    ];
    
    return hatefulPatterns.some(pattern => pattern.test(text));
  }

  isSpamUsername(username) {
    if (!username) return false;
    
    const spamPatterns = [
      /^[0-9]+$/, // Just numbers
      /^[a-z0-9]{20,}$/i, // Very long alphanumeric
      /^(spam|bot|fake|scam|test)/i, // Starts with spam words
      /(spam|bot|fake|scam|test)$/i, // Ends with spam words
      /[0-9]{5,}/, // Too many consecutive numbers
      /[a-z]{10,}/i, // Too many consecutive letters
    ];
    
    return spamPatterns.some(pattern => pattern.test(username));
  }

  isLowQualityUser(user) {
    if (!user) return false;
    
    // Check user score (0-1 scale, higher is better)
    const userScore = user.experimental?.neynar_user_score || user.score || 0;
    if (userScore < 0.3) return true; // Very low quality
    
    // Check for suspicious follower/following ratios
    const followerCount = user.follower_count || 0;
    const followingCount = user.following_count || 0;
    
    // Suspicious if following way more than followers
    if (followingCount > 0 && followerCount / followingCount < 0.1) return true;
    
    // Suspicious if very few followers but high following
    if (followerCount < 10 && followingCount > 100) return true;
    
    // Check for hateful display names
    if (user.display_name && this.isHatefulContent(user.display_name)) return true;
    
    // Check for spam usernames
    if (user.username && this.isSpamUsername(user.username)) return true;
    
    return false;
  }

  filterUsers(users, options = {}) {
    const {
      minUserScore = 0.3,
      filterHateful = true,
      filterSpam = true,
      filterLowQuality = true
    } = options;
    
    if (!users || !Array.isArray(users)) return [];
    
    return users.filter(user => {
      // Check user score
      const userScore = user.experimental?.neynar_user_score || user.score || 0;
      if (userScore < minUserScore) return false;
      
      // Apply content filters
      if (filterHateful) {
        if (this.isHatefulContent(user.display_name) || 
            this.isHatefulContent(user.profile?.bio?.text)) {
          return false;
        }
      }
      
      // Apply spam filters
      if (filterSpam && this.isSpamUsername(user.username)) {
        return false;
      }
      
      // Apply quality filters
      if (filterLowQuality && this.isLowQualityUser(user)) {
        return false;
      }
      
      return true;
    });
  }

  // Cache management
  clearCache() {
    this.cache.clear();
    console.log('Cache cleared');
  }

  getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp < this.cacheTTL) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }
    
    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries,
      hitRate: validEntries / this.cache.size || 0
    };
  }

  // Rate limit monitoring
  getRateLimitStats() {
    const stats = {
      global: {
        current: this.rateLimits.global.current,
        limit: this.rateLimits.global.rpm,
        resetTime: new Date(this.rateLimits.global.resetTime)
      },
      endpoints: {}
    };
    
    for (const [endpoint, limit] of this.rateLimits.endpoints.entries()) {
      stats.endpoints[endpoint] = {
        current: limit.current,
        limit: limit.rpm,
        resetTime: new Date(limit.resetTime)
      };
    }
    
    return stats;
  }
}

module.exports = NeynarIndexer; 
import axios, { AxiosResponse } from 'axios';

interface RateLimit {
  rpm: number;
  rps: number;
  current: number;
  resetTime: number;
}

interface RateLimits {
  global: RateLimit;
  endpoints: Map<string, RateLimit>;
}

interface CacheEntry {
  data: any;
  timestamp: number;
}

interface PerformanceStats {
  totalRequests: number;
  cacheHits: number;
  averageResponseTime: number;
  lastReset: number;
}

interface IndexerOptions {
  cacheTTL?: number;
  retryAttempts?: number;
  retryDelay?: number;
  batchSize?: number;
}

interface User {
  object: string;
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  custody_address: string;
  follower_count: number;
  following_count: number;
  verifications: string[];
  verified_addresses: any;
  verified_accounts: any[];
  power_badge: boolean;
  experimental: any;
  score: number;
}

interface Cast {
  object: string;
  hash: string;
  thread_hash: string;
  parent_hash: string;
  author: User;
  text: string;
  timestamp: string;
  reactions: any;
  replies: any;
  recasts: any;
  watches: any;
  deleted: boolean;
  recast: boolean;
  recast_by: any;
  mentioned_profiles: any[];
  parent_author: any;
  parent_url: string;
  parent_cast_id: any;
  parent_cast_author: any;
}

interface TopInteraction {
  fid: number;
  username: string;
  displayName: string;
  avatar: string;
  followerCount: number;
  userScore: number;
  verified: boolean;
  interactionCount: number;
  likes: number;
  replies: number;
  recasts: number;
}

export class NeynarIndexer {
  private apiKey: string;
  private baseURL: string;
  private rateLimits: RateLimits;
  private cache: Map<string, CacheEntry>;
  private cacheTTL: number;
  private retryAttempts: number;
  private retryDelay: number;
  private batchSize: number;
  private performanceStats: PerformanceStats;

  constructor(apiKey: string, options: IndexerOptions = {}) {
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
    
    this.performanceStats = {
      totalRequests: 0,
      cacheHits: 0,
      averageResponseTime: 0,
      lastReset: Date.now()
    };
    
    this.initializeRateLimits();
  }

  private initializeRateLimits(): void {
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

  private async checkRateLimit(endpoint: string): Promise<void> {
    const now = Date.now();
    
    // Check global rate limit
    if (now > this.rateLimits.global.resetTime) {
      this.rateLimits.global.current = 0;
      this.rateLimits.global.resetTime = now + 60000; // Reset in 1 minute
    }
    
    if (this.rateLimits.global.current >= this.rateLimits.global.rpm) {
      const waitTime = this.rateLimits.global.resetTime - now;
      console.log(`Global rate limit reached. Waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
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
        await new Promise(resolve => setTimeout(resolve, waitTime));
        endpointLimit.current = 0;
      }
    }
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}, retryCount = 0, useExperimental = false): Promise<any> {
    const startTime = Date.now();
    
    try {
      await this.checkRateLimit(endpoint);
      
      const cacheKey = `${endpoint}?${JSON.stringify(params)}&exp=${useExperimental}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        console.log(`Cache hit for ${endpoint}`);
        this.performanceStats.cacheHits++;
        this.performanceStats.totalRequests++;
        return cached.data;
      }
      
      const url = `${this.baseURL}${endpoint}`;
      const headers = {
        'accept': 'application/json',
        'api_key': this.apiKey
      };
      
      const response: AxiosResponse = await axios.get(url, {
        headers,
        params: {
          ...params,
          ...(useExperimental && { experimental: true })
        },
        timeout: 10000
      });
      
      // Update rate limits
      this.rateLimits.global.current++;
      const endpointLimit = this.rateLimits.endpoints.get(endpoint);
      if (endpointLimit) {
        endpointLimit.current++;
      }
      
      // Update performance stats
      const responseTime = Date.now() - startTime;
      this.performanceStats.totalRequests++;
      this.performanceStats.averageResponseTime = 
        (this.performanceStats.averageResponseTime * (this.performanceStats.totalRequests - 1) + responseTime) / this.performanceStats.totalRequests;
      
      // Cache the response
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      
      return response.data;
      
    } catch (error: any) {
      console.error(`Request failed for ${endpoint}:`, error.message);
      
      if (retryCount < this.retryAttempts && error.response?.status >= 500) {
        console.log(`Retrying request (${retryCount + 1}/${this.retryAttempts})`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
        return this.makeRequest(endpoint, params, retryCount + 1, useExperimental);
      }
      
      // Update performance stats for failed requests
      const responseTime = Date.now() - startTime;
      this.performanceStats.totalRequests++;
      this.performanceStats.averageResponseTime = 
        (this.performanceStats.averageResponseTime * (this.performanceStats.totalRequests - 1) + responseTime) / this.performanceStats.totalRequests;
      
      throw error;
    }
  }

  async getUserData(fid: number | string, viewerFid?: number | string, useSpamFilter = true): Promise<any> {
    const params: Record<string, any> = {
      fids: fid.toString()
    };
    
    if (viewerFid) {
      params.viewer_fid = viewerFid.toString();
    }
    
    return this.makeRequest('/farcaster/user/bulk', params, 0, useSpamFilter);
  }

  async getTopInteractions(fid: number | string, limit = 8, filterOptions: Record<string, any> = {}): Promise<TopInteraction[]> {
    try {
      // Get user's casts
      const castsResponse = await this.makeRequest('/farcaster/casts', {
        fid: fid.toString(),
        limit: 50
      });
      
      if (!castsResponse.casts || castsResponse.casts.length === 0) {
        return [];
      }
      
      // Extract all unique FIDs from interactions
      const interactionFids = new Set<number>();
      const castInteractions: Record<number, { likes: number; replies: number; recasts: number }> = {};
      
      for (const cast of castsResponse.casts) {
        // Count likes
        if (cast.reactions?.likes) {
          for (const like of cast.reactions.likes) {
            const likeFid = like.fid;
            interactionFids.add(likeFid);
            if (!castInteractions[likeFid]) {
              castInteractions[likeFid] = { likes: 0, replies: 0, recasts: 0 };
            }
            castInteractions[likeFid].likes++;
          }
        }
        
        // Count replies
        if (cast.replies?.casts) {
          for (const reply of cast.replies.casts) {
            const replyFid = reply.author.fid;
            interactionFids.add(replyFid);
            if (!castInteractions[replyFid]) {
              castInteractions[replyFid] = { likes: 0, replies: 0, recasts: 0 };
            }
            castInteractions[replyFid].replies++;
          }
        }
        
        // Count recasts
        if (cast.recasts?.recasts) {
          for (const recast of cast.recasts.recasts) {
            const recastFid = recast.user.fid;
            interactionFids.add(recastFid);
            if (!castInteractions[recastFid]) {
              castInteractions[recastFid] = { likes: 0, replies: 0, recasts: 0 };
            }
            castInteractions[recastFid].recasts++;
          }
        }
      }
      
      // Get user data for all interaction FIDs
      const fidsArray = Array.from(interactionFids);
      if (fidsArray.length === 0) {
        return [];
      }
      
      const usersResponse = await this.makeRequest('/farcaster/user/bulk', {
        fids: fidsArray.join(',')
      });
      
      if (!usersResponse.users) {
        return [];
      }
      
      // Create top interactions list
      const topInteractions: TopInteraction[] = [];
      
      for (const user of usersResponse.users) {
        const interactions = castInteractions[user.fid] || { likes: 0, replies: 0, recasts: 0 };
        const totalInteractions = interactions.likes + interactions.replies + interactions.recasts;
        
        if (totalInteractions > 0) {
          topInteractions.push({
            fid: user.fid,
            username: user.username,
            displayName: user.display_name,
            avatar: user.pfp_url,
            followerCount: user.follower_count,
            userScore: user.score || 0,
            verified: user.verified_addresses?.length > 0,
            interactionCount: totalInteractions,
            likes: interactions.likes,
            replies: interactions.replies,
            recasts: interactions.recasts
          });
        }
      }
      
      // Sort by interaction count and return top results
      return topInteractions
        .sort((a, b) => b.interactionCount - a.interactionCount)
        .slice(0, limit);
        
    } catch (error) {
      console.error('Error getting top interactions:', error);
      return [];
    }
  }

  getCacheStats(): any {
    const now = Date.now();
    let total = 0;
    let valid = 0;
    let expired = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      total++;
      if (now - entry.timestamp < this.cacheTTL) {
        valid++;
      } else {
        expired++;
      }
    }
    
    return {
      total,
      valid,
      expired,
      hitRate: this.performanceStats.totalRequests > 0 ? 
        (this.performanceStats.cacheHits / this.performanceStats.totalRequests) * 100 : 0
    };
  }

  getRateLimitStats(): any {
    const global = this.rateLimits.global;
    const endpoints: Record<string, any> = {};
    
    for (const [endpoint, limit] of this.rateLimits.endpoints.entries()) {
      endpoints[endpoint] = {
        current: limit.current,
        limit: limit.rpm,
        resetTime: new Date(limit.resetTime).toISOString()
      };
    }
    
    return {
      global: {
        current: global.current,
        limit: global.rpm,
        resetTime: new Date(global.resetTime).toISOString()
      },
      endpoints
    };
  }

  getPerformanceStats(): any {
    const uptime = Date.now() - this.performanceStats.lastReset;
    const cacheHitRate = this.performanceStats.totalRequests > 0 ?
      (this.performanceStats.cacheHits / this.performanceStats.totalRequests) * 100 : 0;

    return {
      totalRequests: this.performanceStats.totalRequests,
      cacheHits: this.performanceStats.cacheHits,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      averageResponseTime: Math.round(this.performanceStats.averageResponseTime),
      uptime: Math.round(uptime / 1000), // seconds
      requestsPerMinute: this.performanceStats.totalRequests > 0 ?
        Math.round((this.performanceStats.totalRequests / (uptime / 60000)) * 100) / 100 : 0
    };
  }

  resetPerformanceStats(): void {
    this.performanceStats = {
      totalRequests: 0,
      cacheHits: 0,
      averageResponseTime: 0,
      lastReset: Date.now()
    };
  }

  clearCache(): void {
    this.cache.clear();
  }
} 
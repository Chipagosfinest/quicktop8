module.exports = {
  // Neynar API Configuration
  neynar: {
    apiKey: process.env.NEYNAR_API_KEY || '1E58A226-A64C-4CF3-A047-FBED94F36101',
    baseURL: 'https://api.neynar.com/v2'
  },
  
  // Server Configuration
  server: {
    port: process.env.PORT || 4000,
    environment: process.env.NODE_ENV || 'development'
  },
  
  // Domain Configuration
  domain: {
    primary: 'quicktop8-alpha.vercel.app',
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://quicktop8-alpha.vercel.app',
      'https://quicktop8.vercel.app'
    ]
  },
  
  // Cache Configuration
  cache: {
    ttl: 10 * 60 * 1000, // 10 minutes
    maxSize: 1000
  },
  
  // Rate Limiting
  rateLimit: {
    requestsPerMinute: 500,
    requestsPerSecond: 5
  }
}; 
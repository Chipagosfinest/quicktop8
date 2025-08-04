module.exports = {
  // Backend API URL
  backendUrl: process.env.BACKEND_URL || 'http://localhost:4000',
  
  // App URL
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Domain configuration
  domain: {
    primary: 'quicktop8-alpha.vercel.app',
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://quicktop8-alpha.vercel.app',
      'https://quicktop8.vercel.app'
    ]
  }
}; 
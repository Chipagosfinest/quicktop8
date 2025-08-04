# QuickTop8 - Your Top Farcaster Friends

A mini app that shows your top 8 friends on Farcaster based on your interactions.

## 🌐 Live Demo

**Domain**: https://quicktop8-alpha.vercel.app

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm
- Vercel CLI (`npm i -g vercel`)

### Local Development

1. **Clone and install dependencies**
   ```bash
   git clone <repository>
   cd quicktop8
   npm install
   cd frontend && npm install && cd ..
   ```

2. **Set environment variables**
   ```bash
   # Create .env file with your Neynar API key
   echo "NEYNAR_API_KEY=your_api_key_here" > .env
   ```

3. **Start development servers**
   ```bash
   # Backend (port 4000)
   npm run dev
   
   # Frontend (port 3000) - in another terminal
   cd frontend && npm run dev
   ```

4. **Test the application**
   ```bash
   npm run test:backend
   npm run test:frontend
   ```

### Deployment

1. **Deploy to Vercel**
   ```bash
   npm run deploy
   ```

2. **Set environment variables in Vercel**
   - `NEYNAR_API_KEY`: Your Neynar API key

## 📊 API Endpoints

- `GET /health` - Health check
- `GET /api/user/:fid` - Get user data
- `GET /api/user/:fid/top-interactions` - Get top interactions
- `GET /api/users/bulk` - Get multiple users
- `GET /api/indexer/stats` - Get indexer statistics

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Server**: `server.js` - Simplified Express server
- **Indexer**: `neynar-indexer.js` - Neynar API integration with caching
- **Configuration**: `config.js` - Centralized configuration

### Frontend (Next.js + React)
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Components**: Radix UI components
- **Domain**: Configured for `quicktop8-alpha.vercel.app`

## 🔧 Configuration

### Environment Variables
- `NEYNAR_API_KEY`: Neynar API key (required)
- `PORT`: Server port (default: 4000)
- `NODE_ENV`: Environment (development/production)

### Domain Configuration
The app is configured for `quicktop8-alpha.vercel.app` with:
- CORS settings for the domain
- Farcaster miniapp metadata
- Optimized routing

## 🧪 Testing

```bash
# Run all tests
npm test

# Backend tests only
npm run test:backend

# Frontend tests only
npm run test:frontend

# Debug mode
npm run debug
```

## 📈 Performance Optimizations

- **Caching**: 10-minute TTL for API responses
- **Rate Limiting**: 500 RPM, 5 RPS
- **Batch Processing**: Efficient bulk user fetching
- **Error Handling**: Comprehensive error responses
- **Security**: Helmet.js for security headers

## 🐛 Debugging

```bash
# Run debug script
npm run debug

# Check API endpoints
curl https://quicktop8-alpha.vercel.app/health
curl https://quicktop8-alpha.vercel.app/api/user/4044
```

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**QuickTop8** - Discover your top Farcaster friends! 🚀 
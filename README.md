# Friends of Friends - Farcaster Mini App

Friends of Friends analyzes your Farcaster network to find your **top 8 closest friends** based on mutual affinity scores. It shows:

- **Your Top 8 Friends**: Ranked by mutual affinity scores
- **Affinity Scores**: Based on interactions, likes, recasts, and follows
- **Social Insights**: Discover who you truly connect with
- **Privacy First**: Your data stays private and secure

## 🚀 Live Demo

- **Web App**: https://friends-of-friends.vercel.app/app
- **Embed Page**: https://friends-of-friends.vercel.app/embed
- **Health Check**: https://friends-of-friends.vercel.app/api/health

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom gradients
- **APIs**: Neynar API for Farcaster data
- **Deployment**: Vercel
- **Mini App SDK**: @farcaster/miniapp-sdk

## 🏗️ Project Structure

```
friends-of-friends/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   └── lib/            # Utilities and hooks
│   ├── public/             # Static assets
│   └── package.json
├── scripts/                # Build and deployment scripts
└── package.json           # Root package.json
```

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd friends-of-friends
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   cp frontend/env.example frontend/.env
   ```
   
   Add your Neynar API key to `frontend/.env`:
   ```
   NEYNAR_API_KEY=your_api_key_here
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔧 API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/user/[fid]` - Get user profile data
- `GET /api/user/[fid]/top-interactions` - Get user's top interactions
- `GET /api/top8-simple` - Get top 8 friends for a user
- `GET /api/proxy-image` - Proxy image requests

## 🎨 Features

### Core Features
- **Smart Affinity Scoring**: Advanced algorithm based on mutual interactions
- **Real-time Data**: Live Farcaster data via Neynar API
- **Responsive Design**: Works on all devices
- **Mini App Integration**: Seamless Farcaster Mini App experience

### User Experience
- **Beautiful UI**: Modern gradient design with smooth animations
- **Loading States**: Engaging loading animations
- **Error Handling**: Graceful error handling with retry options
- **Share Functionality**: Easy sharing of results

### Technical Features
- **TypeScript**: Full type safety
- **Error Boundaries**: Robust error handling
- **Performance Optimized**: Fast loading and smooth interactions
- **SEO Optimized**: Proper meta tags and Open Graph

## 🔒 Privacy & Security

- **No Data Storage**: We don't store any user data
- **API Rate Limiting**: Respectful API usage
- **Secure Headers**: Proper security headers
- **Privacy First**: Your social data stays private

## 🚀 Deployment

The app is automatically deployed to Vercel:

1. **Production**: https://friends-of-friends.vercel.app
2. **Health Check**: https://friends-of-friends.vercel.app/api/health

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

If you encounter any issues:

1. Check the health endpoint: https://friends-of-friends.vercel.app/api/health
2. Review the troubleshooting guide in `TROUBLESHOOTING.md`
3. Open an issue on GitHub

---

**Friends of Friends** - Discover your true connections on Farcaster! 🤠

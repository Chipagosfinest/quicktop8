# QuickTop8 - Farcaster Mini App

A Farcaster Mini App that discovers your top 8 mutual follows with engagement history.

## 🎯 What it does

QuickTop8 analyzes your Farcaster network to find your **top 8 closest friends** based on mutual affinity scores. It shows:

- **Mutual affinity scores** (calculated by Neynar's algorithm)
- **Rank and relationship titles** (Ride or Die, Bestie, Squad Leader, etc.)
- **Profile information** (username, display name, bio, verification status)
- **Interaction statistics** (total interactions, recent activity)
- **Friends of friends** (their top connections)
- **Social insights** (follower counts, engagement patterns)

## 🚀 Live Demo

- **Mini App**: Available on Farcaster
- **Web App**: https://quicktop8-1bo6rg9l8-chipagosfinests-projects.vercel.app/app
- **Embed Page**: https://quicktop8-1bo6rg9l8-chipagosfinests-projects.vercel.app/embed
- **Health Check**: https://quicktop8-1bo6rg9l8-chipagosfinests-projects.vercel.app/api/health

## 🛠 Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **API**: Neynar API for Farcaster data
- **Deployment**: Vercel

## 📁 Project Structure

```
quicktop8/
├── frontend/                 # Next.js app
│   ├── src/
│   │   ├── app/             # App router pages
│   │   │   ├── api/         # API routes
│   │   │   │   ├── top8-simple/    # Main algorithm
│   │   │   │   ├── health/  # Health checks
│   │   │   │   ├── test/    # API testing
│   │   │   │   └── user/    # User data endpoints
│   │   │   ├── app/         # Main app page
│   │   │   └── embed/       # Embed page
│   │   ├── components/      # React components
│   │   │   ├── UserCard.tsx # User card component
│   │   │   └── StatsSection.tsx # Stats display
│   │   └── lib/            # Utilities
│   │       ├── types.ts     # TypeScript types
│   │       ├── utils.ts     # Utility functions
│   │       └── hooks/       # Custom hooks
│   │           └── useTop8.ts # Top 8 state management
│   └── public/
└── scripts/                # Utility scripts
```

## 🔧 Development

```bash
# Install dependencies
cd frontend && npm install

# Run development server
npm run dev

# Deploy to production
npx vercel --prod
```

## 📊 Algorithm

The app uses Neynar's sophisticated affinity scoring algorithm that:

1. **Analyzes mutual interactions** - Likes, recasts, replies between users
2. **Calculates affinity scores** - Based on interaction frequency and recency
3. **Ranks by mutual affinity** - Highest scoring relationships first
4. **Provides social insights** - Friends of friends and engagement patterns
5. **Generates relationship titles** - Ride or Die, Bestie, Squad Leader, etc.

## 🎨 Design

- Clean, modern UI with Tailwind CSS
- Responsive design for mobile and desktop
- Farcaster Mini App integration
- Professional card-based layout with rank badges
- Improved UX with scores below tip buttons
- Visual hierarchy with ranks above profile pictures

## 📈 Performance

- Optimized API calls with rate limiting
- Efficient data processing with modular architecture
- Fast response times (99.6 kB shared bundle)
- Scalable serverless architecture
- Clean, maintainable codebase with no unused endpoints
- TypeScript coverage with centralized types

## 🔐 Environment Variables

```env
NEYNAR_API_KEY=your_neynar_api_key
```

## 📄 License

MIT License # Force redeploy Mon Aug  4 15:08:34 EDT 2025

# QuickTop8 - Farcaster Mini App

A Farcaster Mini App that discovers your top 8 mutual follows with engagement history.

## 🎯 What it does

QuickTop8 analyzes your Farcaster network to find your **longest-standing mutual follows** who have engaged with your content. It shows:

- **Mutual follows** (users who follow each other)
- **First engagement** (like/recast) between you
- **Follow date** showing relationship duration
- **Total interactions** between users
- **Relationship score** based on duration + engagement

## 🚀 Live Demo

- **Mini App**: Available on Farcaster
- **Web App**: https://quicktop8-kzkbbps44-chipagosfinests-projects.vercel.app

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
│   │   │   │   ├── top8/    # Main algorithm
│   │   │   │   ├── webhook/ # Mini app webhook
│   │   │   │   └── health/  # Health checks
│   │   │   ├── app/         # Main app page
│   │   │   └── page.tsx     # Landing page
│   │   ├── components/      # React components
│   │   └── lib/            # Utilities
│   └── public/
│       └── .well-known/    # Farcaster manifest
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

The app uses a sophisticated algorithm that:

1. **Finds mutual follows** - Users who follow each other
2. **Tracks engagement** - First like/recast between mutual follows
3. **Calculates relationship score** - Based on follow duration + interactions
4. **Ranks by relationship strength** - Longest-standing relationships first

## 🎨 Design

- Clean, modern UI with Tailwind CSS
- Responsive design for mobile and desktop
- Farcaster Mini App integration
- Professional card-based layout

## 📈 Performance

- Optimized API calls with rate limiting
- Efficient data processing
- Fast response times
- Scalable serverless architecture

## 🔐 Environment Variables

```env
NEYNAR_API_KEY=your_neynar_api_key
```

## 📄 License

MIT License 
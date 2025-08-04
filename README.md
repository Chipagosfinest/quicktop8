# QuickTop8 - Farcaster Top 8 Friends Analyzer

A full-stack application that analyzes your Farcaster interactions to discover your Top 8 most interactive friends.

## 🚀 Features

- **Backend API**: Node.js/Express server with Neynar API integration
- **Frontend**: Next.js with shadcn/ui components
- **Real-time Analysis**: Analyzes likes, replies, and recasts
- **Beautiful UI**: Modern, responsive design with dark mode support
- **Top 8 Algorithm**: Ranks friends by total interactions and recency

## 📁 Project Structure

```
quicktop8/
├── server.js              # Backend Express server
├── package.json           # Backend dependencies
├── env.example           # Backend environment template
├── frontend/             # Next.js frontend application
│   ├── src/app/          # Next.js app directory
│   ├── src/components/   # shadcn/ui components
│   └── package.json      # Frontend dependencies
└── README.md             # This file
```

## 🛠️ Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Neynar API credentials

### Backend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your Neynar credentials:
   ```env
   NEYNAR_API_KEY=1E58A226-A64C-4CF3-A047-FBED94F36101
   NEYNAR_CLIENT_ID=b196e811-4d4a-4adb-bb5a-eb07dbd7765e
   PORT=4000
   ```

3. **Start the backend:**
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:4000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp env.example .env.local
   ```

4. **Start the frontend:**
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:3000`

## 🔧 API Endpoints

### Backend (Port 4000)

- `GET /health` - Server health check
- `GET /api/user/:fid` - Get user information
- `GET /api/user/:fid/followers` - Get user's followers
- `GET /api/user/:fid/following` - Get user's following
- `GET /api/user/:fid/casts` - Get user's casts
- `GET /api/search/users?q=query` - Search users
- `GET /api/trending/casts` - Get trending casts

### Frontend (Port 3000)

- `POST /api/top8` - Analyze user's Top 8 friends

## 🎯 How It Works

1. **User Input**: Enter your Farcaster ID (FID)
2. **Data Collection**: Backend fetches your recent casts from Neynar API
3. **Interaction Analysis**: Analyzes likes, replies, and recasts on your casts
4. **Ranking Algorithm**: Ranks friends by total interactions and recency
5. **Top 8 Display**: Shows your most interactive friends with detailed stats

## 🎨 UI Features

- **Responsive Design**: Works on desktop and mobile
- **Dark Mode**: Automatic theme detection
- **Interactive Cards**: Hover effects and smooth transitions
- **Real-time Feedback**: Loading states and error handling
- **Beautiful Gradients**: Purple to blue color scheme

## 🔍 Example Usage

1. Start both servers (backend on 4000, frontend on 3000)
2. Open `http://localhost:3000`
3. Enter a Farcaster ID (e.g., 194 for Dan Romero)
4. Click "Get Top 8" to analyze interactions
5. View your most interactive friends with detailed stats

## 🛡️ Security

- **API Key Protection**: Backend handles all Neynar API calls
- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Server-side validation for all inputs
- **Error Handling**: Comprehensive error responses

## 🚀 Deployment

### Backend Deployment

1. Set environment variables on your hosting platform
2. Deploy `server.js` and `package.json`
3. Ensure port 4000 is accessible

### Frontend Deployment

1. Update `BACKEND_URL` in environment variables
2. Deploy to Vercel, Netlify, or similar platform
3. Configure environment variables on hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Neynar API Documentation](https://docs.neynar.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/) 
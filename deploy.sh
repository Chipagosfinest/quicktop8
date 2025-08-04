#!/bin/bash

echo "🚀 Deploying QuickTop8..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🔧 Backend Deployment (Railway)..."
echo "1. Deploying backend from current directory..."

# Add Railway CLI to PATH if needed
export PATH="$PATH:$(npm bin -g)"

echo "2. Deploy to Railway..."
railway login
railway init
railway up

echo "🔧 Frontend Deployment (Vercel)..."
echo "1. Navigate to frontend directory"
cd frontend

echo "2. Deploy to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "Backend URL: Check Railway dashboard"
echo "Frontend URL: Check Vercel dashboard" 
#!/bin/bash

echo "🚀 QuickTop8 Simple Deploy"
echo "=========================="

# Build frontend
echo "Building frontend..."
cd frontend && npm run build && cd ..

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo "✅ Deployed!"
echo "🌐 Live at: https://quicktop8-alpha.vercel.app" 
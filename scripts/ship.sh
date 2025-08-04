#!/bin/bash

# 🚀 QuickTop8 Rapid Shipping Script
# Use this for quick deployments when you need to ship fast!

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 QuickTop8 Rapid Shipping${NC}"
echo "================================"

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  You're on branch: $CURRENT_BRANCH${NC}"
    echo -e "${YELLOW}   Consider switching to main for production deployment${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Quick checks
echo -e "${BLUE}📋 Quick Checks...${NC}"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    git status --short
    read -p "Commit changes? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "🚀 Quick ship: $(date)"
    else
        echo -e "${RED}❌ Aborting - please commit or stash changes${NC}"
        exit 1
    fi
fi

# Run quick tests
echo -e "${BLUE}🧪 Quick Tests...${NC}"
npm run test:backend || {
    echo -e "${RED}❌ Backend tests failed${NC}"
    exit 1
}

# Build frontend
echo -e "${BLUE}🏗️  Building Frontend...${NC}"
cd frontend && npm run build && cd .. || {
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
}

# Push to trigger CI/CD
echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
git push origin main || {
    echo -e "${RED}❌ Push failed${NC}"
    exit 1
}

echo -e "${GREEN}✅ Shipped!${NC}"
echo -e "${GREEN}🌐 Your app will be live at: https://quicktop8-alpha.vercel.app${NC}"
echo -e "${BLUE}📊 Monitor deployment: https://github.com/Chipagosfinest/quicktop8/actions${NC}"

# Optional: Wait and test
read -p "Wait for deployment and test? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}⏳ Waiting 60 seconds for deployment...${NC}"
    sleep 60
    
    echo -e "${BLUE}🧪 Testing deployment...${NC}"
    if curl -f -s https://quicktop8-alpha.vercel.app/api/user/4044 > /dev/null; then
        echo -e "${GREEN}✅ API is working!${NC}"
    else
        echo -e "${YELLOW}⚠️  API test failed - check deployment status${NC}"
    fi
fi

echo -e "${GREEN}🎉 Ship complete!${NC}" 
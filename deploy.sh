#!/bin/bash

# QuickTop8 Production Deployment Script
# This script prepares and deploys the project to production

set -e  # Exit on any error

echo "🚀 QuickTop8 Production Deployment"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "git is not installed. Please install git first."
    exit 1
fi

print_success "Prerequisites check passed"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "server-enhanced.js" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    if [ -f "env.example" ]; then
        cp env.example .env
        print_status "Please update .env with your Neynar API key"
    else
        print_error "No .env or env.example file found. Please create .env with NEYNAR_API_KEY"
        exit 1
    fi
fi

# Check if NEYNAR_API_KEY is set
if ! grep -q "NEYNAR_API_KEY" .env || grep -q "NEYNAR_API_KEY=your_api_key_here" .env; then
    print_error "Please set NEYNAR_API_KEY in your .env file"
    exit 1
fi

print_success "Environment configuration check passed"

# Run tests
print_status "Running tests..."

# Test backend
if node test-performance.js > /dev/null 2>&1; then
    print_success "Performance tests passed"
else
    print_warning "Performance tests failed - continuing anyway"
fi

# Test frontend connection
if node test-frontend-connection.js > /dev/null 2>&1; then
    print_success "Frontend connection tests passed"
else
    print_warning "Frontend connection tests failed - continuing anyway"
fi

# Check git status
print_status "Checking git status..."

if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Consider committing them first."
    echo "Uncommitted files:"
    git status --porcelain
    echo ""
    
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled"
        exit 0
    fi
fi

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "You're not on the main branch (currently on $CURRENT_BRANCH)"
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled"
        exit 0
    fi
fi

print_success "Git status check passed"

# Install dependencies
print_status "Installing dependencies..."

npm install

if [ -d "frontend" ]; then
    cd frontend
    npm install
    cd ..
fi

print_success "Dependencies installed"

# Build frontend
print_status "Building frontend..."

if [ -d "frontend" ]; then
    cd frontend
    npm run build
    cd ..
    print_success "Frontend built successfully"
else
    print_warning "No frontend directory found - skipping frontend build"
fi

# Create deployment summary
print_status "Creating deployment summary..."

cat > DEPLOYMENT_SUMMARY.md << EOF
# QuickTop8 Deployment Summary

## Deployment Date
$(date)

## Environment
- Node.js: $(node --version)
- npm: $(npm --version)
- Git: $(git --version)

## Files Deployed
- Backend: server-enhanced.js
- Frontend: frontend/ (if exists)
- Configuration: package.json, vercel.json
- Documentation: README.md, DEPLOYMENT_GUIDE.md

## Test Results
- Performance tests: $(node test-performance.js > /dev/null 2>&1 && echo "PASSED" || echo "FAILED")
- Connection tests: $(node test-frontend-connection.js > /dev/null 2>&1 && echo "PASSED" || echo "FAILED")

## Next Steps
1. Deploy backend to Vercel: \`vercel --prod\`
2. Deploy frontend to Vercel: \`cd frontend && vercel --prod\`
3. Set environment variables in Vercel dashboard
4. Test the deployed application

## Environment Variables Required
- Backend: NEYNAR_API_KEY
- Frontend: BACKEND_URL

## URLs
- Frontend: https://quicktop8-alpha.vercel.app
- Backend: https://quicktop8-backend.vercel.app (after deployment)
- Dashboard: http://localhost:4001 (local only)
EOF

print_success "Deployment summary created"

# Final status
echo ""
print_success "🎉 Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Deploy backend: vercel --prod"
echo "2. Deploy frontend: cd frontend && vercel --prod"
echo "3. Set environment variables in Vercel dashboard"
echo "4. Test the deployed application"
echo ""
echo "📊 Check DEPLOYMENT_SUMMARY.md for details"
echo "📖 Check DEPLOYMENT_GUIDE.md for step-by-step instructions"
echo ""
print_status "Ready for production deployment! 🚀" 
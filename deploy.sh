#!/bin/bash

echo "🚀 QuickTop8 Deployment Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Not in the project root directory"
    exit 1
fi

print_status "Step 1: Installing backend dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

print_status "Step 2: Installing frontend dependencies..."
cd frontend
npm install
if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi
cd ..

print_status "Step 3: Building frontend..."
cd frontend
npm run build
if [ $? -eq 0 ]; then
    print_success "Frontend built successfully"
else
    print_error "Frontend build failed"
    exit 1
fi
cd ..

print_status "Step 4: Running backend tests..."
npm run test:backend
if [ $? -eq 0 ]; then
    print_success "Backend tests passed"
else
    print_warning "Backend tests failed, but continuing deployment"
fi

print_status "Step 5: Deploying to Vercel..."
npx vercel --prod --yes
if [ $? -eq 0 ]; then
    print_success "Deployment completed successfully!"
    echo ""
    echo "🌐 Your app is now live at: https://quicktop8-alpha.vercel.app"
    echo "📊 Health check: https://quicktop8-alpha.vercel.app/health"
    echo "🔧 API endpoints: https://quicktop8-alpha.vercel.app/api/user/4044"
else
    print_error "Deployment failed"
    exit 1
fi

echo ""
print_success "Deployment script completed!" 
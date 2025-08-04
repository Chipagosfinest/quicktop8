#!/bin/bash

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run tests
run_tests() {
    print_status "Running comprehensive tests..."
    
    # Run our custom test script
    if node test-deployment.js; then
        print_success "All tests passed!"
        return 0
    else
        print_error "Tests failed! Please fix issues before deploying."
        return 1
    fi
}

# Function to check environment
check_environment() {
    print_status "Checking deployment environment..."
    
    # Check if we're in the right directory
    if [ ! -f "server.js" ] || [ ! -f "package.json" ]; then
        print_error "Not in the correct directory. Please run from project root."
        exit 1
    fi
    
    # Check for required environment variables
    if [ -z "$NEYNAR_API_KEY" ]; then
        print_warning "NEYNAR_API_KEY not set. Please set it before deployment."
    fi
    
    if [ -z "$NEYNAR_CLIENT_ID" ]; then
        print_warning "NEYNAR_CLIENT_ID not set. Please set it before deployment."
    fi
    
    print_success "Environment check completed"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing backend dependencies..."
    npm install
    
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    print_success "Dependencies installed"
}

# Function to deploy to Vercel
deploy_to_vercel() {
    print_status "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command_exists vercel; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy to Vercel
    if vercel --prod --yes; then
        print_success "Deployed to Vercel successfully"
    else
        print_error "Vercel deployment failed"
        return 1
    fi
}

# Function to show deployment status
show_status() {
    print_status "Deployment Status:"
    echo "Frontend & Backend: Vercel dashboard"
    echo ""
    print_status "Next steps:"
    echo "1. Check Vercel dashboard for deployment status"
    echo "2. Verify environment variables are set in Vercel"
    echo "3. Test the deployed application"
    echo "4. Use standardized domain: https://quicktop8-alpha.vercel.app"
}

# Main deployment function
main() {
    echo "🚀 Starting QuickTop8 deployment to Vercel..."
    echo ""
    
    # Step 1: Check environment
    check_environment
    
    # Step 2: Install dependencies
    install_dependencies
    
    # Step 3: Run comprehensive tests
    if ! run_tests; then
        print_error "Deployment aborted due to test failures."
        exit 1
    fi
    
    # Step 4: Deploy to Vercel
    if ! deploy_to_vercel; then
        print_error "Vercel deployment failed. Aborting."
        exit 1
    fi
    
    # Step 5: Show final status
    echo ""
    print_success "🎉 Deployment completed successfully!"
    show_status
}

# Run main function
main "$@" 
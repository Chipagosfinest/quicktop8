#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 QuickTop8 Debugging Tool\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.cyan}=== ${title} ===${colors.reset}`);
}

function checkFile(filePath, description) {
  log(`📁 ${description}: ${filePath}`, 'blue');
  if (fs.existsSync(filePath)) {
    log(`✅ Found`, 'green');
    return true;
  } else {
    log(`❌ Not found`, 'red');
    return false;
  }
}

function checkEnvironmentVariables() {
  logSection('Environment Check');
  
  // Check Node.js version
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    log(`Node.js version: ${nodeVersion}`, 'green');
  } catch (error) {
    log('❌ Node.js not found', 'red');
  }
  
  // Check npm version
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    log(`npm version: ${npmVersion}`, 'green');
  } catch (error) {
    log('❌ npm not found', 'red');
  }
  
  // Check environment variables
  log('\n🔧 Environment Variables:');
  const envVars = ['NEYNAR_API_KEY', 'NEYNAR_CLIENT_ID', 'PORT', 'NODE_ENV'];
  let missingVars = 0;
  envVars.forEach(envVar => {
    if (process.env[envVar]) {
      log(`✅ ${envVar} is set`, 'green');
    } else {
      log(`⚠️ ${envVar} is not set locally (should be set in production)`, 'yellow');
      missingVars++;
    }
  });
  
  if (missingVars > 0) {
    log(`\nℹ️ ${missingVars} environment variables not set locally`, 'blue');
    log('These will be set in production deployment (Vercel/Railway)', 'blue');
  }
}

function checkFileStructure() {
  logSection('File Structure Check');
  
  const criticalFiles = [
    { path: 'server.js', desc: 'Backend server' },
    { path: 'package.json', desc: 'Backend package.json' },
    { path: 'frontend/package.json', desc: 'Frontend package.json' },
    { path: 'frontend/next.config.ts', desc: 'Next.js config' },
    { path: 'frontend/src/app/page.tsx', desc: 'Main page component' },
    { path: 'deploy.sh', desc: 'Deployment script' },
    { path: 'test-api.js', desc: 'API test script' },
    { path: 'test-deployment.js', desc: 'Deployment test script' }
  ];
  
  let allFilesExist = true;
  criticalFiles.forEach(file => {
    if (!checkFile(file.path, file.desc)) {
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

function checkDependencies() {
  logSection('Dependencies Check');
  
  // Check backend dependencies
  log('\n🔧 Backend Dependencies:');
  try {
    const backendPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    log(`✅ package.json is valid`, 'green');
    log(`📦 Dependencies: ${Object.keys(backendPackage.dependencies || {}).length}`, 'blue');
    log(`🔧 Dev Dependencies: ${Object.keys(backendPackage.devDependencies || {}).length}`, 'blue');
  } catch (error) {
    log('❌ Invalid package.json', 'red');
  }
  
  // Check frontend dependencies
  log('\n🎨 Frontend Dependencies:');
  try {
    const frontendPackage = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
    log(`✅ package.json is valid`, 'green');
    log(`📦 Dependencies: ${Object.keys(frontendPackage.dependencies || {}).length}`, 'blue');
    log(`🔧 Dev Dependencies: ${Object.keys(frontendPackage.devDependencies || {}).length}`, 'blue');
  } catch (error) {
    log('❌ Invalid frontend package.json', 'red');
  }
}

function checkNetworkConnectivity() {
  logSection('Network Connectivity Check');
  
  const endpoints = [
    { url: 'https://api.neynar.com/v2/farcaster/user/bulk?fids=194', name: 'Neynar API' },
    { url: 'https://vercel.com', name: 'Vercel' }
  ];
  
  endpoints.forEach(endpoint => {
    log(`🌐 Testing ${endpoint.name}: ${endpoint.url}`, 'blue');
    // Note: In a real implementation, you'd use fetch or axios to test connectivity
    log(`⏳ Would test connectivity to ${endpoint.name}`, 'yellow');
  });
}

function checkServerStartup() {
  logSection('Server Startup Check');
  
  try {
    // Try to require the server module
    const server = require('./server.js');
    log('✅ Server module loads successfully', 'green');
    
    // Check if the server exports what we expect
    if (typeof server === 'object') {
      log('✅ Server exports are valid', 'green');
    }
  } catch (error) {
    log('❌ Server module failed to load:', 'red');
    log(`Error: ${error.message}`, 'red');
  }
}

function checkBuildProcess() {
  logSection('Build Process Check');
  
  // Check if we can build the frontend
  log('\n🎨 Frontend Build Test:');
  try {
    // Clean the Next.js cache first
    execSync('cd frontend && rm -rf .next', { stdio: 'pipe' });
    // Set NODE_ENV to production for the build
    execSync('cd frontend && NODE_ENV=production npm run build', { stdio: 'pipe' });
    log('✅ Frontend builds successfully', 'green');
  } catch (error) {
    log('❌ Frontend build failed:', 'red');
    log(error.message, 'red');
  }
  
  // Check if we can run backend tests
  log('\n🔧 Backend Test:');
  try {
    execSync('node test-api.js', { stdio: 'pipe' });
    log('✅ Backend tests pass', 'green');
  } catch (error) {
    log('❌ Backend tests failed:', 'red');
    log(error.message, 'red');
  }
}

function generateReport() {
  logSection('Debug Report Summary');
  
  log('\n📊 Issues Found:');
  log('1. Check environment variables are set', 'yellow');
  log('2. Ensure all dependencies are installed', 'yellow');
  log('3. Verify network connectivity', 'yellow');
  log('4. Test API endpoints', 'yellow');
  
  log('\n🔧 Common Fixes:');
  log('1. Run: npm install && cd frontend && npm install', 'blue');
  log('2. Set environment variables in .env file', 'blue');
  log('3. Check API keys are valid', 'blue');
  log('4. Ensure ports are available', 'blue');
  
  log('\n🚀 Next Steps:');
  log('1. Fix any issues found above', 'green');
  log('2. Run: node test-deployment.js', 'green');
  log('3. Run: bash deploy.sh', 'green');
}

// Main debugging function
async function runDebug() {
  log('Starting comprehensive debugging...\n');
  
  checkEnvironmentVariables();
  const filesOk = checkFileStructure();
  checkDependencies();
  checkNetworkConnectivity();
  checkServerStartup();
  checkBuildProcess();
  
  generateReport();
  
  if (!filesOk) {
    log('\n❌ Critical files missing. Please check file structure.', 'red');
    process.exit(1);
  }
  
  log('\n✅ Debugging complete!', 'green');
}

// Run debug if this script is executed directly
if (require.main === module) {
  runDebug();
}

module.exports = { runDebug }; 
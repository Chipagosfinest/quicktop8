#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Running comprehensive deployment tests...\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runTest(testName, command, cwd = process.cwd()) {
  log(`\n🔍 ${testName}...`, 'blue');
  try {
    const result = execSync(command, { 
      cwd, 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    log(`✅ ${testName} passed`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${testName} failed:`, 'red');
    console.log(error.stdout || error.message);
    return false;
  }
}

function checkFileExists(filePath) {
  log(`📁 Checking if ${filePath} exists...`, 'blue');
  if (fs.existsSync(filePath)) {
    log(`✅ ${filePath} exists`, 'green');
    return true;
  } else {
    log(`❌ ${filePath} not found`, 'red');
    return false;
  }
}

function checkEnvironmentVariables() {
  log('\n🔧 Checking environment variables...', 'blue');
  
  const requiredEnvVars = [
    'NEYNAR_API_KEY',
    'NEYNAR_CLIENT_ID'
  ];
  
  let allPresent = true;
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      log(`✅ ${envVar} is set`, 'green');
    } else {
      log(`⚠️ ${envVar} is not set locally (should be set in production)`, 'yellow');
      // Don't fail the test for missing env vars since they're set in production
      allPresent = false;
    }
  }
  
  // If we're in a CI/CD environment or production, we expect these to be set
  if (process.env.NODE_ENV === 'production' || process.env.CI) {
    if (!allPresent) {
      log('❌ Environment variables required in production', 'red');
      return false;
    }
  } else {
    log('ℹ️ Environment variables will be set in production deployment', 'blue');
  }
  
  return true;
}

// Main test execution
async function runAllTests() {
  let allTestsPassed = true;
  
  // 1. Check critical files exist
  log('\n📋 File Structure Tests', 'yellow');
  const criticalFiles = [
    'server.js',
    'package.json',
    'frontend/package.json',
    'frontend/next.config.ts',
    'frontend/src/app/page.tsx',
    'deploy.sh'
  ];
  
  for (const file of criticalFiles) {
    if (!checkFileExists(file)) {
      allTestsPassed = false;
    }
  }
  
  // 2. Check environment variables
  if (!checkEnvironmentVariables()) {
    allTestsPassed = false;
  }
  
  // 3. Test backend
  log('\n🔧 Backend Tests', 'yellow');
  if (!runTest('Backend dependencies installation', 'npm install')) {
    allTestsPassed = false;
  }
  
  if (!runTest('Backend API tests', 'node test-api.js')) {
    allTestsPassed = false;
  }
  
  if (!runTest('Backend URL validation', 'node scripts/validate-urls.js')) {
    allTestsPassed = false;
  }
  
  // 4. Test frontend
  log('\n🎨 Frontend Tests', 'yellow');
  if (!runTest('Frontend dependencies installation', 'npm install', './frontend')) {
    allTestsPassed = false;
  }
  
  if (!runTest('Frontend linting', 'npm run lint', './frontend')) {
    allTestsPassed = false;
  }
  
  if (!runTest('Frontend build', 'npm run build', './frontend')) {
    allTestsPassed = false;
  }
  
  // 5. Test deployment scripts
  log('\n🚀 Deployment Script Tests', 'yellow');
  if (!checkFileExists('deploy.sh')) {
    allTestsPassed = false;
  } else {
    // Make deploy script executable
    try {
      execSync('chmod +x deploy.sh');
      log('✅ Deploy script is executable', 'green');
    } catch (error) {
      log('❌ Failed to make deploy script executable', 'red');
      allTestsPassed = false;
    }
  }
  
  // 6. Test server startup (briefly)
  log('\n🖥️ Server Startup Test', 'yellow');
  try {
    const server = require('./server.js');
    log('✅ Server module loads successfully', 'green');
  } catch (error) {
    log('❌ Server module failed to load:', 'red');
    console.log(error.message);
    allTestsPassed = false;
  }
  
  // Final results
  log('\n📊 Test Results Summary', 'yellow');
  if (allTestsPassed) {
    log('🎉 All tests passed! Ready for deployment.', 'green');
    log('\nNext steps:', 'blue');
    log('1. Run: npm run deploy', 'blue');
    log('2. Or run: bash deploy.sh', 'blue');
    log('3. Check deployment status in Railway and Vercel dashboards', 'blue');
  } else {
    log('❌ Some tests failed. Please fix issues before deploying.', 'red');
    log('\nCommon fixes:', 'blue');
    log('1. Set required environment variables (already set in Vercel)', 'blue');
    log('2. Install missing dependencies', 'blue');
    log('3. Fix linting errors in frontend', 'blue');
    log('4. Ensure all files are present', 'blue');
  }
  
  return allTestsPassed;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runAllTests }; 
#!/usr/bin/env node

/**
 * URL Validation Script
 * 
 * This script validates that all URLs in the project
 * use the correct domain: quicktop8-alpha.vercel.app
 */

const fs = require('fs');
const path = require('path');

const CORRECT_DOMAIN = 'quicktop8-alpha.vercel.app';
const INCORRECT_DOMAINS = [
  'quicktop8-4qfi9ja5x-chipagosfinests-projects.vercel.app',
  'quicktop8-1kdm75eay-chipagosfinests-projects.vercel.app',
  'quicktop8-cv50bt82m-chipagosfinests-projects.vercel.app'
];

const FILES_TO_CHECK = [
  'frontend/src/app/layout.tsx',
  'frontend/public/.well-known/farcaster.json',
  'DEPLOYMENT.md',
  'README.md',
  'URLS.md',
  'setup-env.md',
  'DEPLOYMENT_SUCCESS.md',
  'MCP_INTEGRATION_SUMMARY.md',
  'MINI_APP_TEST_RESULTS.md',
  'NEYNAR_MCP_GUIDE.md'
];

function checkFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return { file: filePath, issues: [], status: 'not_found' };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  // Check for incorrect domains
  INCORRECT_DOMAINS.forEach(domain => {
    const regex = new RegExp(domain.replace(/\./g, '\\.'), 'g');
    const matches = content.match(regex);
    if (matches) {
      issues.push({
        type: 'incorrect_domain',
        domain: domain,
        count: matches.length,
        message: `Found ${matches.length} instances of incorrect domain: ${domain}`
      });
    }
  });

  // Check for correct domain
  const correctRegex = new RegExp(CORRECT_DOMAIN.replace(/\./g, '\\.'), 'g');
  const correctMatches = content.match(correctRegex);
  const correctCount = correctMatches ? correctMatches.length : 0;

  return {
    file: filePath,
    issues: issues,
    correctCount: correctCount,
    status: issues.length > 0 ? 'has_issues' : 'valid'
  };
}

function main() {
  console.log('🔍 Validating URLs in QuickTop8 project...\n');
  console.log(`✅ Correct domain: ${CORRECT_DOMAIN}`);
  console.log(`❌ Incorrect domains: ${INCORRECT_DOMAINS.join(', ')}\n`);

  let totalIssues = 0;
  let totalFiles = 0;
  let validFiles = 0;

  FILES_TO_CHECK.forEach(filePath => {
    const result = checkFile(filePath);
    totalFiles++;

    if (result.status === 'not_found') {
      console.log(`⚠️  ${filePath} - File not found`);
    } else if (result.status === 'has_issues') {
      console.log(`❌ ${filePath} - ${result.issues.length} issues found`);
      result.issues.forEach(issue => {
        console.log(`   - ${issue.message}`);
        totalIssues++;
      });
    } else {
      console.log(`✅ ${filePath} - Valid (${result.correctCount} correct URLs)`);
      validFiles++;
    }
  });

  console.log('\n📊 Summary:');
  console.log(`   Total files checked: ${totalFiles}`);
  console.log(`   Valid files: ${validFiles}`);
  console.log(`   Files with issues: ${totalFiles - validFiles}`);
  console.log(`   Total issues found: ${totalIssues}`);

  if (totalIssues === 0) {
    console.log('\n🎉 All URLs are consistent!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Please fix the issues above to ensure URL consistency.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkFile, CORRECT_DOMAIN, INCORRECT_DOMAINS }; 
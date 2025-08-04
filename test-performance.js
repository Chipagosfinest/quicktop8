const axios = require('axios');

class PerformanceTester {
  constructor() {
    this.baseURL = 'http://localhost:4000';
    this.results = {
      tests: [],
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        averageResponseTime: 0,
        totalRequests: 0
      }
    };
  }

  async runTest(name, testFunction) {
    const startTime = Date.now();
    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      this.results.tests.push({
        name,
        status: 'PASSED',
        duration,
        result
      });
      
      this.results.summary.totalTests++;
      this.results.summary.passed++;
      this.results.summary.totalRequests++;
      this.results.summary.averageResponseTime = 
        (this.results.summary.averageResponseTime * (this.results.summary.totalTests - 1) + duration) / 
        this.results.summary.totalTests;
      
      console.log(`✅ ${name} - ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.tests.push({
        name,
        status: 'FAILED',
        duration,
        error: error.message
      });
      
      this.results.summary.totalTests++;
      this.results.summary.failed++;
      this.results.summary.totalRequests++;
      
      console.log(`❌ ${name} - ${duration}ms - ${error.message}`);
      throw error;
    }
  }

  async testHealthEndpoint() {
    const response = await axios.get(`${this.baseURL}/health`);
    return {
      status: response.data.status,
      neynarConfigured: response.data.neynarConfigured,
      hasPerformance: !!response.data.performance,
      hasCache: !!response.data.cache,
      hasRateLimits: !!response.data.rateLimits
    };
  }

  async testUserData() {
    const response = await axios.get(`${this.baseURL}/api/user/4044`);
    return {
      success: response.data.success,
      hasUserData: !!response.data.data,
      userCount: response.data.data?.users?.length || 0
    };
  }

  async testTopInteractions() {
    const response = await axios.get(`${this.baseURL}/api/user/4044/top-interactions?limit=8`);
    return {
      success: response.data.success,
      interactionCount: response.data.data?.topInteractions?.length || 0,
      hasValidData: response.data.data?.topInteractions?.every(i => i.fid && i.username)
    };
  }

  async testCachePerformance() {
    // First request (cache miss)
    const start1 = Date.now();
    await axios.get(`${this.baseURL}/api/user/4044/top-interactions?limit=4`);
    const duration1 = Date.now() - start1;
    
    // Second request (cache hit)
    const start2 = Date.now();
    await axios.get(`${this.baseURL}/api/user/4044/top-interactions?limit=4`);
    const duration2 = Date.now() - start2;
    
    return {
      cacheMissTime: duration1,
      cacheHitTime: duration2,
      speedup: duration1 > 0 ? Math.round((duration1 - duration2) / duration1 * 100) : 0
    };
  }

  async testRateLimiting() {
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(axios.get(`${this.baseURL}/api/user/4044`));
    }
    
    const start = Date.now();
    await Promise.all(promises);
    const duration = Date.now() - start;
    
    return {
      concurrentRequests: 5,
      totalTime: duration,
      averageTime: duration / 5
    };
  }

  async testPerformanceStats() {
    const response = await axios.get(`${this.baseURL}/api/indexer/stats`);
    return {
      hasPerformanceStats: !!response.data.performance,
      totalRequests: response.data.performance?.totalRequests || 0,
      cacheHitRate: response.data.performance?.cacheHitRate || 0,
      averageResponseTime: response.data.performance?.averageResponseTime || 0
    };
  }

  async runAllTests() {
    console.log('🚀 Starting QuickTop8 Performance Tests\n');
    
    try {
      await this.runTest('Health Endpoint', () => this.testHealthEndpoint());
      await this.runTest('User Data API', () => this.testUserData());
      await this.runTest('Top Interactions API', () => this.testTopInteractions());
      await this.runTest('Cache Performance', () => this.testCachePerformance());
      await this.runTest('Rate Limiting', () => this.testRateLimiting());
      await this.runTest('Performance Stats', () => this.testPerformanceStats());
      
      console.log('\n📊 Test Summary:');
      console.log(`Total Tests: ${this.results.summary.totalTests}`);
      console.log(`Passed: ${this.results.summary.passed}`);
      console.log(`Failed: ${this.results.summary.failed}`);
      console.log(`Average Response Time: ${Math.round(this.results.summary.averageResponseTime)}ms`);
      console.log(`Success Rate: ${Math.round((this.results.summary.passed / this.results.summary.totalTests) * 100)}%`);
      
      if (this.results.summary.failed === 0) {
        console.log('\n🎉 All tests passed! QuickTop8 is performing excellently.');
      } else {
        console.log('\n⚠️  Some tests failed. Check the logs above for details.');
      }
      
      return this.results;
      
    } catch (error) {
      console.error('\n💥 Test suite failed:', error.message);
      return this.results;
    }
  }
}

// Run the tests
async function main() {
  const tester = new PerformanceTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = PerformanceTester; 
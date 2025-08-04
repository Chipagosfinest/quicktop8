import { NextResponse } from 'next/server'
import { getIndexer } from '@/lib/indexer'

export async function GET() {
  try {
    const indexer = getIndexer();
    
    const cacheStats = indexer.getCacheStats();
    const rateLimitStats = indexer.getRateLimitStats();
    const performanceStats = indexer.getPerformanceStats();
    
    return NextResponse.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      neynarConfigured: !!process.env.NEYNAR_API_KEY,
      cache: cacheStats,
      rateLimits: rateLimitStats,
      performance: performanceStats
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 
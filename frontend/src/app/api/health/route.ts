import { NextResponse } from 'next/server'
import { getNeynarClient } from '@/lib/neynar-client'

export async function GET() {
  try {
    const client = getNeynarClient();
    
    // Test the API connection
    let apiTest = false;
    try {
      // Try a simple API call to test connectivity
      await client.fetchBulkUsers({ fids: [1] });
      apiTest = true;
    } catch (error) {
      console.warn('API test failed:', error);
    }
    
    return NextResponse.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      neynarConfigured: !!process.env.NEYNAR_API_KEY,
      apiTest: apiTest,
      message: apiTest ? 'API connection successful' : 'API connection failed'
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
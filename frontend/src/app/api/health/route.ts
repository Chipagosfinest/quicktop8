import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      neynarConfigured: !!process.env.NEYNAR_API_KEY,
      message: 'QuickTop8 API is running'
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
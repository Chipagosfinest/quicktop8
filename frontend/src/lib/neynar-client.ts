import { NeynarAPIClient } from '@neynar/nodejs-sdk';

// Create a singleton Neynar client
let neynarClient: NeynarAPIClient | null = null;

export function getNeynarClient(): NeynarAPIClient {
  if (!neynarClient) {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      throw new Error('NEYNAR_API_KEY environment variable is required');
    }
    
    neynarClient = new NeynarAPIClient(apiKey);
  }
  
  return neynarClient;
}

export function resetNeynarClient(): void {
  neynarClient = null;
} 
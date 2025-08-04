import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';

// Create a singleton Neynar client
let neynarClient: NeynarAPIClient | null = null;

export function getNeynarClient(): NeynarAPIClient {
  if (!neynarClient) {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      throw new Error('NEYNAR_API_KEY environment variable is required');
    }
    
    const config = new Configuration({
      apiKey: apiKey,
    });
    
    neynarClient = new NeynarAPIClient(config);
  }
  
  return neynarClient;
}

export function resetNeynarClient(): void {
  neynarClient = null;
} 
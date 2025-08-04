import { NeynarIndexer } from './neynar-indexer';

// Create a singleton instance of the Neynar indexer
let indexerInstance: NeynarIndexer | null = null;

export function getIndexer(): NeynarIndexer {
  if (!indexerInstance) {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      throw new Error('NEYNAR_API_KEY environment variable is required');
    }
    
    indexerInstance = new NeynarIndexer(apiKey, {
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      retryAttempts: 3,
      retryDelay: 1000,
      batchSize: 100
    });
  }
  
  return indexerInstance;
}

export function resetIndexer(): void {
  indexerInstance = null;
} 
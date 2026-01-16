/**
 * Rate Limiting Utilities
 *
 * Provides delay and retry logic for API rate limiting.
 */

/**
 * Sleep for a specified number of milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Playlist size tiers with corresponding delays
 */
export const PLAYLIST_TIERS = {
  SMALL: { maxTracks: 200, delayMs: 50, label: 'small' },
  MEDIUM: { maxTracks: 600, delayMs: 150, label: 'medium' },
  MAX: { maxTracks: 600, delayMs: 150, label: 'max' }
} as const;

/**
 * Get the appropriate delay for a playlist size
 */
export function getDelayForPlaylistSize(trackCount: number): number {
  if (trackCount <= PLAYLIST_TIERS.SMALL.maxTracks) {
    return PLAYLIST_TIERS.SMALL.delayMs;
  }
  return PLAYLIST_TIERS.MEDIUM.delayMs;
}

/**
 * Check if playlist size is allowed
 */
export function isPlaylistSizeAllowed(trackCount: number): boolean {
  return trackCount <= PLAYLIST_TIERS.MAX.maxTracks;
}

/**
 * Get estimated conversion time in seconds
 */
export function getEstimatedTime(trackCount: number): number {
  const delayMs = getDelayForPlaylistSize(trackCount);
  // Each track: 1-2 API calls + delay
  // Assume average 1.5 calls per track, plus ~100ms per call overhead
  const avgTimePerTrack = (delayMs + 100) * 1.5;
  return Math.ceil((trackCount * avgTimePerTrack) / 1000);
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000
};

/**
 * Execute a function with exponential backoff retry
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Check if it's a rate limit error (429)
      const isRateLimited = error.response?.status === 429 ||
                           error.response?.status === 403;

      if (!isRateLimited || attempt === config.maxRetries) {
        throw error;
      }

      // Get retry delay from header or calculate exponential backoff
      const retryAfter = error.response?.headers?.['retry-after'];
      let delayMs: number;

      if (retryAfter) {
        delayMs = parseInt(retryAfter, 10) * 1000;
      } else {
        // Exponential backoff: 1s, 2s, 4s, etc.
        delayMs = Math.min(
          config.baseDelayMs * Math.pow(2, attempt),
          config.maxDelayMs
        );
      }

      console.log(`[RateLimit] Attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`);
      await delay(delayMs);
    }
  }

  throw lastError;
}

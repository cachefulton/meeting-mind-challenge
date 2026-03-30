const DEFAULT_API_URL = 'http://localhost:3001';

export function getApiUrl(): string {
  const url = process.env.API_URL;
  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('API_URL environment variable is required in production');
    }
    return DEFAULT_API_URL;
  }
  return url;
}

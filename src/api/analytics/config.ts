export const API_BASE_URL = import.meta.env.VITE_ANALYTICS_API_URL || 
  (import.meta.env.DEV 
    ? 'http://localhost:5000' 
    : 'https://kf-analytics-server.vercel.app')


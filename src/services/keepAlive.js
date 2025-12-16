import axios from 'axios';
import { config } from '../config/env.js';

export const startKeepAlive = () => {
  // Only run in production (Render)
  if (config.env === 'production') {
    const apiUrl = process.env.API_URL || 'https://ksit-ar-backend.onrender.com';
    
    // Ping every 14 minutes to prevent Render from sleeping
    const interval = 14 * 60 * 1000; // 14 minutes
    
    setInterval(async () => {
      try {
        const response = await axios.get(`${apiUrl}/health`, {
          timeout: 10000
        });
        console.log('[keepalive] Ping successful:', response.data);
      } catch (error) {
        console.error('[keepalive] Ping failed:', error.message);
      }
    }, interval);
    
    console.log(`[keepalive] Service started (pinging every ${interval / 60000} minutes)`);
  } else {
    console.log('[keepalive] Skipped (not in production)');
  }
};
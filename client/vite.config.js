import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Keep it running on port 3000
    open: true, // Auto-open browser on start
    proxy: {
      // This replaces the "proxy" field in package.json
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      // If you have other backend routes not starting with /api, add them here
    },
  },
});
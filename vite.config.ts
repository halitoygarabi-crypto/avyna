import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://localhost:5000',
          changeOrigin: true,
        },
        '/payment-success': {
          target: env.VITE_BACKEND_URL || 'http://localhost:5000',
          changeOrigin: true,
        },
        '/payment-fail': {
          target: env.VITE_BACKEND_URL || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify('AIzaSyCkUBREqhb9gZD9dELxdp_bg4T5eEUaXKQ'),
      'process.env.GEMINI_API_KEY': JSON.stringify('AIzaSyCkUBREqhb9gZD9dELxdp_bg4T5eEUaXKQ'),
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify('AIzaSyCkUBREqhb9gZD9dELxdp_bg4T5eEUaXKQ'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    // 复制_redirects文件到dist目录
    {
      name: 'copy-redirects',
      closeBundle() {
        const fs = require('fs');
        const distPath = path.resolve(__dirname, 'dist');
        const redirectsPath = path.resolve(__dirname, '_redirects');
        if (fs.existsSync(redirectsPath) && fs.existsSync(distPath)) {
          fs.copyFileSync(redirectsPath, path.join(distPath, '_redirects'));
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
      },
    },
  },
});


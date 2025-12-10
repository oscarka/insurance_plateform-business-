import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { existsSync, copyFileSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    // 复制_redirects文件到dist目录
    {
      name: 'copy-redirects',
      closeBundle() {
        try {
          const distPath = path.resolve(__dirname, 'dist');
          const redirectsPath = path.resolve(__dirname, '_redirects');
          if (existsSync(redirectsPath) && existsSync(distPath)) {
            copyFileSync(redirectsPath, path.join(distPath, '_redirects'));
            console.log('✅ _redirects文件已复制到dist目录');
          }
        } catch (error) {
          console.warn('⚠️ 复制_redirects文件失败:', error);
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


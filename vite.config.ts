import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        // 复制_redirects文件到dist目录
        {
          name: 'copy-redirects',
          closeBundle() {
            try {
              const { existsSync, copyFileSync } = require('fs');
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
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

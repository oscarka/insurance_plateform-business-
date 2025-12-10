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
            const fs = require('fs');
            const distPath = path.resolve(__dirname, 'dist');
            const redirectsPath = path.resolve(__dirname, '_redirects');
            if (fs.existsSync(redirectsPath) && fs.existsSync(distPath)) {
              fs.copyFileSync(redirectsPath, path.join(distPath, '_redirects'));
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

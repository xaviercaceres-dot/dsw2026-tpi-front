import process from 'node:process';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default ({ mode }) => {
  //const env = loadEnv(mode, process.cwd(), '');
  //const target = env.VITE_BACKEND_URL || 'http://localhost:5278';

  return defineConfig({
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5278',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react(), tailwindcss()],
  });
};

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // 拆分体积较大的第三方库，利用浏览器缓存加速后续访问
        manualChunks: {
          echarts: ['echarts'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled', 'react', 'react-dom']
        }
      }
    }
  }
})

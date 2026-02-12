import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // CORS muammolarini hal qilish uchun proxy konfiguratsiyasi
    // Real API bilan ishlashda VITE_USE_MOCK_DATA=false qilganingizda ishlatiladi
    proxy: {
      '/api': {
        target: 'https://8ed8-84-54-70-89.ngrok-free.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
            // Ngrok warning page ni o'tkazib yuborish uchun header qo'shish
            proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  }
})

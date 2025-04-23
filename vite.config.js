import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000 // หรือ Port ที่คุณต้องการให้ Frontend รัน
    // ลบส่วน proxy นี้ออกไป
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:7777', // <-- ลบตรงนี้
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, '/api'),
    //   },
    // }
  },
})
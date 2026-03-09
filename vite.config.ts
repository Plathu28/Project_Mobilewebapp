import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/Project_Mobilewebapp/', // <-- เพิ่มบรรทัดนี้ลงไป (เปลี่ยนเป็นชื่อ repo ของคุณ)
})
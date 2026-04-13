import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/client-portal/',
  server: {
    port: 5202,
    host: '0.0.0.0',
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: serve under repo name
// For custom domain or root, set base to '/'
export default defineConfig({
  plugins: [react()],
  base: '/onedelivery-frontend/',
})

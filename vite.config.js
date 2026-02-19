import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Uncomment and update with your repo name when deploying to GitHub Pages
  // base: '/valentine-card-maker/',
})
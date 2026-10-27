import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    // PostCSS config lives here instead of a separate postcss.config.js
    postcss: { plugins: [tailwindcss(), autoprefixer()] },
  },
  resolve: {
    // Keep in sync with "paths" in tsconfig.json
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})

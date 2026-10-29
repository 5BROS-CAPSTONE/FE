import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/gsap/') || id.includes('/node_modules/@gsap/')) return 'motion'
          if (/\/node_modules\/(react|react-dom|react-router|react-router-dom|@remix-run)\//.test(id))
            return 'framework'
        },
      },
    },
  },
  css: {
    // PostCSS config lives here instead of a separate postcss.config.js
    postcss: { plugins: [tailwindcss(), autoprefixer()] },
  },
  resolve: {
    // Keep in sync with "paths" in tsconfig.json
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})

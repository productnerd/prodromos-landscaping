import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/prodromos-landscaping/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        planting: resolve(__dirname, 'planting/index.html'),
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Self contained: the skill, its kit and this preview site all live in this folder
// Served at skills.klvn.dev/fun-isometric, so it builds into that folder and links under it
export default defineConfig({
  base: '/fun-isometric/',
  build: { outDir: 'dist/fun-isometric' },
  plugins: [react(), tailwindcss()],
})

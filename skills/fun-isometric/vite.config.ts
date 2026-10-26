import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Self contained: the skill, its kit and this preview site all live in this folder
export default defineConfig({
  plugins: [react()],
})

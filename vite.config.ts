import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { publicOverview } from './src/public/build.ts'

const base = `${(process.env.VITE_BASE_PATH || '/').replace(/\/+$/, '')}/`

// https://vite.dev/config/
export default defineConfig({
  base,
  appType: 'mpa',
  define: {
    'import.meta.env.VITE_GA_MEASUREMENT_ID': JSON.stringify(
      process.env.PAGES_PUBLISH === 'true'
        ? process.env.VITE_GA_MEASUREMENT_ID || ''
        : '',
    ),
  },
  plugins: [react(), publicOverview(base)],
})

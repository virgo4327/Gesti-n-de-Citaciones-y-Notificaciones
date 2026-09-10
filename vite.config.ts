import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Use the browser build of mammoth (avoids Node.js-only dependencies)
      'mammoth': `${import.meta.dirname}/node_modules/mammoth/mammoth.browser.js`,
    },
  },
})

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.PORT) || 5173
  const apiBase = env.VITE_API_BASE || env.API_BASE || 'https://gorkern.fun'

  return {
    plugins: [react()],
    server: {
      port,
      proxy: {
        '/api': {
          target: apiBase,
          changeOrigin: true,
        }
      }
    }
  }
})

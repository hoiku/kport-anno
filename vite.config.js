import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    base: '/kport-anno/',
    build: {
      outDir: 'dist'
    },
    define: {
      'import.meta.env': {
        VITE_SUPABASE_URL: JSON.stringify(env.VITE_SUPABASE_URL),
        VITE_SUPABASE_KEY: JSON.stringify(env.VITE_SUPABASE_KEY),
      }
    }
  }
})

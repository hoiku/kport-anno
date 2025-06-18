import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd()) // .env 값 로딩

  return {
    base: '/kport-anno/',
    build: {
      outDir: 'dist'
    },
    define: {
      'import.meta.env': env
    }
  }
})

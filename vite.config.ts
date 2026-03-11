import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ZigCel',
      fileName: 'zigcel',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: [], // No external dependencies to worry about yet
      output: {
        globals: {}
      }
    }
  }
})

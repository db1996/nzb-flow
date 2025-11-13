import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@ui': resolve('src/renderer/src/components/ui'),
        '@components': resolve('src/renderer/src/components'),
        '@composables': resolve('src/renderer/src/composables'),
        '@layout': resolve('src/renderer/src/layout'),
        '@utils': resolve('src/renderer/src/utils'),
        '@pages': resolve('src/renderer/src/pages'),
        '@main': resolve('src/main'),
      }
    },
    plugins: [vue(), tailwindcss()]
  }
})

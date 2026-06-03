import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

function htmlEnvPlugin(env) {
  return {
    name: 'html-env-replace',
    transformIndexHtml(html) {
      return html.replace(/__VITE_(\w+)__/g, (_, key) => env[`VITE_${key}`] ?? '');
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [
      vue(),
      vueDevTools(),
      htmlEnvPlugin(env),
    ],
    server: {
      port: 5173,
      strictPort: true,
      host: true
    },
    base: '/sharepoint-clone/',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
  }
})

import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

function htmlEnvPlugin(env) {
  return {
    name: 'html-env-replace',
    transformIndexHtml(html) {
      return html.replace(/__VITE_(\w+)__/g, (_, key) => env[`VITE_${key}`] ?? '')
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [
      vue(),
      vueDevTools(),
      htmlEnvPlugin(env),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: false,
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
          globIgnores: ['**/background.png'], // exclui a imagem grande
          navigateFallback: '/sharepoint-clone/index.html',
          navigateFallbackDenylist: [/^\/sharepoint-clone\/redirect\.html/],

          navigationPreload: false,

          runtimeCaching: [
            {
              // Fontes do Google
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
            {
              // Fontes estáticas
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
            {
              // Microsoft Graph API — lista de arquivos, drives, sites
              urlPattern: /^https:\/\/graph\.microsoft\.com\/v1\.0\/.*/i,
              handler: 'StaleWhileRevalidate', // serve cache, atualiza em background
              options: {
                cacheName: 'graph-api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24, // 24h
                },
                cacheableResponse: {
                  statuses: [0, 200], // cacheia só respostas OK
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    server: {
      port: 5173,
      strictPort: true,
      host: true,
    },
    base: '/sharepoint-clone/',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})

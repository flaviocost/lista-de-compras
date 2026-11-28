
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      workbox: {
      navigateFallback: 'index.html',
      cleanupOutdatedCaches: true,
      },


      
      manifest: {
        name: 'Lista de Compras',
        short_name: 'Compras',
        description: 'Organize suas listas de compras.',
        theme_color: '#2e4149',
        background_color: '#2e4149',
        display: 'standalone',
        start_url: '/',
        scope: '/',

        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})

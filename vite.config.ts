import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    laravel({
        input: [
            'resources/js/app.tsx', // Main app
            'resources/js/support-widget.tsx', // Support widget
        ],
      refresh: true,
    }),

      react(),
  ],
    build: {
        rollupOptions: {
            output: {
                entryFileNames: (chunkInfo) => {
                    // Output support-widget.tsx to public/js/support-widget.js
                    if (chunkInfo.name === 'support-widget') {
                        return 'js/support-widget.js';
                    }
                    return 'assets/[name]-[hash].js';
                },
            },
        },
    },
  resolve: {
    alias: {
      '@': '/resources/js',
    },
  },
});

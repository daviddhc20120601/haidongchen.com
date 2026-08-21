// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  build: {
    // Mermaid ships very large lazy diagram chunks; the app's own code is far
    // below this. Raise the bar so the warning flags real regressions only.
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Split React out of app code so a content-only deploy doesn't
        // invalidate it in visitors' caches. Deliberately NOT chunking the
        // markdown pipeline here: naming a manual chunk makes Vite emit a
        // modulepreload for it on every page, which would pull ~350 kB onto
        // the landing page that never renders markdown. Left alone, Rollup
        // derives it as a shared chunk of the lazy routes instead.
        // 'react-dom/client' is a distinct module id from 'react-dom' and has
        // to be listed explicitly or the renderer stays in the entry chunk.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-dom/client', 'react-router-dom'],
        },
      },
    },
  },
  plugins: [
    react(),
    {
      name: 'markdown-directory-listing',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url.startsWith('/api/list-files/')) {
            const directory = req.url.replace('/api/list-files/', '');
            const dirPath = path.join('public/content', directory);

            try {
              if (fs.existsSync(dirPath)) {
                const files = fs.readdirSync(dirPath)
                  .filter(file => file.endsWith('.md'));
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ files }));
                return;
              }
            } catch (error) {
              console.error(`Error listing directory ${dirPath}:`, error);
            }

            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Directory not found' }));
            return;
          }
          next();
        });
      }
    }
  ]
});
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

function cleanPageRoutes() {
  const redirectToDirectory = (req, res, next) => {
    const url = new URL(req.url, 'http://localhost');

    if (url.pathname === '/video' || url.pathname === '/compare' || url.pathname === '/refero') {
      res.statusCode = 302;
      res.setHeader('Location', `${url.pathname}/${url.search}`);
      res.end();
      return;
    }

    next();
  };

  return {
    name: 'clean-page-routes',
    configureServer(server) {
      server.middlewares.use(redirectToDirectory);
    },
    configurePreviewServer(server) {
      server.middlewares.use(redirectToDirectory);
    }
  };
}

export default defineConfig({
  base: './',
  appType: 'mpa',
  plugins: [cleanPageRoutes()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        video: resolve(import.meta.dirname, 'video/index.html'),
        compare: resolve(import.meta.dirname, 'compare/index.html'),
        refero: resolve(import.meta.dirname, 'refero/index.html')
      }
    }
  }
});

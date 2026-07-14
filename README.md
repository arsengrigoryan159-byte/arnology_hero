# Arnology Cinematic Hero — Fixed Package

This version removes the internal package-registry URLs from `package-lock.json`, pins Vercel to Node 20.x, and includes a public npm registry configuration.

## Clean local install

```bash
rm -rf node_modules
npm cache verify
npm ci --no-audit --no-fund
npm run dev
```

## Production build

```bash
npm run build
```

## Vercel

- Framework preset: Vite
- Node.js version: 20.x
- Install command: default
- Build command: `npm run build`
- Output directory: `dist`
- Redeploy once with build cache cleared after pushing these files.

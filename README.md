# Arnology Product Core Hero

A full-width, scroll-driven Three.js hero concept for Arnology.

## Concept

A near-realistic glass-and-metal **Product Core** assembles as the visitor scrolls:

1. Idea — the core and Arnology monogram appear.
2. Structure — architecture layers and traces align.
3. Engineering — machined frame, internal layers, and rear mechanism assemble.
4. Scale — service cartridges connect and the complete system expands.

The palette intentionally stays close to Arnology's restrained black, white, and blue visual language rather than using bright neon colors.

## Run locally

```bash
npm ci --no-audit --no-fund
npm run dev
```

## Production build

```bash
npm run build
```

Vercel settings:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Node.js: 20.x

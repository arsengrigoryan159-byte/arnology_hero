# Arnology Cinematic Hero

A full-width interactive 3D hero concept built with Vite and Three.js.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

Deploy the repository to Vercel with the default Vite settings.

## Interaction

- Move the cursor to shift the camera, lighting, and sculpture.
- Hover the floating modules to highlight them.
- Drag on the empty hero background to rotate the sculpture.
- Reduced-motion preferences are respected.

## Main files

- `index.html` — overlay copy and navigation
- `src/style.css` — responsive layout and interface styling
- `src/main.js` — Three.js scene, animation, hover, drag, and parallax

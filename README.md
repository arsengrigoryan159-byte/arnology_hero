# Arnology Hero Comparison

Static Vercel-ready project that preserves the current Product Core at the root URL and adds the refined video concept as a separate route.

- `/` — unchanged build of the currently deployed Three.js Product Core.
- `/video/` — refined cinematic workspace hero using the generated video.
- `/compare/` — comparison landing page linking to both.
- `/refero/` — warm editorial Product Intelligence concept with an interactive generative signal-field hero.
- `/slfstorage/` — responsive SlfStrg operations landing page with an illustrative lead-to-signed workflow.
- `/slfstorage/book-demo/` — in-app preferred-time scheduler backed by a Vercel demo-request function.
- `/product-core/` — optional alias back to the original root version.

## Vercel

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

Add these environment variables to the Vercel project before deploying:

- `NEXT_PUBLIC_APP_URL` — absolute HTTPS URL for the existing sign-in application.
- `RESEND_API_KEY` — Resend API key used only by the server-side demo request function.
- `DEMO_REQUEST_TO_EMAIL` — inbox that should receive demo requests.
- `DEMO_REQUEST_FROM_EMAIL` — a sender on a domain verified in Resend, such as `SlfStrg Demo <demo@example.com>`.

After deployment, the landing page is available at `/slfstorage/` and its scheduler at `/slfstorage/book-demo/`.

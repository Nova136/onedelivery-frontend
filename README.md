# onedelivery-frontend

Admin dashboard for the OneDelivery delivery system. Built with Vite, React, and TypeScript.

## Setup

```bash
nvm use
npm install
```

## Scripts

- **`npm run dev`** — Start dev server (default: http://localhost:5173)
- **`npm run build`** — Production build (output in `dist/`)
- **`npm run preview`** — Preview production build locally

## Hosting on GitHub Pages

1. In your GitHub repo: **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to the `main` branch (or trigger the workflow manually). The **Deploy to GitHub Pages** workflow will build and deploy the app.
4. The site will be available at:  
   `https://<your-username>.github.io/onedelivery-frontend/`

If you use a different repo name, update `base` in `vite.config.ts` and `basename` in `src/main.tsx` to match (e.g. `'/your-repo-name/'`).

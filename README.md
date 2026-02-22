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

## API / Backend

The app calls a backend API. Routes use **path stripping** on the backend/proxy; the frontend uses these paths: `/order`, `/logistics`, `/payment`, `/audit`, `/user`.

- **Local:** Backend base URL is **`http://localhost:8000`** (see `.env.development`). Run your backend on port 8000.
- **Production:** Set **`VITE_API_BASE_URL`** in your build environment (e.g. `.env.production` or CI) to your backend URL. Example: `VITE_API_BASE_URL=https://api.yourdomain.com`

Copy `.env.example` to `.env.local` if you need to override the base URL locally.

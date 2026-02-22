/**
 * API base URL.
 * - Local: http://localhost:8000 (routes: /order, /logistics, /payment, /audit, /user, with path stripping on backend/proxy)
 * - Production: set VITE_API_BASE_URL in .env.production
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:8000'

/** Backend route paths (no leading slash; joined with API_BASE_URL). */
export const API_ROUTES = {
  order: '/order',
  logistics: '/logistics',
  payment: '/payment',
  audit: '/audit',
  user: '/user',
} as const

import { getAuthToken } from './auth'
import { API_BASE_URL, API_ROUTES } from './config'

type RouteKey = keyof typeof API_ROUTES

/**
 * Resolves a backend path. Use route keys so paths stay consistent with backend
 * (/order, /logistics, /payment, /audit, /user). Path stripping is handled
 * by the backend or reverse proxy.
 */
export function apiPath(route: RouteKey, subpath = ''): string {
  const path = `${API_ROUTES[route]}${subpath}`.replace(/\/+/g, '/')
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: object | string
}

/**
 * Request to the backend. Pass route key and optional subpath (e.g. '' or '/123').
 */
export async function apiRequest<T = unknown>(
  route: RouteKey,
  subpathOrOptions?: string | RequestOptions,
  options?: RequestOptions
): Promise<T> {
  const subpath = typeof subpathOrOptions === 'string' ? subpathOrOptions : ''
  const opts = (typeof subpathOrOptions === 'object' ? subpathOrOptions : options) ?? {}
  const url = apiPath(route, subpath)
  const { body, ...init } = opts
  const token = getAuthToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opts.headers,
  }
  const res = await fetch(url, {
    ...init,
    headers,
    body: body !== undefined
      ? typeof body === 'string'
        ? body
        : JSON.stringify(body)
      : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text || res.statusText}`)
  }
  const contentType = res.headers.get('Content-Type')
  if (contentType?.includes('application/json')) return res.json() as Promise<T>
  return res.text() as Promise<T>
}

/** GET request to a backend route */
export function apiGet<T = unknown>(route: RouteKey, subpath = '', init?: RequestOptions) {
  return apiRequest<T>(route, subpath, { ...init, method: 'GET' })
}

/** POST request to a backend route */
export function apiPost<T = unknown>(
  route: RouteKey,
  body?: object,
  subpath = '',
  init?: RequestOptions
) {
  return apiRequest<T>(route, subpath, { ...init, method: 'POST', body })
}

/** PUT request to a backend route */
export function apiPut<T = unknown>(
  route: RouteKey,
  subpath: string,
  body?: object,
  init?: RequestOptions
) {
  return apiRequest<T>(route, subpath, { ...init, method: 'PUT', body })
}

/** DELETE request to a backend route */
export function apiDelete<T = unknown>(route: RouteKey, subpath = '', init?: RequestOptions) {
  return apiRequest<T>(route, subpath, { ...init, method: 'DELETE' })
}

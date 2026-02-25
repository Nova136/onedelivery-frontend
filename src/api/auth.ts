/**
 * Auth types and API calls from User service Swagger (LoginDto, RegisterDto).
 * Endpoints: POST /user/login, POST /user/register, GET /user/me
 */

import { API_BASE_URL } from './config'

const USER_BASE = `${API_BASE_URL.replace(/\/$/, '')}/user`

const AUTH_STORAGE_KEY = 'onedelivery_token'

/** Login request body (LoginDto) */
export interface LoginDto {
  email: string
  password: string
}

/** Register request body (RegisterDto) */
export interface RegisterDto {
  email: string
  password: string
  role?: 'Admin' | 'User'
}

/** Expected login response (access token); backend may use snake_case access_token */
export interface LoginResponse {
  accessToken?: string
  access_token?: string
  token?: string
  role?: string
  userId?: string
  email?: string
}

/** Current user from GET /user/me (shape may vary; minimal) */
export interface MeResponse {
  email: string
  role?: string
  [key: string]: unknown
}

function getToken(): string | null {
  return sessionStorage.getItem(AUTH_STORAGE_KEY)
}

export function setAuthToken(token: string): void {
  sessionStorage.setItem(AUTH_STORAGE_KEY, token)
}

export function clearAuthToken(): void {
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
}

/** For use by api client to attach Bearer token */
export function getAuthToken(): string | null {
  return getToken()
}

/** POST /user/login */
export async function loginApi(body: LoginDto): Promise<LoginResponse> {
  const res = await fetch(`${USER_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Login failed: ${res.status}`)
  }
  const data = (await res.json()) as LoginResponse
  const token = data.accessToken ?? data.access_token ?? data.token
  return { ...data, accessToken: token }
}

/** POST /user/register */
export async function registerApi(body: RegisterDto): Promise<void> {
  const res = await fetch(`${USER_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Registration failed: ${res.status}`)
  }
}

/** GET /user/me (requires Bearer token) */
export async function meApi(): Promise<MeResponse> {
  const token = getToken()
  if (!token) throw new Error('Not authenticated')
  const res = await fetch(`${USER_BASE}/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) {
    if (res.status === 401) {
      clearAuthToken()
      throw new Error('Session expired')
    }
    const text = await res.text()
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<MeResponse>
}

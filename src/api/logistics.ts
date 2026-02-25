/**
 * Logistics API types and calls from Swagger (GET /products).
 * Schemas: ProductItemDto, PaginationMetaDto, ListProductsResponseDto
 */

import { getAuthToken } from './auth'
import { API_BASE_URL } from './config'

const BASE = API_BASE_URL.replace(/\/$/, '')

/** Product item (ProductItemDto) */
export interface ProductItemDto {
  id: string
  name: string
  description: string | null
  sku: string
  price: number
  active: boolean
  createdAt: string
  updatedAt: string
}

/** Pagination metadata (PaginationMetaDto) */
export interface PaginationMetaDto {
  page: number
  limit: number
  total: number
  totalPages: number
}

/** List products response (ListProductsResponseDto) */
export interface ListProductsResponseDto {
  data: ProductItemDto[]
  pagination: PaginationMetaDto
}

/**
 * GET /logistics/products?page=&limit=
 */
export async function listProductsApi(
  page = 1,
  limit = 20
): Promise<ListProductsResponseDto> {
  const url = new URL(`${BASE}/logistics/products`)
  url.searchParams.set('page', String(page))
  url.searchParams.set('limit', String(limit))
  const token = getAuthToken()
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Products request failed: ${res.status}`)
  }
  return res.json() as Promise<ListProductsResponseDto>
}

/**
 * Order API types and calls.
 * GET order/orders – list orders; POST order/send-order – submit new order.
 * Schemas: OrderItemInputDto, CreateOrderRequestDto
 */

import { apiGet, apiPost } from './client'

/** Line item for create order (OrderItemInputDto) */
export interface OrderItemInputDto {
  productId: string
  quantity: number
  price: number
}

/** Create order request body (CreateOrderRequestDto) */
export interface CreateOrderRequestDto {
  items: OrderItemInputDto[]
  deliveryAddress: string
}

/** Order list item (GET /order response – shape may vary by backend) */
export interface OrderListItemDto {
  id: string
  deliveryAddress?: string
  items?: Array<{ productId: string; quantity: number; price: number }>
  status?: string
  createdAt?: string
  total?: number
  [key: string]: unknown
}

/** POST order/send-order – submit new order (Bearer required) */
export async function createOrderApi(body: CreateOrderRequestDto): Promise<void> {
  await apiPost('order', body, '/send-order')
}

/** GET order/orders – list orders for current user (Bearer required) */
export async function listMyOrdersApi(): Promise<OrderListItemDto[]> {
  const res = await apiGet<OrderListItemDto[] | { data?: OrderListItemDto[] }>('order', '/orders')
  if (Array.isArray(res)) return res
  if (res && typeof res === 'object' && Array.isArray((res as { data?: OrderListItemDto[] }).data)) {
    return (res as { data: OrderListItemDto[] }).data
  }
  return []
}

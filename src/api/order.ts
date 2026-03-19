/**
 * Order API types and calls.
 * GET order/orders – list orders; POST order/send-order – submit new order.
 * Schemas: OrderItemInputDto, CreateOrderRequestDto
 */

import { apiGet, apiPost } from './client'

/** Line item for create order */
export interface OrderItemInputDto {
  productId: string
  productName: string
  quantity: number
  price: number
}

/** Create order request body (CreateOrderDto) */
export interface CreateOrderRequestDto {
  items: OrderItemInputDto[]
  deliveryAddress: string
  priorityOption?: string
}

/** Order list item (GET /order/orders response) */
export interface OrderListItemDto {
  orderId: string
  status?: string
  customerId?: string
  deliveryAddress?: string
  priorityOption?: string
  transactionId?: string
  createdAt?: string
  items?: Array<{ productId: string; quantity: number; price: number }>
  [key: string]: unknown
}

/** Delivery priority option (GET /order/priority-options) */
export interface PriorityOption {
  sku: string
  name: string
  description: string
  price: number
}

/** GET logistics/priority-options – available delivery speeds */
export async function listPriorityOptionsApi(): Promise<PriorityOption[]> {
  return apiGet<PriorityOption[]>('logistics', '/priority-options')
}

/** POST order/send-order – submit new order (Bearer required) */
export async function createOrderApi(body: CreateOrderRequestDto): Promise<void> {
  await apiPost('order', body, '/send-order')
}

/** GET order/orders – list orders for current user (Bearer required) */
export async function listMyOrdersApi(): Promise<OrderListItemDto[]> {
  const res = await apiGet<
    OrderListItemDto[] | { orders?: OrderListItemDto[]; data?: OrderListItemDto[] }
  >('order', '/orders')
  if (Array.isArray(res)) return res
  if (res && typeof res === 'object') {
    const obj = res as { orders?: OrderListItemDto[]; data?: OrderListItemDto[] }
    if (Array.isArray(obj.orders)) return obj.orders
    if (Array.isArray(obj.data)) return obj.data
  }
  return []
}

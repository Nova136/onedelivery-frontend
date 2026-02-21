import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export interface Order {
  id: string
  customerId: string
  customer: string
  items: number
  total: string
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled'
  description?: string
}

const initialOrders: Order[] = [
  { id: 'ORD-1001', customerId: 'customer', customer: 'Customer', items: 3, total: '$42.50', status: 'pending' },
  { id: 'ORD-1002', customerId: 'customer', customer: 'Customer', items: 1, total: '$18.00', status: 'in-transit' },
  { id: 'ORD-1003', customerId: 'customer', customer: 'Customer', items: 5, total: '$89.20', status: 'delivered' },
  { id: 'ORD-1004', customerId: 'other', customer: 'Other User', items: 2, total: '$31.00', status: 'cancelled' },
]

let nextId = 1005

interface OrdersContextValue {
  orders: Order[]
  addOrder: (customerId: string, customerName: string, items: number, total: string, description?: string) => Order
}

const OrdersContext = createContext<OrdersContextValue | null>(null)

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)

  const addOrder = useCallback(
    (customerId: string, customerName: string, items: number, total: string, description?: string): Order => {
      const id = `ORD-${nextId++}`
      const newOrder: Order = {
        id,
        customerId,
        customer: customerName,
        items,
        total,
        status: 'pending',
        description,
      }
      setOrders((prev) => [newOrder, ...prev])
      return newOrder
    },
    []
  )

  return (
    <OrdersContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const ctx = useContext(OrdersContext)
  if (!ctx) throw new Error('useOrders must be used within OrdersProvider')
  return ctx
}

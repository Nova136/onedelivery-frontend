import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { listMyOrdersApi, type OrderListItemDto } from '../api/order'

function formatDate(iso: string | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function orderTotal(items: OrderListItemDto['items']): string {
  if (!items?.length) return '—'
  const sum = items.reduce((s, i) => s + (i.quantity ?? 0) * (i.price ?? 0), 0)
  return `$${sum.toFixed(2)}`
}

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderListItemDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    listMyOrdersApi()
      .then((data) => {
        if (!cancelled) setOrders(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load orders')
          setOrders([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const isAdmin = user?.role === 'admin'

  if (loading) {
    return (
      <>
        <header className="page-header">
          <h1>{isAdmin ? 'All orders' : 'My orders'}</h1>
          <p>Orders for the current user (GET /order)</p>
        </header>
        <div className="table-wrap">
          <div className="empty-state">Loading orders…</div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <header className="page-header">
          <h1>{isAdmin ? 'All orders' : 'My orders'}</h1>
          <p>Orders for the current user (GET /order)</p>
        </header>
        <div className="table-wrap">
          <div className="empty-state" style={{ color: 'var(--danger)' }}>{error}</div>
        </div>
      </>
    )
  }

  return (
    <>
      <header className="page-header">
        <h1>{isAdmin ? 'All orders' : 'My orders'}</h1>
        <p>{orders.length} order{orders.length !== 1 ? 's' : ''} (GET /order – current user)</p>
      </header>
      {orders.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">
            <p style={{ fontWeight: 600, margin: 0 }}>No orders yet</p>
            <p>Place an order to see it here.</p>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Delivery address</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong></td>
                  <td>{order.deliveryAddress ?? '—'}</td>
                  <td>{order.items?.length ?? 0}</td>
                  <td>{orderTotal(order.items)}</td>
                  <td>
                    {order.status ? (
                      <span className={`status ${String(order.status).toLowerCase().replace(/\s+/g, '-')}`}>
                        {order.status}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

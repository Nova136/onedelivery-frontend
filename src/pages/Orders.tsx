import { Fragment, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { listMyOrdersApi, listPriorityOptionsApi, type OrderListItemDto, type PriorityOption } from '../api/order'
import './Orders.css'

function formatDate(iso: string | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

interface PriorityInfo { name: string; price: number }

function calcTotal(
  items: OrderListItemDto['items'],
  prioritySku: string | undefined,
  prioMap: Record<string, PriorityInfo>,
): string {
  const itemsSum = (items ?? []).reduce(
    (s, i) => s + (i.quantityOrdered ?? 0) * (i.price ?? 0),
    0,
  )
  const refundSum = (items ?? []).reduce(
    (s, i) => s + (i.quantityRefunded ?? 0) * (i.price ?? 0),
    0,
  )
  const prioPrice = prioritySku ? (prioMap[prioritySku]?.price ?? 0) : 0
  const total = itemsSum - refundSum + prioPrice
  return total > 0 ? `$${total.toFixed(2)}` : '—'
}

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderListItemDto[]>([])
  const [priorityMap, setPriorityMap] = useState<Record<string, PriorityInfo>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([
      listMyOrdersApi(),
      listPriorityOptionsApi().catch(() => [] as PriorityOption[]),
    ])
      .then(([data, priorities]) => {
        if (cancelled) return
        setOrders(data)
        const map: Record<string, PriorityInfo> = {}
        priorities.forEach((p) => { map[p.sku] = { name: p.name, price: p.price } })
        setPriorityMap(map)
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
                <th>Priority</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const isExpanded = expandedId === order.orderId
                const prioInfo = order.priorityOption ? priorityMap[order.priorityOption] : undefined
                return (
                  <Fragment key={order.orderId}>
                    <tr
                      className="order-row"
                      onClick={() => setExpandedId(isExpanded ? null : order.orderId)}
                    >
                      <td>
                        <span className={`expand-chevron${isExpanded ? ' open' : ''}`}>&#9654;</span>
                        <strong>{order.orderId}</strong>
                      </td>
                      <td>{order.deliveryAddress ?? '—'}</td>
                      <td>{prioInfo?.name ?? order.priorityOption ?? '—'}</td>
                      <td>{order.items?.length ?? 0}</td>
                      <td>{calcTotal(order.items, order.priorityOption, priorityMap)}</td>
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
                    {isExpanded && (
                      <tr className="order-detail-row">
                        <td colSpan={7}>
                          <div className="order-detail">
                            {order.items && order.items.length > 0 ? (
                              <table className="order-items-table">
                                <thead>
                                  <tr>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Unit price</th>
                                    <th>Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.items.map((item) => (
                                    <Fragment key={item.id}>
                                      <tr>
                                        <td>{item.productName}</td>
                                        <td>{item.quantityOrdered}</td>
                                        <td>${Number(item.price).toFixed(2)}</td>
                                        <td>${(item.quantityOrdered * item.price).toFixed(2)}</td>
                                      </tr>
                                      {item.quantityRefunded > 0 && (
                                        <tr className="refund-row">
                                          <td>Refund – {item.productName}</td>
                                          <td>-{item.quantityRefunded}</td>
                                          <td>${Number(item.price).toFixed(2)}</td>
                                          <td>-${(item.quantityRefunded * item.price).toFixed(2)}</td>
                                        </tr>
                                      )}
                                    </Fragment>
                                  ))}
                                  {prioInfo && (
                                    <tr className="priority-row">
                                      <td>{prioInfo.name}</td>
                                      <td>1</td>
                                      <td>${Number(prioInfo.price).toFixed(2)}</td>
                                      <td>${Number(prioInfo.price).toFixed(2)}</td>
                                    </tr>
                                  )}
                                  <tr className="total-row">
                                    <td colSpan={3}><strong>Total</strong></td>
                                    <td><strong>{calcTotal(order.items, order.priorityOption, priorityMap)}</strong></td>
                                  </tr>
                                </tbody>
                              </table>
                            ) : (
                              <p className="no-items">No items in this order.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

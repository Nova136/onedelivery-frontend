import { useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useOrders } from '../contexts/OrdersContext'

export default function Orders() {
  const { user } = useAuth()
  const { orders } = useOrders()

  const visibleOrders = useMemo(() => {
    if (!user) return []
    if (user.role === 'admin') return orders
    return orders.filter((o) => o.customerId === user.username)
  }, [user, orders])

  const isAdmin = user?.role === 'admin'

  return (
    <>
      <header className="page-header">
        <h1>{isAdmin ? 'All orders' : 'My orders'}</h1>
        <p>{isAdmin ? 'Orders from all customers' : 'View and track your orders'}</p>
      </header>
      {visibleOrders.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">
            <p style={{ fontWeight: 600, margin: 0 }}>No orders yet</p>
            <p>{isAdmin ? 'No orders in the system.' : 'Place an order to see it here.'}</p>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                {isAdmin && <th>Customer</th>}
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong></td>
                  {isAdmin && <td>{order.customer}</td>}
                  <td>{order.items}</td>
                  <td>{order.total}</td>
                  <td><span className={`status ${order.status}`}>{order.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

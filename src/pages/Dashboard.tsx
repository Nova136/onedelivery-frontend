import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useOrders } from '../contexts/OrdersContext'
import { useMemo } from 'react'

export default function Dashboard() {
  const { user } = useAuth()
  const { orders } = useOrders()

  const myOrderCount = useMemo(() => {
    if (!user || user.role !== 'customer') return 0
    return orders.filter((o) => o.customerId === user.username).length
  }, [user, orders])

  const isAdmin = user?.role === 'admin'

  if (isAdmin) {
    const stats = [
      { label: 'Orders today', value: String(orders.length), link: '/orders' },
      { label: 'Active deliveries', value: '8', link: '/deliveries' },
      { label: 'Drivers online', value: '5', link: '/drivers' },
      { label: 'Completed today', value: '16', link: '/deliveries' },
    ]
    return (
      <>
        <header className="page-header">
          <h1>Dashboard</h1>
          <p>Overview of your delivery system</p>
        </header>
        <div className="card-grid">
          {stats.map(({ label, value, link }) => (
            <Link to={link} key={label} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <p className="card-title">{label}</p>
              <p className="card-value">{value}</p>
            </Link>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Place an order or track your deliveries</p>
      </header>
      <div className="card-grid">
        <Link to="/order" className="card card-cta" style={{ textDecoration: 'none', color: 'inherit' }}>
          <p className="card-title">New order</p>
          <p className="card-value">Place order</p>
        </Link>
        <Link to="/orders" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <p className="card-title">My orders</p>
          <p className="card-value">{myOrderCount}</p>
        </Link>
      </div>
    </>
  )
}

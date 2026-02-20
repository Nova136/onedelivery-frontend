import { Link } from 'react-router-dom'

export default function Dashboard() {
  const stats = [
    { label: 'Orders today', value: '24', link: '/orders' },
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

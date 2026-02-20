const orders = [
  { id: 'ORD-1001', customer: 'Jane Doe', items: 3, total: '$42.50', status: 'pending' },
  { id: 'ORD-1002', customer: 'John Smith', items: 1, total: '$18.00', status: 'in-transit' },
  { id: 'ORD-1003', customer: 'Alice Lee', items: 5, total: '$89.20', status: 'delivered' },
  { id: 'ORD-1004', customer: 'Bob Chen', items: 2, total: '$31.00', status: 'cancelled' },
]

export default function Orders() {
  return (
    <>
      <header className="page-header">
        <h1>Orders</h1>
        <p>Manage and track all orders</p>
      </header>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td><strong>{order.id}</strong></td>
                <td>{order.customer}</td>
                <td>{order.items}</td>
                <td>{order.total}</td>
                <td><span className={`status ${order.status}`}>{order.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

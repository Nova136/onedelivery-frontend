const deliveries = [
  { id: 'DLV-201', orderId: 'ORD-1002', driver: 'Mike R.', status: 'in-transit', eta: '15 min' },
  { id: 'DLV-202', orderId: 'ORD-1005', driver: 'Sarah K.', status: 'in-transit', eta: '25 min' },
  { id: 'DLV-200', orderId: 'ORD-1003', driver: 'Mike R.', status: 'delivered', eta: '—' },
]

export default function Deliveries() {
  return (
    <>
      <header className="page-header">
        <h1>Deliveries</h1>
        <p>Track active and completed deliveries</p>
      </header>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Delivery ID</th>
              <th>Order</th>
              <th>Driver</th>
              <th>Status</th>
              <th>ETA</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d) => (
              <tr key={d.id}>
                <td><strong>{d.id}</strong></td>
                <td>{d.orderId}</td>
                <td>{d.driver}</td>
                <td><span className={`status ${d.status}`}>{d.status}</span></td>
                <td>{d.eta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

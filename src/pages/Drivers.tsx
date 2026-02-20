const drivers = [
  { id: 'D01', name: 'Mike R.', status: 'online', deliveriesToday: 12 },
  { id: 'D02', name: 'Sarah K.', status: 'online', deliveriesToday: 8 },
  { id: 'D03', name: 'Tom W.', status: 'offline', deliveriesToday: 0 },
]

export default function Drivers() {
  return (
    <>
      <header className="page-header">
        <h1>Drivers</h1>
        <p>Driver availability and activity</p>
      </header>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Deliveries today</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.id}>
                <td><strong>{d.id}</strong></td>
                <td>{d.name}</td>
                <td>
                  <span className={`status ${d.status === 'online' ? 'delivered' : 'cancelled'}`}>
                    {d.status}
                  </span>
                </td>
                <td>{d.deliveriesToday}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

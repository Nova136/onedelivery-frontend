import { Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Deliveries from './pages/Deliveries'
import Drivers from './pages/Drivers'
import './App.css'

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="logo">OneDelivery</span>
          <span className="badge">Admin</span>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Dashboard
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Orders
          </NavLink>
          <NavLink to="/deliveries" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Deliveries
          </NavLink>
          <NavLink to="/drivers" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Drivers
          </NavLink>
        </nav>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/deliveries" element={<Deliveries />} />
          <Route path="/drivers" element={<Drivers />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import PlaceOrder from './pages/PlaceOrder'
import Deliveries from './pages/Deliveries'
import Drivers from './pages/Drivers'
import './App.css'

function AppLayout() {
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'admin'

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src={`${import.meta.env.BASE_URL}delivery-icon.png`} alt="" className="sidebar-icon" />
          <span className="logo">OneDelivery</span>
          <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-customer'}`}>
            {isAdmin ? 'Admin' : 'Customer'}
          </span>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Dashboard
          </NavLink>
          {isAdmin ? (
            <>
              <NavLink to="/orders" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                All orders
              </NavLink>
              <NavLink to="/deliveries" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                Deliveries
              </NavLink>
              <NavLink to="/drivers" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                Drivers
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/order" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                Place order
              </NavLink>
              <NavLink to="/orders" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                My orders
              </NavLink>
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <span className="sidebar-user">{user?.displayName}</span>
          <button type="button" onClick={logout} className="sidebar-logout">
            Sign out
          </button>
        </div>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route
            path="/order"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <PlaceOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deliveries"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Deliveries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/drivers"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Drivers />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App

import { useState, FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password) {
      setError('Please enter username and password')
      return
    }
    const ok = login(username.trim(), password)
    if (ok) navigate(from, { replace: true })
    else setError('Invalid username or password')
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">OneDelivery</h1>
        <p className="login-subtitle">Sign in to continue</p>
        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">
            Username
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
              placeholder="admin or customer"
            />
          </label>
          <label className="login-label">
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              placeholder="••••••••"
            />
          </label>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-button">
            Sign in
          </button>
        </form>
        <p className="login-hint">
          Demo: admin / admin123 — customer / customer123
        </p>
      </div>
    </div>
  )
}

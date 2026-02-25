import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { RegisterDto } from '../api/auth'
import './Login.css'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<RegisterDto['role']>('User')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Please enter email and password')
      return
    }
    if (password.length < 1) {
      setError('Password is required')
      return
    }
    setSubmitting(true)
    try {
      const dto: RegisterDto = { email: email.trim(), password, role }
      await register(dto)
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <img src={`${import.meta.env.BASE_URL}delivery-icon.png`} alt="OneDelivery" className="login-icon" />
        <h1 className="login-title">OneDelivery</h1>
        <p className="login-subtitle">Create an account</p>
        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              placeholder="user@example.com"
            />
          </label>
          <label className="login-label">
            Password
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              placeholder="••••••••"
            />
          </label>
          <label className="login-label">
            Role
            <select
              value={role}
              onChange={(e) => setRole((e.target.value as RegisterDto['role']) || 'User')}
              className="login-input"
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </label>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-button" disabled={submitting}>
            {submitting ? 'Registering…' : 'Register'}
          </button>
        </form>
        <p className="login-hint">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

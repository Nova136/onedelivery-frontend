import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useOrders } from '../contexts/OrdersContext'
import './PlaceOrder.css'

export default function PlaceOrder() {
  const { user } = useAuth()
  const { addOrder } = useOrders()
  const navigate = useNavigate()
  const [items, setItems] = useState(1)
  const [total, setTotal] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!user || user.role !== 'customer') return null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    const totalVal = total.trim().startsWith('$') ? total.trim() : `$${total.trim()}`
    addOrder(user.username, user.displayName, items, totalVal || '$0', description.trim() || undefined)
    setSubmitted(true)
    setItems(1)
    setTotal('')
    setDescription('')
    setTimeout(() => {
      setSubmitted(false)
      navigate('/orders')
    }, 1500)
  }

  return (
    <>
      <header className="page-header">
        <h1>Place order</h1>
        <p>Create a new delivery order</p>
      </header>
      <div className="place-order-card">
        {submitted ? (
          <p className="place-order-success">Order placed. Redirecting to My orders…</p>
        ) : (
          <form onSubmit={handleSubmit} className="place-order-form">
            <label className="login-label">
              Number of items
              <input
                type="number"
                min={1}
                value={items}
                onChange={(e) => setItems(Number(e.target.value) || 1)}
                className="login-input"
              />
            </label>
            <label className="login-label">
              Total amount
              <input
                type="text"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="login-input"
                placeholder="e.g. 25.00 or $25.00"
              />
            </label>
            <label className="login-label">
              Description (optional)
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="login-input"
                placeholder="Brief description"
              />
            </label>
            <button type="submit" className="login-button">
              Place order
            </button>
          </form>
        )}
      </div>
    </>
  )
}

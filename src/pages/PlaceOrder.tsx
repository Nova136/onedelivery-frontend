import { useState, FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { listProductsApi, type ProductItemDto } from '../api/logistics'
import { createOrderApi, listPriorityOptionsApi, type OrderItemInputDto, type PriorityOption } from '../api/order'
import './PlaceOrder.css'

interface LineItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

export default function PlaceOrder() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState<ProductItemDto[]>([])
  const [priorityOptions, setPriorityOptions] = useState<PriorityOption[]>([])
  const [selectedPriority, setSelectedPriority] = useState<string>('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [lines, setLines] = useState<LineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      listProductsApi(1, 100).then((res) => res.data.filter((p) => p.active)),
      listPriorityOptionsApi().catch(() => [] as PriorityOption[]),
    ])
      .then(([activeProducts, priorities]) => {
        setProducts(activeProducts)
        setPriorityOptions(priorities)
        if (priorities.length > 0) setSelectedPriority(priorities[0].sku)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  if (!user || user.role !== 'customer') return null

  function addLine() {
    const first = products[0]
    if (!first) return
    setLines((prev) => [
      ...prev,
      { productId: first.id, productName: first.name, quantity: 1, price: first.price },
    ])
  }

  function updateLine(index: number, updates: Partial<LineItem>) {
    setLines((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    )
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!deliveryAddress.trim()) {
      setError('Delivery address is required')
      return
    }
    if (lines.length === 0) {
      setError('Add at least one item')
      return
    }
    if (priorityOptions.length > 0 && !selectedPriority) {
      setError('Select a delivery priority')
      return
    }
    const items: OrderItemInputDto[] = lines.map((l) => ({
      productId: l.productId,
      productName: l.productName,
      quantity: Math.max(1, Math.round(Number(l.quantity))),
      price: Number(l.price),
    }))
    setSubmitting(true)
    createOrderApi({
      items,
      deliveryAddress: deliveryAddress.trim(),
      ...(selectedPriority ? { priorityOption: selectedPriority } : {}),
    })
      .then(() => navigate('/orders'))
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Order failed')
        setSubmitting(false)
      })
  }

  if (loading) {
    return (
      <>
        <header className="page-header">
          <h1>Place order</h1>
          <p>Create a new delivery order</p>
        </header>
        <div className="place-order-card">Loading products…</div>
      </>
    )
  }

  return (
    <>
      <header className="page-header">
        <h1>Place order</h1>
        <p>Add items and delivery address</p>
      </header>
      <div className="place-order-card">
        <form onSubmit={handleSubmit} className="place-order-form">
          <label className="login-label">
            Delivery address *
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="login-input"
              placeholder="e.g. 123 Main St, City"
            />
          </label>

          {priorityOptions.length > 0 && (
            <fieldset className="place-order-priority">
              <legend>Delivery priority *</legend>
              <div className="place-order-priority-options">
                {priorityOptions.map((opt) => (
                  <label
                    key={opt.sku}
                    className={`place-order-priority-card${selectedPriority === opt.sku ? ' selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={opt.sku}
                      checked={selectedPriority === opt.sku}
                      onChange={() => setSelectedPriority(opt.sku)}
                    />
                    <span className="priority-name">{opt.name}</span>
                    <span className="priority-desc">{opt.description}</span>
                    <span className="priority-price">${Number(opt.price).toFixed(2)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div className="place-order-lines">
            <div className="place-order-lines-header">
              <span>Items</span>
              <button type="button" onClick={addLine} className="place-order-add-btn" disabled={!products.length}>
                Add item
              </button>
            </div>
            {lines.map((line, index) => (
              <div key={`${line.productId}-${index}`} className="place-order-line">
                <select
                  value={line.productId}
                  onChange={(e) => {
                    const p = products.find((x) => x.id === e.target.value)
                    if (p) updateLine(index, { productId: p.id, productName: p.name, price: p.price })
                  }}
                  className="login-input place-order-select"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} – ${Number(p.price).toFixed(2)}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) => updateLine(index, { quantity: Number(e.target.value) || 1 })}
                  className="login-input place-order-qty"
                />
                <span className="place-order-subtotal">
                  ${(line.quantity * line.price).toFixed(2)}
                </span>
                <button type="button" onClick={() => removeLine(index)} className="place-order-remove" aria-label="Remove">
                  ×
                </button>
              </div>
            ))}
          </div>

          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-button" disabled={submitting || lines.length === 0 || (priorityOptions.length > 0 && !selectedPriority)}>
            {submitting ? 'Placing order…' : 'Place order'}
          </button>
        </form>
      </div>
    </>
  )
}

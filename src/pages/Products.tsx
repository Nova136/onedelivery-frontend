import { useEffect, useState } from 'react'
import { listProductsApi, type ProductItemDto, type PaginationMetaDto } from '../api/logistics'
import './Products.css'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export default function Products() {
  const [data, setData] = useState<ProductItemDto[]>([])
  const [pagination, setPagination] = useState<PaginationMetaDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(DEFAULT_PAGE)
  const [limit] = useState(DEFAULT_LIMIT)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    listProductsApi(page, limit)
      .then((res) => {
        if (!cancelled) {
          setData(res.data)
          setPagination(res.pagination)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load products')
          setData([])
          setPagination(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [page, limit])

  if (loading && data.length === 0) {
    return (
      <>
        <header className="page-header">
          <h1>Products</h1>
          <p>Product catalog from logistics</p>
        </header>
        <div className="products-loading">Loading products…</div>
      </>
    )
  }

  if (error && data.length === 0) {
    return (
      <>
        <header className="page-header">
          <h1>Products</h1>
          <p>Product catalog from logistics</p>
        </header>
        <div className="products-error">{error}</div>
      </>
    )
  }

  return (
    <>
      <header className="page-header">
        <h1>Products</h1>
        <p>
          {pagination
            ? `${pagination.total} product${pagination.total !== 1 ? 's' : ''} (page ${pagination.page} of ${pagination.totalPages})`
            : 'Product catalog from logistics'}
        </p>
      </header>
      <div className="table-wrap">
        <table className="products-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Description</th>
              <th>Price</th>
              <th>Active</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.name}</strong>
                </td>
                <td className="products-sku">{item.sku}</td>
                <td className="products-desc">{item.description ?? '—'}</td>
                <td className="products-price">${Number(item.price).toFixed(2)}</td>
                <td>
                  <span className={`status ${item.active ? 'delivered' : 'cancelled'}`}>
                    {item.active ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="products-date">{formatDate(item.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && pagination.totalPages > 1 && (
        <nav className="products-pagination" aria-label="Products pagination">
          <button
            type="button"
            className="pagination-btn"
            disabled={pagination.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            className="pagination-btn"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </>
  )
}

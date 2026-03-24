import { useState, useEffect } from 'react'
import { getIncidentTrendsApi, listIncidentsApi, TrendAnalysisResponse, type Incident } from '../api/incidents'

function formatDate(iso: string | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [summaryText, setSummaryText] = useState<TrendAnalysisResponse | null>(null)

  useEffect(() => {
    fetchIncidents()
  }, [])

  const fetchIncidents = async () => {
        try {
        setLoading(true)
        setError(null)
        const data = await listIncidentsApi()
        setIncidents(data || [])
        } catch (err) {
        console.error('Failed to fetch incidents:', err)
        setError('Failed to load incidents. Please try again.')
        setIncidents([])
        } finally {
        setLoading(false)
        }
        console.log('Fetched incidents:', incidents)
        console.log('Fetched loadings:', loading)
  }
  
  const fetchAnalysis = async () => {
        try {
        setError(null)
        const data = await getIncidentTrendsApi()
        setSummaryText(data || null)
        setShowSummary(true)
        } catch (err) {
        console.error('Failed to fetch incidents:', err)
        setError('Failed to load incidents. Please try again.')
        setSummaryText(null)
        setShowSummary(false)
        } finally {
        setShowSummary(true)
        }
        console.log('Fetched analysis:', summaryText)
        console.log('Fetched showSummary:', showSummary)
  }

  const handleAnalyzeTrends = () => {
    fetchAnalysis()
  }

  const handleCloseSummary = () => {
    setShowSummary(false)
  }

  return (
    <>
      <header className="page-header">
        <h1>Incidents</h1>
        <p>Reported incidents from users</p>
      </header>
      {loading ? (
        <div className="table-wrap">
          <div className="empty-state">
            <p style={{ fontWeight: 600, margin: 0 }}>Loading incidents...</p>
          </div>
        </div>
      ) : error ? (
        <div className="table-wrap">
          <div className="empty-state">
            <p style={{ fontWeight: 600, margin: 0, color: '#d1312c' }}>Error</p>
            <p>{error}</p>
          </div>
        </div>
      ) : !Array.isArray(incidents) || incidents.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">
            <p style={{ fontWeight: 600, margin: 0 }}>No incidents</p>
            <p>No incidents reported yet.</p>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Order ID</th>
                <th>Summary</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(incidents) ? incidents : []).map((incident) => (
                <tr key={incident.id}>
                  <td><strong>{incident.id}</strong></td>
                  <td>{incident.type}</td>
                  <td>{incident.orderId}</td>
                  <td>{incident.summary}</td>
                  <td style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>{formatDate(incident.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px' }}>
        <button 
          onClick={handleAnalyzeTrends}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Analyze Trends
        </button>
      </div>
      {showSummary && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '30px',
          backgroundColor: '#ffffff',
          borderTop: '2px solid #007bff',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
          maxHeight: '50vh',
          overflowY: 'auto',
          zIndex: 1000
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#007bff', fontSize: '18px', fontWeight: 'bold' }}>📊 Incident Trend Analysis</h3>
            <button 
              onClick={handleCloseSummary}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                padding: 0
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#f0f7ff', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #007bff' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total Incidents</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{summaryText.summary?.total || 0}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>Last 30 days</div>
            </div>
            
            <div style={{ backgroundColor: '#fff3f0', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ff6b6b' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Most Common Issue</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff6b6b' }}>{summaryText.summary?.mostCommon}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>{summaryText.summary?.percentage}% of incidents</div>
            </div>
            
            <div style={{ backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Trend</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#22c55e' }}>{summaryText.summary?.trend}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>vs previous month</div>
            </div>
            
            <div style={{ backgroundColor: '#fffbf0', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Peak Time</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f59e0b' }}>{summaryText.summary?.peakTime}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>Highest incident rate</div>
            </div>
          </div>
          
          {summaryText.summary?.issues && summaryText.summary.issues.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>⚠️ Common Issues</div>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {summaryText.summary.issues.map((issue, idx) => (
                  <li key={idx} style={{ color: '#555', marginBottom: '5px' }}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  )
}
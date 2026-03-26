import { useEffect, useState } from 'react'
import { fetchAllBackendScans } from '../api/sonar'
import type { BackendScanRow } from '../api/sonar'
import {
  SONAR_BACKEND_PROJECTS,
  SONAR_ORG_URL,
  sonarDashboardUrl,
  sonarQualityGateBadgeUrl,
} from '../data/sonarBackendProjects'

function formatRating(value: string | null): string {
  if (value === null) return '—'
  const n = Math.round(Number(value))
  if (Number.isNaN(n) || n < 1 || n > 5) return value
  return ['A', 'B', 'C', 'D', 'E'][n - 1] ?? value
}

function formatPercent(value: string | null): string {
  if (value === null) return '—'
  return `${value}%`
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function SonarScans() {
  const [rows, setRows] = useState<BackendScanRow[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoadError(null)
    fetchAllBackendScans(SONAR_BACKEND_PROJECTS)
      .then((data) => {
        if (!cancelled) setRows(data)
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load scan data')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <header className="page-header">
        <h1>Backend quality (SonarCloud)</h1>
        <p>
          Latest scan metrics for onedelivery backend services. Organization{' '}
          <a href={SONAR_ORG_URL} target="_blank" rel="noreferrer">
            nova136
          </a>
          .
        </p>
      </header>

      {loadError && (
        <p className="sonar-banner sonar-banner-error" role="alert">
          {loadError}
        </p>
      )}

      {!rows && !loadError && <p className="empty-state">Loading SonarCloud data…</p>}

      {rows && (
        <div className="table-wrap sonar-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Last analysis</th>
                <th>Quality gate</th>
                <th>Bugs</th>
                <th>Vulnerabilities</th>
                <th>Code smells</th>
                <th>Coverage</th>
                <th>Duplications</th>
                <th>Reliability</th>
                <th>Security</th>
                <th>Maintainability</th>
                <th>Lines of code</th>
                <th>Dashboard</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.projectKey}>
                  <td>
                    <span className="sonar-service-name">{r.displayName}</span>
                    <span className="sonar-service-id">{r.label}</span>
                  </td>
                  <td>{formatDate(r.lastAnalysis)}</td>
                  <td className="sonar-badge-cell">
                    {r.fetchError ? (
                      <span className="sonar-metric-muted" title={r.fetchError}>
                        —
                      </span>
                    ) : (
                      <a
                        href={sonarDashboardUrl(r.projectKey)}
                        target="_blank"
                        rel="noreferrer"
                        className="sonar-badge-link"
                      >
                        <img
                          src={sonarQualityGateBadgeUrl(r.projectKey)}
                          alt={
                            r.alertStatus === 'OK'
                              ? 'Quality gate passed'
                              : r.alertStatus === 'ERROR'
                                ? 'Quality gate failed'
                                : 'Quality gate status'
                          }
                          width={86}
                          height={20}
                          loading="lazy"
                        />
                      </a>
                    )}
                  </td>
                  <td>{r.bugs ?? '—'}</td>
                  <td>{r.vulnerabilities ?? '—'}</td>
                  <td>{r.codeSmells ?? '—'}</td>
                  <td>{formatPercent(r.coverage)}</td>
                  <td>{formatPercent(r.duplicatedLinesDensity)}</td>
                  <td>{formatRating(r.reliabilityRating)}</td>
                  <td>{formatRating(r.securityRating)}</td>
                  <td>{formatRating(r.maintainabilityRating)}</td>
                  <td>{r.ncloc ?? '—'}</td>
                  <td>
                    <a href={sonarDashboardUrl(r.projectKey)} target="_blank" rel="noreferrer">
                      Open
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

/** Backend SonarCloud projects (organization nova136). */
export type SonarBackendProject = {
  /** Short label for tables and nav */
  label: string
  /** Sonar project key (e.g. nova136_onedelivery-order) */
  projectKey: string
}

export const SONAR_BACKEND_PROJECTS: SonarBackendProject[] = [
  { label: 'audit', projectKey: 'nova136_onedelivery-audit' },
  { label: 'guardian-agent', projectKey: 'nova136_onedelivery-guardian-agent' },
  { label: 'incident', projectKey: 'nova136_onedelivery-incident' },
  { label: 'knowledge', projectKey: 'nova136_onedelivery-knowledge' },
  { label: 'logistics', projectKey: 'nova136_onedelivery-logistics' },
  { label: 'logistics-agent', projectKey: 'nova136_onedelivery-logistics-agent' },
  { label: 'orchestrator-agent', projectKey: 'nova136_onedelivery-orchestrator-agent' },
  { label: 'order', projectKey: 'nova136_onedelivery-order' },
  { label: 'payment', projectKey: 'nova136_onedelivery-payment' },
  { label: 'qa-agent', projectKey: 'nova136_onedelivery-qa-agent' },
  { label: 'resolution-agent', projectKey: 'nova136_onedelivery-resolution-agent' },
  { label: 'user', projectKey: 'nova136_onedelivery-user' },
]

export const SONAR_ORG_URL = 'https://sonarcloud.io/organization/nova136'

export function sonarDashboardUrl(projectKey: string): string {
  const q = new URLSearchParams({ id: projectKey })
  return `https://sonarcloud.io/dashboard?${q.toString()}`
}

export function sonarQualityGateBadgeUrl(projectKey: string): string {
  const q = new URLSearchParams({ project: projectKey, metric: 'alert_status' })
  return `https://sonarcloud.io/api/project_badges/measure?${q.toString()}`
}

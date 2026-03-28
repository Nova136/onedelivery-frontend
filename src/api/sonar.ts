import type { SonarBackendProject } from '../data/sonarBackendProjects'

const SONAR_BASE = 'https://sonarcloud.io'

const MEASURE_KEYS = [
  'alert_status',
  'bugs',
  'vulnerabilities',
  'code_smells',
  'coverage',
  'duplicated_lines_density',
  'reliability_rating',
  'security_rating',
  'sqale_rating',
  'ncloc',
].join(',')

type MeasuresResponse = {
  component?: {
    key: string
    name: string
    measures?: { metric: string; value?: string }[]
  }
  errors?: { msg: string }[]
}

type AnalysesResponse = {
  analyses?: { date: string }[]
  errors?: { msg: string }[]
}

export type BackendScanRow = {
  label: string
  projectKey: string
  displayName: string
  lastAnalysis: string | null
  alertStatus: string | null
  bugs: string | null
  vulnerabilities: string | null
  codeSmells: string | null
  coverage: string | null
  duplicatedLinesDensity: string | null
  reliabilityRating: string | null
  securityRating: string | null
  maintainabilityRating: string | null
  ncloc: string | null
  fetchError: string | null
}

function measureMap(measures: { metric: string; value?: string }[] | undefined): Record<string, string> {
  const m: Record<string, string> = {}
  if (!measures) return m
  for (const x of measures) {
    if (x.value !== undefined) m[x.metric] = x.value
  }
  return m
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

export async function fetchBackendScan(project: SonarBackendProject): Promise<BackendScanRow> {
  const key = encodeURIComponent(project.projectKey)
  const measuresUrl = `${SONAR_BASE}/api/measures/component?component=${key}&metricKeys=${MEASURE_KEYS}`
  const analysesUrl = `${SONAR_BASE}/api/project_analyses/search?project=${key}&ps=1`

  try {
    const [measuresData, analysesData] = await Promise.all([
      fetchJson<MeasuresResponse>(measuresUrl),
      fetchJson<AnalysesResponse>(analysesUrl),
    ])

    const measuresErr = measuresData.errors?.[0]?.msg
    if (measuresErr) {
      return {
        label: project.label,
        projectKey: project.projectKey,
        displayName: project.label,
        lastAnalysis: null,
        alertStatus: null,
        bugs: null,
        vulnerabilities: null,
        codeSmells: null,
        coverage: null,
        duplicatedLinesDensity: null,
        reliabilityRating: null,
        securityRating: null,
        maintainabilityRating: null,
        ncloc: null,
        fetchError: measuresErr,
      }
    }

    const mm = measureMap(measuresData.component?.measures)
    const analysisDate =
      analysesData.errors?.[0]?.msg != null ? null : (analysesData.analyses?.[0]?.date ?? null)

    return {
      label: project.label,
      projectKey: project.projectKey,
      displayName: measuresData.component?.name ?? project.label,
      lastAnalysis: analysisDate,
      alertStatus: mm.alert_status ?? null,
      bugs: mm.bugs ?? null,
      vulnerabilities: mm.vulnerabilities ?? null,
      codeSmells: mm.code_smells ?? null,
      coverage: mm.coverage ?? null,
      duplicatedLinesDensity: mm.duplicated_lines_density ?? null,
      reliabilityRating: mm.reliability_rating ?? null,
      securityRating: mm.security_rating ?? null,
      maintainabilityRating: mm.sqale_rating ?? null,
      ncloc: mm.ncloc ?? null,
      fetchError: null,
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Request failed'
    return {
      label: project.label,
      projectKey: project.projectKey,
      displayName: project.label,
      lastAnalysis: null,
      alertStatus: null,
      bugs: null,
      vulnerabilities: null,
      codeSmells: null,
      coverage: null,
      duplicatedLinesDensity: null,
      reliabilityRating: null,
      securityRating: null,
      maintainabilityRating: null,
      ncloc: null,
      fetchError: msg,
    }
  }
}

export async function fetchAllBackendScans(projects: SonarBackendProject[]): Promise<BackendScanRow[]> {
  return Promise.all(projects.map((p) => fetchBackendScan(p)))
}

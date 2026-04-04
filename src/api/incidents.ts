/**
 * Incidents API types and calls.
 * GET /incidents – list incidents
 */

import { getAuthToken } from "./auth";
import { apiGet } from "./client";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
    "http://localhost:8000/incident";
const BASE = API_BASE_URL.replace(/\/$/, "");

/** Incident response from backend */
export interface Incident {
    id: string;
    type: string;
    orderId: string;
    summary: string;
    createdAt: string;
}

/** Incidents list response */
export interface IncidentsResponse {
    incidents: Incident[];
}

/** GET /incidents – fetch all incidents (Bearer required) */
export async function getIncidentsApi(): Promise<Incident[]> {
    const res = await apiGet<IncidentsResponse>("incident", "");
    return res.incidents || [];
}

/**
 * GET /logistics/products?page=&limit=20 by default
 */
export async function listIncidentsApi(): Promise<Incident[]> {
    const url = new URL(`${BASE}`);
    const token = getAuthToken();
    const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Products request failed: ${res.status}`);
    }
    const data = (await res.json()) as IncidentsResponse;
    console.log(data);
    return data.incidents || [];
}

/** Trend analysis response */
export interface TrendAnalysisResponse {
    totalByThisMonth: number;
    mostCommon: string;
    percentage: number;
    trend: string;
    peakTime: string;
    issues: string[];
}

/** GET /incidents/trends – fetch incident trend analysis (Bearer required) */
export async function getIncidentTrendsApi(): Promise<TrendAnalysisResponse> {
    const res = await apiGet<TrendAnalysisResponse>("incident", "/trends");
    return res;
}

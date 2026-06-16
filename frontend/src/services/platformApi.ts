import { applyPlatformSnapshot } from "../data/mockData";
import type { PlatformSnapshot } from "../data/mockData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "recruiter" | "candidate";
  status: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface ApiErrorResponse {
  message?: string;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("skillora_token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    let details: ApiErrorResponse = {};
    try {
      details = await response.json();
    } catch {
      details = {};
    }
    throw new Error(details.message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function loginUser(payload: { email: string; password: string; role: string }) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function registerUser(payload: Record<string, unknown>) {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchPlatformSnapshot() {
  const snapshot = await apiRequest<PlatformSnapshot>("/platform/snapshot");
  applyPlatformSnapshot(snapshot);
  return snapshot;
}

export async function fetchDatabaseReport() {
  return apiRequest<{
    connected: boolean;
    collections: { name: string; count: number; indexes: unknown[] }[];
    emptyCollections: string[];
    dataQualityIssues: string[];
  }>("/platform/database-report");
}

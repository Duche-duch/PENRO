/**
 * Central HTTP client for the Express API (proxied from Vite in development).
 */

const base = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

function getToken() {
  return localStorage.getItem('accessToken');
}

export async function apiFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body != null && typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${base}${path}`, { ...init, headers });
  const text = await res.text();
  const data = text ? (JSON.parse(text) as T & { error?: string }) : (null as T);
  if (!res.ok) {
    const msg = (data as { error?: string })?.error || res.statusText || 'Request failed';
    throw new ApiError(res.status, msg);
  }
  return data as T;
}

export async function loginRequest(email: string, password: string) {
  return apiFetch<{ token: string; user: Record<string, unknown> }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchCurrentUser() {
  return apiFetch<Record<string, unknown>>('/api/auth/me');
}

export async function fetchRecords() {
  return apiFetch<Record<string, unknown>[]>('/api/records');
}

export async function fetchRecord(id: string) {
  return apiFetch<Record<string, unknown>>(`/api/records/${encodeURIComponent(id)}`);
}

export async function createRecord(payload: Record<string, unknown>) {
  return apiFetch<Record<string, unknown>>('/api/records', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateRecord(id: string, payload: Record<string, unknown>) {
  return apiFetch<Record<string, unknown>>(`/api/records/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function fetchUsers() {
  return apiFetch<Record<string, unknown>[]>('/api/users');
}

export async function createUserApi(payload: Record<string, unknown>) {
  return apiFetch<Record<string, unknown>>('/api/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateUserApi(id: string, payload: Record<string, unknown>) {
  return apiFetch<Record<string, unknown>>(`/api/users/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteUserApi(id: string) {
  await apiFetch(`/api/users/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function attachSignature(user: Record<string, unknown>, userId: string) {
  const stored = localStorage.getItem(`signature_${userId}`);
  if (stored) {
    return { ...user, signature: stored };
  }
  return { ...user };
}

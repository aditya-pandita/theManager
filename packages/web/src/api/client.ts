const BASE = '';

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = localStorage.getItem('decidr_token');
  const headers: Record<string, string> = { ...extra };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) =>
    request<T>(path, { headers: authHeaders() }),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body),
    }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body),
    }),

  delete: (path: string) =>
    request<void>(path, { method: 'DELETE', headers: authHeaders() }),

  importCSV: <T>(csvText: string) =>
    request<T>('/api/import/csv', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'text/plain' }),
      body: csvText,
    }),
};

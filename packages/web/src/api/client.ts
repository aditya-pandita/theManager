const BASE = '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  delete: (path: string) => request<void>(path, { method: 'DELETE' }),

  importCSV: <T>(csvText: string, projectId?: string | null) => {
    const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return request<T>(`/api/import/csv${qs}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: csvText,
    });
  },
};

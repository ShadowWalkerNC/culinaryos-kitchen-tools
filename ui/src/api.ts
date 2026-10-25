// Same-origin API client. Token obtained from exact same-origin endpoint.
let token: string | null = null;

async function sessionToken(): Promise<string> {
  if (token) return token;
  const r = await fetch('/api/session', { credentials: 'same-origin' });
  if (!r.ok) throw new Error('session unavailable');
  const j = (await r.json()) as { token: string };
  token = j.token;
  return token;
}

export async function api<T>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if ((opts.method ?? 'GET') !== 'GET') headers['x-session-token'] = await sessionToken();
  const r = await fetch(path, {
    method: opts.method ?? 'GET',
    headers,
    credentials: 'same-origin',
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  const j = (await r.json().catch(() => ({ error: `http ${r.status}` }))) as T & { error?: string };
  if (!r.ok) throw new Error((j as { error?: string }).error ?? `http ${r.status}`);
  return j as T;
}

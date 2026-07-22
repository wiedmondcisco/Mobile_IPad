/* Minimal API client. Point VITE_API_BASE at a backend (e.g. in .env.local)
   and every data domain in src/api/index.js hydrates from it; leave it unset
   and the app runs entirely on the bundled demo data in src/data/. */
const BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

export const apiConfigured = () => BASE !== "";

export async function apiGet(path) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 10000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Accept: "application/json" },
      signal: ctl.signal,
    });
    if (!res.ok) throw new Error(`GET ${path} → HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

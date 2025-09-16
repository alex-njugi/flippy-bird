export function loadState(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch(e) { return fallback; }
}
export function saveState(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch(e){}
}

/** localStorage key for Playground ↔ Dashboard deployments */
export const DEPLOYMENTS_STORAGE_KEY = 'sharddev-studio:deployments'

function normalizeEntry(x) {
  if (!x || typeof x.address !== 'string' || !x.address.startsWith('0x')) return null

  let deployedAt = x.deployedAt
  if (typeof deployedAt !== 'number' || !Number.isFinite(deployedAt)) {
    const p = Date.parse(String(deployedAt))
    deployedAt = Number.isFinite(p) ? p : NaN
  }
  if (!Number.isFinite(deployedAt)) return null

  return {
    id: typeof x.id === 'string' ? x.id : crypto.randomUUID(),
    address: x.address,
    deployedAt,
  }
}

/** Read deployments from localStorage. */
export function loadDeploymentsFromStorage() {
  try {
    const raw = localStorage.getItem(DEPLOYMENTS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeEntry).filter(Boolean)
  } catch {
    return []
  }
}

export function saveDeploymentsToStorage(list) {
  try {
    localStorage.setItem(DEPLOYMENTS_STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* ignore quota */
  }
}

export function deploymentsListsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

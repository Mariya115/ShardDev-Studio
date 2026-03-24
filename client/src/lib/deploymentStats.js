/** @param {{ deployedAt: number }[]} deployments */
export function deploymentsInRange(deployments, startMs, endMs) {
  return deployments.filter((d) => d.deployedAt >= startMs && d.deployedAt < endMs)
}

/** Last 7 full calendar days including today, start of day local → counts per day (oldest first). */
export function bucketLast7Days(deployments, now = new Date()) {
  const labels = []
  const counts = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const start = d.getTime()
    const end = start + 86400000
    labels.push(
      d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
    )
    counts.push(deployments.filter((x) => x.deployedAt >= start && x.deployedAt < end).length)
  }
  const max = Math.max(1, ...counts)
  const heights = counts.map((c) => Math.round((c / max) * 100))
  return { labels, counts, heights }
}

export function formatRelativeTime(deployedAtMs, nowMs) {
  const sec = Math.floor((nowMs - deployedAtMs) / 1000)
  if (sec < 10) return 'just now'
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return new Date(deployedAtMs).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function shortAddress(addr, left = 6, right = 4) {
  if (!addr || addr.length < left + right + 2) return addr
  return `${addr.slice(0, left + 2)}…${addr.slice(-right)}`
}

import { useEffect, useState } from 'react'

/** Stable “current time” for render — updates on interval so relative labels stay fresh without impure Date.now() in memo. */
export function useNow(intervalMs = 10_000) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const tick = () => setNow(Date.now())
    const id = window.setInterval(tick, intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])

  return now
}

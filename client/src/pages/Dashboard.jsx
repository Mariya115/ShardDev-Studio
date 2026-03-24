import { useLayoutEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDeployments } from '../hooks/useDeployments'
import { useNow } from '../hooks/useNow'
import {
  bucketLast7Days,
  deploymentsInRange,
  formatRelativeTime,
  shortAddress,
} from '../lib/deploymentStats'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export function Dashboard() {
  const location = useLocation()
  const { deployments, syncDeployments } = useDeployments()
  const now = useNow()

  /** Re-read localStorage when landing on Dashboard so the list matches disk (e.g. multi-tab). */
  useLayoutEffect(() => {
    if (location.pathname === '/dashboard') syncDeployments()
  }, [location.pathname, syncDeployments])

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const sorted = useMemo(
    () => [...deployments].sort((a, b) => b.deployedAt - a.deployedAt),
    [deployments],
  )

  const summary = useMemo(() => {
    const total = deployments.length
    if (total === 0) return null
    const latest = sorted[0]
    const thisWeek = deploymentsInRange(deployments, now - WEEK_MS, now + 1).length
    return {
      total,
      latest,
      thisWeek,
    }
  }, [deployments, sorted, now])

  const chart = useMemo(() => bucketLast7Days(deployments, new Date(now)), [deployments, now])

  const hasDeployments = deployments.length > 0

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <header className="sticky top-0 z-10 border-b border-border-subtle bg-zinc-950/90 px-8 py-5 backdrop-blur-md">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500">{greeting}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">Dashboard</h1>
            <p className="mt-2 max-w-2xl text-base font-medium leading-snug tracking-tight text-zinc-300">
              Build, Deploy, and Debug Smart Contracts on Shardeum — Faster and Smarter
            </p>
            <p className="mt-3 max-w-lg text-sm text-zinc-500">
              Contracts you deploy from the Playground appear here — addresses, timestamps, and recent
              activity for your workspace.
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-xs text-zinc-600">
              <span className="rounded border border-zinc-700 bg-zinc-900/80 px-2 py-0.5 font-mono text-zinc-400">
                Simulated localnet
              </span>
              <span>Browser-only persistence</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/playground"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-zinc-950 shadow-sm transition hover:opacity-90"
            >
              Deploy contract
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-8 p-8">
        {!hasDeployments ? (
          <section className="rounded-xl border border-dashed border-zinc-700 bg-surface-elevated/40 px-8 py-16 text-center">
            <p className="text-lg font-medium text-zinc-200">No deployed contracts yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
              Deploy from the Contract Playground. Each run stores the contract address and block time so
              you can track what shipped from this dev session.
            </p>
            <Link
              to="/playground"
              className="mt-6 inline-flex rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:opacity-90"
            >
              Open Contract Playground
            </Link>
          </section>
        ) : (
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border-subtle bg-surface-elevated p-5 shadow-sm sm:col-span-1">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Deployed contracts</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-zinc-50">
                {summary.total}
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                {summary.thisWeek > 0
                  ? `${summary.thisWeek} in the last 7 days`
                  : 'No deploys in the last 7 days'}
              </p>
            </div>
            <div className="rounded-xl border border-border-subtle bg-surface-elevated p-5 shadow-sm sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Latest contract address</p>
              <p className="mt-2 break-all font-mono text-base font-medium tracking-tight text-accent">
                {summary.latest.address}
              </p>
              <p className="mt-3 text-[10px] font-medium uppercase tracking-wider text-zinc-600">Timestamp</p>
              <p className="mt-1 text-sm text-zinc-400">
                {formatRelativeTime(summary.latest.deployedAt, now)}
                <span className="text-zinc-600">
                  {' · '}
                  {new Date(summary.latest.deployedAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'medium',
                  })}
                </span>
              </p>
            </div>
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-5">
          <div className="rounded-xl border border-border-subtle bg-surface-elevated lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
              <h2 className="text-sm font-semibold text-zinc-100">Deployment volume</h2>
              <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-400">7 days</span>
            </div>
            <div className="p-5">
              {!hasDeployments ? (
                <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-700/80 bg-zinc-950/50 px-4 text-center">
                  <p className="text-sm font-medium text-zinc-400">No contracts deployed</p>
                  <p className="mt-1 text-xs text-zinc-600">Chart fills in after your first deploy.</p>
                </div>
              ) : (
                <>
                  <p className="mb-4 text-xs text-zinc-500">
                    Contract deploys per day (from Playground simulation timestamps).
                  </p>
                  <div className="flex h-44 items-end justify-between gap-1.5 sm:gap-2">
                    {chart.heights.map((h, i) => (
                      <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                        <div
                          className="flex w-full max-w-[2rem] flex-1 items-end justify-center sm:max-w-none"
                          title={`${chart.counts[i]} deploy${chart.counts[i] === 1 ? '' : 's'} · ${chart.labels[i]}`}
                        >
                          <div
                            className="w-full max-w-8 rounded-t bg-gradient-to-t from-accent/30 to-accent/80 transition-[height]"
                            style={{ height: `${Math.max(h, chart.counts[i] > 0 ? 8 : 0)}%` }}
                          />
                        </div>
                        <span className="truncate text-[10px] text-zinc-600 sm:text-xs">
                          {chart.labels[i].split(' ').slice(1).join(' ') || chart.labels[i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-elevated lg:col-span-3">
            <div className="border-b border-border-subtle px-5 py-4">
              <h2 className="text-sm font-semibold text-zinc-100">Recent activity</h2>
              <p className="mt-0.5 text-xs text-zinc-500">Contract deploy events from this browser</p>
            </div>
            {!hasDeployments ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm text-zinc-400">No activity yet</p>
                <p className="mt-1 text-xs text-zinc-600">Deploy a contract to see it listed here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border-subtle">
                {sorted.map((row, index) => (
                  <li key={row.id} className="flex gap-4 px-5 py-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-muted text-accent">
                      <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 1 6.364 6.364l-4.5 4.5a4.5 4.5 0 0 1-1.242-7.244"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-zinc-200">Contract deployed</p>
                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                          Success
                        </span>
                        {index === 0 && (
                          <span className="rounded border border-accent/40 bg-accent-muted px-1.5 py-0.5 text-[10px] font-medium text-accent">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="mt-1 font-mono text-xs text-zinc-400">{shortAddress(row.address)}</p>
                      <p className="mt-1 break-all font-mono text-[11px] leading-relaxed text-zinc-500">
                        {row.address}
                      </p>
                      <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                        Timestamp
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        <span className="text-zinc-500">{formatRelativeTime(row.deployedAt, now)}</span>
                        <span className="text-zinc-700"> · </span>
                        {new Date(row.deployedAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'medium',
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

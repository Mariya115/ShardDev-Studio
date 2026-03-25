import { useEffect, useState } from 'react'
import { getLogs, getStats } from '../services/api'

export function Analytics() {
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [logsData, statsData] = await Promise.all([getLogs(), getStats()])

        setLogs(logsData.logs || [])
        setStats(statsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
        console.error('Failed to fetch analytics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Refresh data every 10 seconds
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const getRiskBadgeColor = (risk) => {
    switch (risk) {
      case 'HIGH':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'LOW':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      default:
        return 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30'
    }
  }

  const getDecisionBadgeColor = (decision) => {
    if (!decision) return 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30'
    switch (decision) {
      case 'APPROVE':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      case 'REVIEW':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'REJECT':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      default:
        return 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30'
    }
  }

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleString()
    } catch {
      return timestamp
    }
  }

  const shortAddress = (address) => {
    if (!address) return 'N/A'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border-subtle bg-zinc-950/90 px-8 py-5 backdrop-blur-md">
        <div>
          <p className="text-sm text-zinc-500">Guardian AI Wallet</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">Analytics & Logs</h1>
          <p className="mt-2 text-sm text-zinc-400">Monitor transaction risk patterns and security analysis</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 space-y-8 p-8">
        {/* Stats Cards */}
        {stats && (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-6">
              <p className="text-sm font-medium text-zinc-400">Total Transactions</p>
              <p className="mt-3 text-4xl font-bold text-zinc-50">{stats.total_transactions}</p>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6">
              <p className="text-sm font-medium text-emerald-400">Low Risk</p>
              <p className="mt-3 text-4xl font-bold text-emerald-300">{stats.low_risk_count}</p>
            </div>

            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6">
              <p className="text-sm font-medium text-yellow-400">Medium Risk</p>
              <p className="mt-3 text-4xl font-bold text-yellow-300">{stats.medium_risk_count}</p>
            </div>

            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
              <p className="text-sm font-medium text-red-400">High Risk</p>
              <p className="mt-3 text-4xl font-bold text-red-300">{stats.high_risk_count}</p>
            </div>
          </section>
        )}

        {/* Error State */}
        {error && (
          <section className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
            <p className="text-red-400 font-medium">Error Loading Data</p>
            <p className="mt-2 text-sm text-red-300">{error}</p>
          </section>
        )}

        {/* Loading State */}
        {loading && !error && (
          <section className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-8 text-center">
            <p className="text-zinc-400">Loading analytics data...</p>
          </section>
        )}

        {/* Transaction Logs */}
        {!loading && logs.length > 0 && (
          <section className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-6">
            <h2 className="text-lg font-semibold text-zinc-50 mb-4">Transaction History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium">Timestamp</th>
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium">Address</th>
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium">Amount</th>
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium">Risk</th>
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium">Score</th>
                    <th className="text-left px-4 py-3 text-zinc-400 font-medium">Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition">
                      <td className="px-4 py-3 text-zinc-400 text-xs">{formatTimestamp(log.timestamp)}</td>
                      <td className="px-4 py-3">
                        <code className="text-xs text-zinc-300 font-mono">{shortAddress(log.address)}</code>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {log.amount !== null ? log.amount.toFixed(4) : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getRiskBadgeColor(log.risk)}`}>
                          {log.risk}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-300 font-mono">{log.score}</td>
                      <td className="px-4 py-3">
                        {log.decision ? (
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getDecisionBadgeColor(log.decision)}`}>
                            {log.decision}
                          </span>
                        ) : (
                          <span className="text-zinc-500 text-xs">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Empty State */}
        {!loading && logs.length === 0 && !error && (
          <section className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 px-8 py-16 text-center">
            <p className="text-lg font-medium text-zinc-300">No transaction logs yet</p>
            <p className="mt-2 text-sm text-zinc-500">Analyzed transactions will appear here</p>
          </section>
        )}
      </div>
    </div>
  )
}

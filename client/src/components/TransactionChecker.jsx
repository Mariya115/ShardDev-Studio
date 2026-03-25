import { useState } from 'react'
import {
  checkRisk,
  getAIExplanation,
  getAgentDecision,
  postLog,
} from '../services/api'

export function TransactionChecker() {
  const [transaction, setTransaction] = useState({
    address: '',
    amount: '',
  })

  const [results, setResults] = useState({
    risk: null,
    ai: null,
    decision: null,
  })

  const [connectedAddress, setConnectedAddress] = useState('')
  const [walletMessage, setWalletMessage] = useState('Not connected')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setTransaction((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const connectWallet = async () => {
    try {
      if (!window.ethereum) throw new Error('MetaMask is not installed')
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (!accounts || accounts.length === 0) throw new Error('No wallet accounts found')

      const account = accounts[0]
      setConnectedAddress(account)
      setWalletMessage('Connected: ' + account)
      setTransaction((prev) => ({ ...prev, address: account }))
      if (!transaction.amount) setTransaction((prev) => ({ ...prev, amount: '1.2' }))

      // Immediately run the analysis flow after connection
      await handleCheckRisk(account, parseFloat(transaction.amount || '1.2'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
      setWalletMessage('Connection failed')
    }
  }

  const handleCheckRisk = async (address = null, amountInput = null) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const selectedAddress = address || transaction.address
      const amount = Number.isFinite(amountInput) ? amountInput : parseFloat(transaction.amount)
      if (!selectedAddress || amount === undefined || amount === null || Number.isNaN(amount)) {
        throw new Error('Please enter both address and amount')
      }
      if (amount < 0) {
        throw new Error('Invalid amount')
      }

      // Step 1: Check Risk
      const riskRes = await checkRisk({
        address: selectedAddress,
        amount: amount,
      })

      // Step 2: Get AI Explanation
      const aiRes = await getAIExplanation({
        address: selectedAddress,
        amount: amount,
        risk: riskRes.risk,
        score: riskRes.score,
        reasons: riskRes.reasons,
      })

      // Step 3: Get Agent Decision
      const agentRes = await getAgentDecision({
        risk: riskRes.risk,
        score: riskRes.score,
        address: selectedAddress,
        amount: amount,
      })

      setResults({
        risk: riskRes,
        ai: aiRes,
        decision: agentRes,
      })

      await postLog({
        address: selectedAddress,
        amount,
        risk: riskRes.risk,
        score: riskRes.score,
        decision: agentRes.decision,
        tx_status: 'ANALYZED',
      })

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'HIGH':
        return 'text-red-400 bg-red-500/10 border-red-500/30'
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
      case 'LOW':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      default:
        return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30'
    }
  }

  const getDecisionColor = (decision) => {
    switch (decision) {
      case 'APPROVE':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      case 'REVIEW':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
      case 'REJECT':
        return 'text-red-400 bg-red-500/10 border-red-500/30'
      default:
        return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30'
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border-subtle bg-zinc-950/90 px-8 py-5 backdrop-blur-md">
        <div>
          <p className="text-sm text-zinc-500">Guardian AI Wallet</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">Transaction Checker</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Analyze transaction risk with AI-powered blockchain security
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 space-y-8 p-8">
        {/* Input Section */}
        <section className="space-y-4 rounded-xl border border-zinc-700 bg-zinc-900/50 p-6">
          <h2 className="text-lg font-semibold text-zinc-50">Analyze Transaction</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Wallet Address</label>
              <input
                type="text"
                name="address"
                value={transaction.address}
                onChange={handleInputChange}
                placeholder="0x1234567890abcdef1234567890abcdef12345678"
                className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-50 placeholder-zinc-600 focus:outline-none focus:border-accent transition"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-zinc-500">Enter the recipient wallet address</p>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setTransaction((prev) => ({ ...prev, address: '0xBae9ccaE07d6732aDdE7d047C25d7c0b86a9637c', amount: prev.amount || '1.5' }))}
                  disabled={loading}
                  className="px-3 py-2 rounded-lg border border-zinc-700 text-sm text-zinc-100 hover:bg-zinc-800 transition"
                >
                  Use Sharedum Sample Address
                </button>
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500 transition"
                >
                  Connect MetaMask
                </button>
              </div>

              <p className="mt-2 text-xs text-zinc-500">{walletMessage}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Amount</label>
              <input
                type="number"
                name="amount"
                value={transaction.amount}
                onChange={handleInputChange}
                placeholder="0.5"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-50 placeholder-zinc-600 focus:outline-none focus:border-accent transition"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-zinc-500">Amount to send (in SHM)</p>
            </div>

            <button
              onClick={() => handleCheckRisk()}
              disabled={loading || !transaction.address || !transaction.amount}
              className="w-full px-6 py-3 rounded-lg bg-accent text-zinc-950 font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Analyzing...' : 'Check Risk & Get Recommendation'}
            </button>
          </div>
        </section>

        {/* Error State */}
        {error && (
          <section className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
            <p className="text-red-400 font-medium">Error</p>
            <p className="mt-2 text-sm text-red-300">{error}</p>
          </section>
        )}

        {/* Results Section */}
        {results.risk && (
          <section className="space-y-6">
            {/* Risk Card */}
            <div className={`rounded-xl border p-6 ${getRiskColor(results.risk.risk)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-75">Risk Level</p>
                  <h3 className="mt-1 text-3xl font-bold">{results.risk.risk}</h3>
                  <p className="mt-2 text-sm opacity-75">Score: {results.risk.score}/100</p>
                </div>
                <div className="text-5xl opacity-20">
                  {results.risk.risk === 'HIGH' ? '⚠️' : results.risk.risk === 'MEDIUM' ? '⚡' : '✓'}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                <p className="font-medium">Recommendation</p>
                <p className="mt-2 text-sm opacity-90">{results.risk.recommendation}</p>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Risk Factors:</p>
                <ul className="space-y-1">
                  {results.risk.reasons.map((reason, idx) => (
                    <li key={idx} className="text-sm opacity-85">
                      • {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* AI Explanation Card */}
            {results.ai && (
              <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-6">
                <h3 className="text-lg font-semibold text-zinc-50 mb-4">AI Security Analysis</h3>
                <div className="space-y-4 text-sm text-zinc-300">
                  <div>
                    <p className="font-medium text-zinc-200 mb-2">Explanation</p>
                    <p className="leading-relaxed opacity-90">{results.ai.explanation}</p>
                  </div>
                  <div>
                    <p className="font-medium text-zinc-200 mb-2">Recommendation</p>
                    <p className="leading-relaxed opacity-90">{results.ai.advice}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Agent Decision Card */}
            {results.decision && (
              <div className={`rounded-xl border p-6 ${getDecisionColor(results.decision.decision)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-75">Agent Decision</p>
                    <h3 className="mt-1 text-3xl font-bold">{results.decision.decision}</h3>
                    <p className="mt-2 text-sm opacity-75">Confidence: {results.decision.confidence}%</p>
                  </div>
                  <div className="text-5xl opacity-20">
                    {results.decision.decision === 'APPROVE'
                      ? '✓'
                      : results.decision.decision === 'REVIEW'
                        ? '🔍'
                        : '✗'}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                  <p className="text-sm opacity-90">{results.decision.reasoning}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <p className="text-emerald-400 text-sm font-medium">✓ Analysis complete. Review the results above.</p>
              </div>
            )}
          </section>
        )}

        {/* Empty State */}
        {!results.risk && !error && (
          <section className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 px-8 py-16 text-center">
            <p className="text-lg font-medium text-zinc-300">Enter transaction details to get started</p>
            <p className="mt-2 text-sm text-zinc-500">
              The AI will analyze the risk and provide security recommendations
            </p>
          </section>
        )}
      </div>
    </div>
  )
}

import { useCallback, useState } from 'react'

const FUNCTIONS = [
  'transfer(address,uint256)',
  'approve(address,uint256)',
  'swapExactTokensForTokens(uint256,uint256,address[],address,uint256)',
  'mint(address,uint256)',
  'withdraw(uint256)',
  'stake(uint256)',
  'unstake()',
  'multicall(bytes[])',
  'execute(bytes)',
  'setApprovalForAll(address,bool)',
]

function isValidTxHash(value) {
  const v = value.trim()
  return /^0x[a-fA-F0-9]{64}$/.test(v)
}

function hashSeed(hash) {
  const hex = hash.slice(2).toLowerCase()
  let n = 0
  for (let i = 0; i < hex.length; i++) {
    n = (n * 31 + hex.charCodeAt(i)) >>> 0
  }
  return {
    n,
    pick: (m) => n % m,
    pickInRange: (lo, hi) => lo + (n % (hi - lo + 1)),
  }
}

function pseudoAddress(hash, salt) {
  const h = hash.slice(2).toLowerCase()
  let out = ''
  for (let i = 0; i < 40; i++) {
    const idx = (i * 17 + salt * 3) % h.length
    out += h[idx]
  }
  return `0x${out}`
}

function functionGasFloor(functionName) {
  const f = functionName.toLowerCase()
  if (f.includes('swap')) return 118_000
  if (f.includes('multicall')) return 92_000
  if (f.includes('execute')) return 85_000
  if (f.includes('mint')) return 68_000
  if (f.includes('stake') || f.includes('withdraw')) return 72_000
  if (f.includes('approve') || f.includes('setapproval')) return 46_000
  if (f.includes('transfer')) return 51_000
  if (f.includes('unstake')) return 58_000
  return 49_000
}

function mockReceiptFromHash(hash) {
  const { n, pick, pickInRange } = hashSeed(hash)
  const functionName = FUNCTIONS[pick(FUNCTIONS.length)]
  const floor = functionGasFloor(functionName)
  const gasUsed = floor + (n % 185_000)
  const gasLimit = Math.ceil(gasUsed * (1.15 + pick(40) / 100))
  const effectiveGasPriceGwei = pickInRange(8, 52)
  const txCostEth = (gasUsed * effectiveGasPriceGwei) / 1e9
  const blockNumber = 18_420_000 + (n % 812_000)
  const transactionIndex = pick(280)
  const logsEmitted = pickInRange(1, 12)
  const from = pseudoAddress(hash, 1)
  const to = pseudoAddress(hash, 2)
  const selector = `0x${hash.slice(2, 10)}`
  const nonce = pick(9_000)

  return {
    gasUsed,
    gasLimit,
    effectiveGasPriceGwei,
    txCostEth,
    functionName,
    blockNumber,
    transactionIndex,
    logsEmitted,
    from,
    to,
    selector,
    nonce,
    status: 'success',
  }
}

function shortHash(hash) {
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`
}

/** Aligns with AI Insight gas copy thresholds. */
function gasTier(gasUsed) {
  if (gasUsed > 100_000) return 'high'
  if (gasUsed >= 50_000) return 'moderate'
  return 'efficient'
}

/** Deterministic AI-style summary from gas tier (exact tier strings per product spec). */
function buildAiInsight(receipt) {
  const { gasUsed, functionName } = receipt
  let summary
  if (gasUsed > 100_000) {
    summary = 'High gas usage due to complex operations or loops'
  } else if (gasUsed >= 50_000 && gasUsed <= 100_000) {
    summary = 'Moderate gas usage due to multiple state updates'
  } else {
    summary = 'Efficient transaction with low computational cost'
  }

  const method = functionName.split('(')[0]
  const context = `${method} · ${gasUsed.toLocaleString()} gas`

  return { summary, context, functionName }
}

function timeStamp() {
  const d = new Date()
  return (
    d.toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
    '.' +
    String(d.getMilliseconds()).padStart(3, '0')
  )
}

export function Debugger() {
  const [txInput, setTxInput] = useState('')
  const [loadingFetch, setLoadingFetch] = useState(false)
  const [loadingExplain, setLoadingExplain] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [receipt, setReceipt] = useState(null)
  const [aiInsight, setAiInsight] = useState(null)
  const [log, setLog] = useState(() => [
    {
      id: 0,
      t: timeStamp(),
      level: 'info',
      msg: 'Transaction debugger ready — paste a 32-byte tx hash and fetch a simulated receipt.',
    },
  ])

  const pushLog = useCallback((level, msg) => {
    setLog((prev) => [...prev, { id: crypto.randomUUID(), t: timeStamp(), level, msg }])
  }, [])

  const handleFetch = (e) => {
    e?.preventDefault?.()
    setFetchError(null)
    setAiInsight(null)
    const hash = txInput.trim()
    if (!isValidTxHash(hash)) {
      setFetchError('Enter a valid transaction hash: 0x followed by 64 hex characters.')
      setReceipt(null)
      pushLog('error', 'Invalid tx hash format (expected 0x + 64 hex digits).')
      return
    }

    setLoadingFetch(true)
    setReceipt(null)
    pushLog('info', `eth_getTransactionReceipt("${shortHash(hash)}") — pending…`)

    window.setTimeout(() => {
      const mock = mockReceiptFromHash(hash)
      setReceipt({
        hash: hash.toLowerCase(),
        ...mock,
      })
      setLoadingFetch(false)
      pushLog(
        'info',
        `Receipt resolved — gas ${mock.gasUsed.toLocaleString()}, ${mock.functionName.split('(')[0]}`,
      )
    }, 780)
  }

  const handleExplain = () => {
    if (!receipt) return
    setLoadingExplain(true)
    setAiInsight(null)
    pushLog('info', 'AI Insight — analyzing gas profile…')

    window.setTimeout(() => {
      const insight = buildAiInsight(receipt)
      setAiInsight(insight)
      setLoadingExplain(false)
      pushLog('info', `AI Insight ready — ${insight.summary.slice(0, 48)}…`)
    }, 900)
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-zinc-950">
      <header className="sticky top-0 z-10 border-b border-border-subtle bg-zinc-950/95 px-6 py-5 backdrop-blur-md sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-accent">Trace</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">Debugger</h1>
            <p className="mt-1 max-w-2xl text-sm text-zinc-500">
              Fetch simulated receipt data, then open <span className="text-zinc-400">AI Insight</span> for a
              gas-aware explanation — styled like an assistant response.
            </p>
          </div>
        </div>
      </header>

      <div className="grid flex-1 gap-6 p-6 sm:p-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <section className="rounded-xl border border-border-subtle bg-surface-elevated shadow-sm">
            <div className="border-b border-border-subtle px-5 py-3">
              <h2 className="text-sm font-semibold text-zinc-100">Transaction lookup</h2>
              <p className="mt-0.5 text-xs text-zinc-500">Simulated JSON-RPC — no real network call</p>
            </div>
            <form onSubmit={handleFetch} className="p-5">
              <label htmlFor="tx-hash" className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Transaction hash
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <input
                  id="tx-hash"
                  type="text"
                  value={txInput}
                  onChange={(e) => setTxInput(e.target.value)}
                  spellCheck={false}
                  autoComplete="off"
                  placeholder="0x…"
                  className="min-w-0 flex-1 rounded-lg border border-border-subtle bg-zinc-950/80 px-4 py-2.5 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 outline-none ring-accent focus:ring-2"
                />
                <button
                  type="submit"
                  disabled={loadingFetch}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingFetch ? (
                    <>
                      <Spinner />
                      Fetching…
                    </>
                  ) : (
                    'Fetch transaction'
                  )}
                </button>
              </div>
              {fetchError && (
                <p className="mt-3 text-sm text-amber-400/90" role="alert">
                  {fetchError}
                </p>
              )}
            </form>
          </section>

          {receipt && (
            <>
              <section className="rounded-xl border border-border-subtle bg-surface-elevated shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-3">
                  <h2 className="text-sm font-semibold text-zinc-100">Simulated receipt</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                        gasTier(receipt.gasUsed) === 'high'
                          ? 'bg-amber-500/15 text-amber-400'
                          : gasTier(receipt.gasUsed) === 'moderate'
                            ? 'bg-sky-500/15 text-sky-400'
                            : 'bg-emerald-500/15 text-emerald-400'
                      }`}
                    >
                      Gas: {gasTier(receipt.gasUsed)}
                    </span>
                    <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
                      {receipt.status}
                    </span>
                  </div>
                </div>

                <div className="border-b border-accent/15 bg-gradient-to-br from-accent-muted/25 via-zinc-950/40 to-zinc-950/80 px-5 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Summary</p>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-zinc-500">Gas used</p>
                      <p className="mt-0.5 font-mono text-xl font-semibold tabular-nums tracking-tight text-zinc-50">
                        {receipt.gasUsed.toLocaleString()}
                      </p>
                    </div>
                    <div className="min-w-0 sm:text-right">
                      <p className="text-xs text-zinc-500 sm:text-right">Function</p>
                      <p className="mt-0.5 break-all font-mono text-sm font-medium text-accent sm:text-right">
                        {receipt.functionName}
                      </p>
                    </div>
                  </div>
                </div>

                <dl className="grid gap-4 border-b border-border-subtle p-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Gas limit</dt>
                    <dd className="mt-1 font-mono text-sm tabular-nums text-zinc-300">
                      {receipt.gasLimit.toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Effective gas price</dt>
                    <dd className="mt-1 font-mono text-sm tabular-nums text-zinc-300">
                      {receipt.effectiveGasPriceGwei} gwei
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Est. fee (sim.)</dt>
                    <dd className="mt-1 font-mono text-sm tabular-nums text-zinc-300">
                      {receipt.txCostEth < 0.0001
                        ? `${receipt.txCostEth.toExponential(2)} ETH`
                        : `${receipt.txCostEth.toFixed(6)} ETH`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Selector</dt>
                    <dd className="mt-1 font-mono text-sm text-zinc-400">{receipt.selector}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Logs emitted</dt>
                    <dd className="mt-1 font-mono text-sm text-zinc-300">{receipt.logsEmitted}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Tx index</dt>
                    <dd className="mt-1 font-mono text-sm text-zinc-300">{receipt.transactionIndex}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Nonce</dt>
                    <dd className="mt-1 font-mono text-sm text-zinc-300">{receipt.nonce}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Block</dt>
                    <dd className="mt-1 font-mono text-sm text-zinc-300">{receipt.blockNumber.toLocaleString()}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">From</dt>
                    <dd className="mt-1 break-all font-mono text-xs text-zinc-400">{receipt.from}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">To (contract)</dt>
                    <dd className="mt-1 break-all font-mono text-xs text-zinc-400">{receipt.to}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Hash</dt>
                    <dd className="mt-1 break-all font-mono text-xs text-zinc-500">{receipt.hash}</dd>
                  </div>
                </dl>

                <div className="px-5 py-4">
                  <button
                    type="button"
                    onClick={handleExplain}
                    disabled={loadingExplain}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent/90 to-cyan-500/85 px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-[0_0_24px_-4px_var(--tw-shadow-color,oklch(0.72_0.14_195))] shadow-accent/40 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loadingExplain ? (
                      <>
                        <Spinner />
                        Generating…
                      </>
                    ) : (
                      <>
                        <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09z"
                          />
                        </svg>
                        Explain this
                      </>
                    )}
                  </button>
                  <p className="mt-2 text-xs text-zinc-600">Opens a premium AI Insight card below based on gas tiers.</p>
                </div>
              </section>

              {/* AI Insight — premium assistant panel */}
              <section
                className="relative overflow-hidden rounded-2xl border border-accent/35 bg-gradient-to-b from-zinc-900/95 via-zinc-950 to-zinc-950 p-px shadow-[0_0_40px_-8px_rgba(34,211,238,0.35),0_0_60px_-12px_rgba(167,139,250,0.12)]"
                aria-labelledby="ai-insight-heading"
              >
                <div className="rounded-[15px] bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-zinc-950 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/30 to-violet-500/25 ring-1 ring-accent/40">
                        <svg className="size-5 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 id="ai-insight-heading" className="text-sm font-semibold tracking-wide text-zinc-100">
                          AI Insight
                        </h2>
                        <p className="text-[11px] text-zinc-500">Simulated assistant · gas heuristic</p>
                      </div>
                    </div>
                    <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-300/90">
                      Premium
                    </span>
                  </div>

                  <div className="relative mt-5 min-h-[120px] rounded-xl border border-zinc-700/50 bg-zinc-950/70 p-4 sm:p-5">
                    <div className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.14),transparent)]" />

                    {loadingExplain && (
                      <div className="relative flex items-center gap-3 py-6">
                        <Spinner />
                        <div>
                          <p className="text-sm font-medium text-zinc-300">Composing insight…</p>
                          <p className="mt-0.5 text-xs text-zinc-600">Mapping gas units to execution complexity.</p>
                        </div>
                      </div>
                    )}

                    {!loadingExplain && aiInsight && (
                      <div className="relative space-y-4">
                        <div className="flex gap-3">
                          <div className="mt-1 size-2 shrink-0 rounded-full bg-gradient-to-b from-accent to-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium leading-relaxed text-zinc-100">{aiInsight.summary}</p>
                            <p className="mt-3 rounded-lg border border-zinc-800/80 bg-zinc-900/50 px-3 py-2 font-mono text-xs text-zinc-500">
                              <span className="text-zinc-600">Context · </span>
                              {aiInsight.context}
                            </p>
                            <p className="mt-2 break-all font-mono text-[11px] text-zinc-600">{aiInsight.functionName}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!loadingExplain && !aiInsight && (
                      <div className="relative py-8 text-center">
                        <p className="text-sm text-zinc-500">Fetch a transaction, then tap</p>
                        <p className="mt-1 text-sm font-medium text-accent">Explain this</p>
                        <p className="mt-1 text-xs text-zinc-600">to populate this panel.</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}

          {!receipt && !loadingFetch && (
            <p className="text-xs text-zinc-600">
              Try any 64-character hex hash after{' '}
              <code className="rounded bg-zinc-900 px-1 font-mono text-zinc-400">0x</code> — then use{' '}
              <strong className="font-medium text-zinc-500">AI Insight</strong> for the gas summary.
            </p>
          )}
        </div>

        <aside className="lg:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Session log</h2>
          <div className="mt-2 overflow-hidden rounded-xl border border-border-subtle bg-zinc-950 font-mono text-[11px] leading-relaxed">
            <div className="max-h-[min(520px,60vh)] overflow-y-auto">
              {log.map((row) => (
                <div key={row.id} className="flex gap-2 border-b border-border-subtle/50 px-3 py-2 last:border-b-0">
                  <span className="shrink-0 text-zinc-600">{row.t}</span>
                  <span
                    className={
                      row.level === 'error'
                        ? 'shrink-0 font-medium uppercase text-red-400/90'
                        : 'shrink-0 font-medium uppercase text-sky-400/80'
                    }
                  >
                    {row.level}
                  </span>
                  <span className="min-w-0 text-zinc-400">{row.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

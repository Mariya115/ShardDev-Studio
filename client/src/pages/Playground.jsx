import { useEffect, useState } from 'react'
import {
  CONTRACT_TEMPLATE_IDS,
  CONTRACT_TEMPLATE_LABELS,
  CONTRACT_TEMPLATES,
} from '../data/contractTemplates'
import { SolidityEditor } from '../components/SolidityEditor'
import { compileContracts } from '../services/api'
import { useDeployments } from '../hooks/useDeployments'

function deployDelayMs() {
  return 1000 + Math.floor(Math.random() * 1000)
}

function Spinner({ className = 'size-5' }) {
  return (
    <svg
      className={`animate-spin ${className}`}
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

export function Playground() {
  const { deployContract } = useDeployments()
  const [templateId, setTemplateId] = useState('counter')
  const [source, setSource] = useState(() => CONTRACT_TEMPLATES.counter)
  const [deploying, setDeploying] = useState(false)
  const [compiling, setCompiling] = useState(false)
  const [compileResult, setCompileResult] = useState(null)
  const [lastResult, setLastResult] = useState(null)
  const [toast, setToast] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 4200)
    return () => window.clearTimeout(id)
  }, [toast])

  const deploy = () => {
    setDeploying(true)
    setLastResult(null)
    setToast(null)

    const delay = deployDelayMs()
    window.setTimeout(() => {
      const entry = deployContract()
      setLastResult({ address: entry.address, deployedAt: entry.deployedAt })
      setDeploying(false)
      setToast({
        title: 'Deployed successfully',
        body: 'Contract address is saved to your Dashboard.',
      })
    }, delay)
  }

  const applyTemplate = (id) => {
    setTemplateId(id)
    setSource(CONTRACT_TEMPLATES[id])
  }

  const compile = async () => {
    setCompiling(true)
    setCompileResult(null)
    try {
      const result = await compileContracts()
      setCompileResult(result)
      setToast({
        title: result.success ? 'Compilation successful' : 'Compilation failed',
        body: result.success ? 'Contracts compiled with Hardhat.' : 'Fix errors shown in output panel.',
        error: !result.success,
      })
    } catch (error) {
      setCompileResult({ success: false, stdout: '', stderr: String(error) })
      setToast({ title: 'Compilation failed', body: 'Backend compile endpoint is unavailable.', error: true })
    } finally {
      setCompiling(false)
    }
  }

  const copyAddress = async () => {
    if (!lastResult?.address) return
    try {
      await navigator.clipboard.writeText(lastResult.address)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setToast({ title: 'Copy failed', body: 'Clipboard permission denied or unavailable.', error: true })
    }
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-zinc-950">
      {/* Indeterminate progress while deploying */}
      <div
        className={`pointer-events-none absolute left-0 right-0 top-0 z-40 h-0.5 overflow-hidden transition-opacity duration-300 ${
          deploying ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden
      >
        <div
          className="h-full w-1/3 rounded-full bg-accent"
          style={{ animation: 'deploy-bar 1.6s ease-in-out infinite' }}
        />
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl shadow-black/50 backdrop-blur-md transition-[opacity,transform] duration-300 sm:bottom-8 sm:right-8"
          style={{
            animation: 'toast-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
            background: 'oklch(0.18 0.012 260 / 0.96)',
            borderColor: toast.error ? 'oklch(0.55 0.2 25 / 0.45)' : 'oklch(0.72 0.14 195 / 0.35)',
          }}
        >
          <span
            className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
              toast.error ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            {toast.error ? (
              <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-sm font-semibold text-zinc-100">{toast.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">{toast.body}</p>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="-m-1 rounded-md p-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300"
            aria-label="Dismiss notification"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <header className="shrink-0 border-b border-border-subtle bg-zinc-950/95 px-6 py-6 backdrop-blur-sm sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-accent">Contracts</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">Contract Playground</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
              Write Solidity, deploy to a simulated network. Output shows the contract address and deployment
              status; records also sync to your Dashboard.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="whitespace-nowrap">Template</span>
              <select
                value={templateId}
                onChange={(e) => applyTemplate(e.target.value)}
                disabled={deploying}
                className="rounded-lg border border-border-subtle bg-surface-elevated py-2 pl-3 pr-8 text-sm font-medium text-zinc-200 outline-none ring-accent transition-opacity focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Contract template"
              >
                {CONTRACT_TEMPLATE_IDS.map((id) => (
                  <option key={id} value={id}>
                    {CONTRACT_TEMPLATE_LABELS[id]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs text-zinc-500 sm:mr-2">
              <span className="whitespace-nowrap">Compiler</span>
              <select
                disabled={deploying}
                className="rounded-lg border border-border-subtle bg-surface-elevated py-2 pl-3 pr-8 text-sm font-medium text-zinc-200 outline-none ring-accent transition-opacity focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option>solc 0.8.26</option>
                <option>solc 0.8.23</option>
                <option>solc 0.8.20</option>
              </select>
            </label>
            <button
              type="button"
              onClick={compile}
              disabled={deploying || compiling}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface-elevated px-5 py-2.5 text-sm font-semibold text-zinc-100 shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100"
            >
              {compiling ? (
                <>
                  <Spinner className="size-4" />
                  Compiling…
                </>
              ) : (
                'Compile'
              )}
            </button>
            <button
              type="button"
              onClick={deploy}
              disabled={deploying || compiling}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-sm transition-all hover:opacity-95 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100"
            >
              {deploying ? (
                <>
                  <Spinner className="size-4 text-zinc-950" />
                  Deploying…
                </>
              ) : (
                <>
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.59 14.37a6 6 0 0 1-5.82 5.81 6 6 0 0 1-.77-.05l-3.9 1.17 1.17-3.9a6 6 0 0 1-.05-.77 6 6 0 0 1 6.06-5.81M15.59 14.37l5.84-5.84M20.43 8.53l-1.52-1.52a1.75 1.75 0 0 0-2.47 0l-.91.91M20.43 8.53l-3.75-3.75"
                    />
                  </svg>
                  Deploy
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-0 lg:flex-row lg:gap-px lg:bg-border-subtle">
        <section className="flex min-h-[320px] flex-1 flex-col bg-zinc-950 lg:min-h-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle bg-surface px-4 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-zinc-800/80 px-2 py-0.5 font-mono text-xs font-medium text-zinc-400">
                Contract.sol
              </span>
              <span className="text-xs text-zinc-500">{CONTRACT_TEMPLATE_LABELS[templateId]}</span>
              <span className="text-xs text-zinc-600">{source.split('\n').length} lines</span>
            </div>
            <span
              className={`text-xs transition-colors ${deploying ? 'font-medium text-accent' : 'text-zinc-600'}`}
            >
              {deploying ? 'Deploying…' : 'Draft'}
            </span>
          </div>
          <div className="relative min-h-0 flex-1">
            <SolidityEditor
              value={source}
              onChange={setSource}
              disabled={deploying || compiling}
            />

            {deploying && (
              <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center bg-zinc-950/55 backdrop-blur-[2px] transition-opacity duration-300"
                aria-busy="true"
                aria-label="Deployment in progress"
              >
                <div className="flex items-center gap-3 rounded-2xl border border-zinc-600/50 bg-zinc-900/95 px-5 py-3.5 shadow-xl">
                  <Spinner className="size-6 text-accent" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-zinc-100">Broadcasting contract…</p>
                    <p className="text-xs text-zinc-500">Hang tight — almost there.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="flex w-full shrink-0 flex-col border-t border-border-subtle bg-surface lg:w-[420px] lg:border-t-0 lg:border-l">
          <div className="border-b border-border-subtle px-4 py-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Compilation & Deployment</h2>
          </div>

          <div className="flex flex-1 flex-col p-5">
            {compileResult && (
              <div className="mb-4 rounded-xl border border-border-subtle bg-surface-elevated p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Compile status</p>
                <p className={`mt-2 text-sm font-semibold ${compileResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                  {compileResult.success ? 'Success' : 'Failed'}
                </p>
                <pre className="mt-3 max-h-40 overflow-auto rounded-md bg-zinc-950/60 p-3 text-xs text-zinc-300">
                  {(compileResult.stderr || compileResult.stdout || 'No output').slice(0, 3000)}
                </pre>
              </div>
            )}
            {deploying && (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-accent/30 bg-accent-muted/20 px-6 py-12 text-center transition-colors duration-300">
                <Spinner className="size-12 text-accent" />
                <div>
                  <p className="text-sm font-medium text-zinc-200">Confirming on simulated chain…</p>
                  <p className="mt-1 text-xs text-zinc-500">Generating contract address and receipt.</p>
                </div>
              </div>
            )}

            {!deploying && lastResult && (
              <div className="animate-[toast-in_0.45s_cubic-bezier(0.16,1,0.3,1)_both] space-y-6">
                <div className="rounded-xl border border-border-subtle bg-surface-elevated p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Contract address</p>
                    <button
                      type="button"
                      onClick={copyAddress}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border-subtle bg-zinc-900/80 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 active:scale-[0.97]"
                    >
                      {copied ? (
                        <>
                          <svg className="size-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          Copied
                        </>
                      ) : (
                        <>
                          <svg className="size-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.793-2.1 1.833m0 7.334v2.25M3.098 10.638a2.25 2.25 0 011.423-2.09m12.758 0V9M9.75 9v4.125c0 .621.504 1.125 1.125 1.125h4.125M9.75 9h4.5m0 0V5.25m0 3.75v4.125c0 .621.504 1.125 1.125 1.125h4.125M9.75 9h1.875m-1.875 0H7.5m6.75 0H18"
                            />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-2 break-all font-mono text-sm font-medium tracking-tight text-accent">
                    {lastResult.address}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {new Date(lastResult.deployedAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'medium',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-3">
                  <span className="flex size-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-emerald-500/80">Status</p>
                    <p className="text-sm font-semibold text-emerald-400">Success</p>
                  </div>
                </div>
              </div>
            )}

            {!deploying && !lastResult && (
              <div className="flex flex-1 flex-col justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 px-5 py-10 text-center">
                <p className="text-sm text-zinc-400">No deployment yet</p>
                <p className="mx-auto mt-2 max-w-[240px] text-xs leading-relaxed text-zinc-600">
                  Click <span className="font-medium text-zinc-500">Deploy</span> to simulate a deployment and
                  see the contract address here.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

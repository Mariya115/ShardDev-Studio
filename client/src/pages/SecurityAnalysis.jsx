import { Suspense } from 'react'
import { TransactionChecker } from '../components/TransactionChecker'

export function SecurityAnalysis() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-zinc-400">Loading...</div>}>
      <TransactionChecker />
    </Suspense>
  )
}

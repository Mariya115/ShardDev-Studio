import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DEPLOYMENTS_STORAGE_KEY,
  deploymentsListsEqual,
  loadDeploymentsFromStorage,
  saveDeploymentsToStorage,
} from '../lib/deploymentsStorage'
import { DeploymentsContext } from './deploymentsContext'

/** Checksumm-free but realistic Ethereum address: `0x` + 40 lowercase hex (42 chars). */
function createFakeContractAddress() {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
  return `0x${hex}`
}

export function DeploymentsProvider({ children }) {
  const [deployments, setDeployments] = useState(() => loadDeploymentsFromStorage())

  const syncDeployments = useCallback(() => {
    setDeployments((prev) => {
      const next = loadDeploymentsFromStorage()
      return deploymentsListsEqual(prev, next) ? prev : next
    })
  }, [])

  /** Other tabs / windows: localStorage updates fire `storage` here. */
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== DEPLOYMENTS_STORAGE_KEY && e.key !== null) return
      setDeployments(loadDeploymentsFromStorage())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  /**
   * Append one deployment: `address` + `deployedAt` (ms timestamp).
   * Persists to localStorage so Dashboard (and refreshes) see the same data.
   */
  const deployContract = useCallback((options) => {
    const address =
      typeof options?.address === 'string' && options.address.startsWith('0x')
        ? options.address
        : createFakeContractAddress()

    const entry = {
      id: crypto.randomUUID(),
      address,
      deployedAt: Date.now(),
    }

    setDeployments((prev) => {
      const next = [entry, ...prev]
      saveDeploymentsToStorage(next)
      return next
    })

    return entry
  }, [])

  const value = useMemo(
    () => ({
      deployments,
      deployContract,
      syncDeployments,
    }),
    [deployments, deployContract, syncDeployments],
  )

  return <DeploymentsContext.Provider value={value}>{children}</DeploymentsContext.Provider>
}

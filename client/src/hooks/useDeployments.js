import { useContext } from 'react'
import { DeploymentsContext } from '../context/deploymentsContext'

/** Read/write deployments shared by Playground and Dashboard (backed by localStorage). */
export function useDeployments() {
  const ctx = useContext(DeploymentsContext)
  if (!ctx) {
    throw new Error('useDeployments must be used within DeploymentsProvider')
  }
  return ctx
}

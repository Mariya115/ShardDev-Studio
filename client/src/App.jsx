import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DeploymentsProvider } from './context/DeploymentsProvider'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Playground } from './pages/Playground'
import { Debugger } from './pages/Debugger'
import { SecurityAnalysis } from './pages/SecurityAnalysis'
import { Analytics } from './pages/Analytics'

export default function App() {
  return (
    <BrowserRouter>
      <DeploymentsProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="security" element={<SecurityAnalysis />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="playground" element={<Playground />} />
            <Route path="debugger" element={<Debugger />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </DeploymentsProvider>
    </BrowserRouter>
  )
}

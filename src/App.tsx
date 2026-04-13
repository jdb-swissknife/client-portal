import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import Activity from './pages/Activity'
import Pipeline from './pages/Pipeline'
import Reports from './pages/Reports'
import Layout from './components/Layout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { client, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-navy-500 rounded-full animate-spin" /></div>
  if (!client) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter basename="/client-portal">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/leads" element={<ProtectedRoute><Layout><Leads /></Layout></ProtectedRoute>} />
          <Route path="/activity" element={<ProtectedRoute><Layout><Activity /></Layout></ProtectedRoute>} />
          <Route path="/pipeline" element={<ProtectedRoute><Layout><Pipeline /></Layout></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from './supabase'

type Client = {
  id: string
  subdomain: string
  company_name: string
  contact_email: string
  contact_name: string | null
  plan: string
}

type AuthContextType = {
  client: Client | null
  loading: boolean
  login: (email: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  client: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on load
  useEffect(() => {
    const stored = localStorage.getItem('mv_client')
    if (stored) {
      try {
        setClient(JSON.parse(stored))
      } catch {
        localStorage.removeItem('mv_client')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string) => {
    if (!supabase) return { success: false, error: 'Service unavailable' }

    // Look up client by contact email
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('contact_email', email.toLowerCase().trim())
      .single()

    if (error || !data) {
      return { success: false, error: 'No account found for that email. Contact your MindVault rep.' }
    }

    setClient(data)
    localStorage.setItem('mv_client', JSON.stringify(data))
    return { success: true }
  }

  const logout = () => {
    setClient(null)
    localStorage.removeItem('mv_client')
  }

  return (
    <AuthContext.Provider value={{ client, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

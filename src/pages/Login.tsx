import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email)
    setLoading(false)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <svg width="36" height="36" viewBox="0 0 200 200">
            <path d="M100,8 L180,48 L180,115 Q180,168 100,195 Q20,168 20,115 L20,48 Z" fill="#1a2a6c" stroke="#1a2a6c" strokeWidth="6" strokeLinejoin="miter"/>
            <path d="M100,22 L168,56 L168,112 Q168,158 100,182 Q32,158 32,112 L32,56 Z" fill="none" stroke="#4f6ef7" strokeWidth="2.5" strokeLinejoin="miter"/>
            <path d="M52,138 L52,80 L77,110 L100,80 L100,138" fill="none" stroke="#ffffff" strokeWidth="9" strokeLinecap="square" strokeLinejoin="miter"/>
            <path d="M52,138 L52,80 L77,110 L100,80 L100,138" fill="none" stroke="#1a2a6c" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter"/>
            <path d="M100,80 L126,122 L152,80" fill="none" stroke="#4f6ef7" strokeWidth="9" strokeLinecap="square" strokeLinejoin="miter"/>
            <path d="M100,80 L126,122 L152,80" fill="none" stroke="#1a2a6c" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter"/>
          </svg>
          <span className="text-xl font-bold text-navy-900 tracking-tight">
            Mind<tspan className="text-navy-500">Vault</tspan>
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-6">Sign in with the email your MindVault rep set up for you.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm bg-white text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2.5">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-navy-900 text-white font-semibold text-sm hover:bg-navy-950 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          Trouble signing in? Email <a href="mailto:hello@mindvaultstudio.net" className="text-navy-500">hello@mindvaultstudio.net</a>
        </p>
      </div>
    </div>
  )
}

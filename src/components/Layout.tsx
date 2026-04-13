import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { LayoutDashboard, Users, Activity as ActivityIcon, LogOut } from 'lucide-react'

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Leads', icon: Users, path: '/leads' },
  { name: 'Activity', icon: ActivityIcon, path: '/activity' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { client, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-gray-200 flex flex-col z-40">
        {/* Logo + company */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <svg width="28" height="28" viewBox="0 0 200 200">
              <path d="M100,8 L180,48 L180,115 Q180,168 100,195 Q20,168 20,115 L20,48 Z" fill="#1a2a6c" stroke="#1a2a6c" strokeWidth="6" strokeLinejoin="miter"/>
              <path d="M100,22 L168,56 L168,112 Q168,158 100,182 Q32,158 32,112 L32,56 Z" fill="none" stroke="#4f6ef7" strokeWidth="2.5" strokeLinejoin="miter"/>
              <path d="M52,138 L52,80 L77,110 L100,80 L100,138" fill="none" stroke="#ffffff" strokeWidth="9" strokeLinecap="square" strokeLinejoin="miter"/>
              <path d="M52,138 L52,80 L77,110 L100,80 L100,138" fill="none" stroke="#1a2a6c" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter"/>
              <path d="M100,80 L126,122 L152,80" fill="none" stroke="#4f6ef7" strokeWidth="9" strokeLinecap="square" strokeLinejoin="miter"/>
              <path d="M100,80 L126,122 L152,80" fill="none" stroke="#1a2a6c" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter"/>
            </svg>
            <span className="text-sm font-bold text-navy-900 tracking-tight">
              Mind<tspan className="text-navy-500">Vault</tspan>
            </span>
          </div>
          <p className="text-xs font-medium text-gray-500 truncate">{client?.company_name}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-navy-50 text-navy-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
          <p className="text-[10px] text-gray-300 px-3 mt-2">Powered by MindVault Studio</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 p-8">
        {children}
      </main>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { Clock, Users, Zap, ArrowUpRight, TrendingUp, CheckCircle } from 'lucide-react'

type Lead = { id: string; email: string; phone: string | null; source: string; created_at: string }
type ActivityItem = { id: string; action: string; details: string; created_at: string }

export default function Dashboard() {
  const { client } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase || !client) return
    const fetchData = async () => {
      const [leadsRes, activityRes] = await Promise.all([
        supabase.from('client_leads').select('*').eq('client_id', client.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('client_activity').select('*').eq('client_id', client.id).order('created_at', { ascending: false }).limit(20),
      ])
      setLeads(leadsRes.data || [])
      setActivity(activityRes.data || [])
      setLoading(false)
    }
    fetchData()
  }, [client])

  // Stats
  const totalLeads = leads.length
  const today = leads.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length
  const thisWeek = leads.filter(l => {
    const d = new Date(l.created_at)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return d >= weekAgo
  }).length
  const actionsToday = activity.filter(a => new Date(a.created_at).toDateString() === new Date().toDateString()).length

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-gray-200 border-t-navy-500 rounded-full animate-spin" /></div>
  }

  return (
    <div className="max-w-5xl">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{greeting}, {client?.contact_name?.split(' ')[0] || 'there'}</h1>
        <p className="text-sm text-gray-500 mt-1">Here's what your AI agents have been up to.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total Leads" value={totalLeads.toString()} color="blue" />
        <StatCard icon={Zap} label="Today" value={today.toString()} color="emerald" />
        <StatCard icon={TrendingUp} label="This Week" value={thisWeek.toString()} color="purple" />
        <StatCard icon={CheckCircle} label="Actions Today" value={actionsToday.toString()} color="amber" />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent Leads</h2>
            <span className="text-xs text-gray-400">{leads.length} total</span>
          </div>
          <div className="divide-y divide-gray-50">
            {leads.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">No leads yet. They'll appear here when they come in.</div>
            ) : leads.slice(0, 8).map(lead => (
              <div key={lead.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{lead.email}</p>
                  <p className="text-xs text-gray-400">{lead.phone || 'No phone'}</p>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(lead.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Agent Activity</h2>
            <span className="text-xs text-gray-400">{activity.length} actions</span>
          </div>
          <div className="divide-y divide-gray-50">
            {activity.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">No activity yet. Your agents will log actions here.</div>
            ) : activity.slice(0, 8).map(item => (
              <div key={item.id} className="px-6 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{item.action}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{item.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
  }
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]} mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

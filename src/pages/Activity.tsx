import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { RefreshCw, Bot, Mail, Phone, MessageSquare, CheckCircle } from 'lucide-react'

type ActivityItem = { id: string; action: string; details: string; agent_name: string | null; created_at: string }

const actionIcons: Record<string, any> = {
  'lead_response': Mail,
  'follow_up': Phone,
  'email_sent': Mail,
  'text_sent': MessageSquare,
  'task_completed': CheckCircle,
}

const actionColors: Record<string, string> = {
  'lead_response': 'bg-blue-100 text-blue-600',
  'follow_up': 'bg-purple-100 text-purple-600',
  'email_sent': 'bg-emerald-100 text-emerald-600',
  'text_sent': 'bg-amber-100 text-amber-600',
  'task_completed': 'bg-green-100 text-green-600',
}

export default function Activity() {
  const { client } = useAuth()
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchActivity = async () => {
    if (!supabase || !client) return
    setLoading(true)
    const { data } = await supabase
      .from('client_activity')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(100)
    setActivity(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchActivity() }, [client])

  const today = activity.filter(a => new Date(a.created_at).toDateString() === new Date().toDateString()).length
  const thisWeek = activity.filter(a => {
    const d = new Date(a.created_at)
    return d >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }).length

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
          <p className="text-sm text-gray-500 mt-1">Everything your AI agents have done</p>
        </div>
        <button onClick={fetchActivity} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Actions</p>
          <p className="text-2xl font-bold text-gray-900">{activity.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Today</p>
          <p className="text-2xl font-bold text-gray-900">{today}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">This Week</p>
          <p className="text-2xl font-bold text-gray-900">{thisWeek}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-4 border-gray-200 border-t-navy-500 rounded-full animate-spin" /></div>
        ) : activity.length === 0 ? (
          <div className="text-center py-16">
            <Bot className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No activity yet. Your agents will log actions here as they work.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {activity.map(item => {
              const Icon = actionIcons[item.action] || CheckCircle
              const color = actionColors[item.action] || 'bg-gray-100 text-gray-600'
              return (
                <div key={item.id} className="px-6 py-4 flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{item.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      <p className="text-xs text-gray-400 flex-shrink-0 ml-4">
                        {new Date(item.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{item.details}</p>
                    {item.agent_name && (
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Bot className="w-3 h-3" />
                        {item.agent_name}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

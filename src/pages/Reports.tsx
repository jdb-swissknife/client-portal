import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { BarChart3, TrendingUp, TrendingDown, Minus, Download } from 'lucide-react'

type DayBucket = { date: string; leads: number; actions: number }

export default function Reports() {
  const { client } = useAuth()
  const [leads, setLeads] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase || !client) return
    const fetchData = async () => {
      const [leadsRes, activityRes] = await Promise.all([
        supabase.from('client_leads').select('created_at').eq('client_id', client.id).order('created_at', { ascending: false }),
        supabase.from('client_activity').select('action, created_at').eq('client_id', client.id).order('created_at', { ascending: false }),
      ])
      setLeads(leadsRes.data || [])
      setActivity(activityRes.data || [])
      setLoading(false)
    }
    fetchData()
  }, [client])

  // Build 7-day buckets
  const last7: DayBucket[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dayLeads = leads.filter(l => l.created_at.startsWith(dateStr)).length
    const dayActions = activity.filter(a => a.created_at.startsWith(dateStr)).length
    last7.push({ date: dateStr, leads: dayLeads, actions: dayActions })
  }

  const maxLeads = Math.max(...last7.map(d => d.leads), 1)
  const maxActions = Math.max(...last7.map(d => d.actions), 1)

  // Week over week
  const thisWeekLeads = leads.filter(l => new Date(l.created_at) >= new Date(Date.now() - 7 * 86400000)).length
  const lastWeekLeads = leads.filter(l => {
    const d = new Date(l.created_at)
    return d >= new Date(Date.now() - 14 * 86400000) && d < new Date(Date.now() - 7 * 86400000)
  }).length
  const leadsTrend = lastWeekLeads === 0 ? 0 : Math.round(((thisWeekLeads - lastWeekLeads) / lastWeekLeads) * 100)

  // Response rate
  const leadResponses = activity.filter(a => a.action === 'lead_response').length
  const totalLeads = leads.length
  const responseRate = totalLeads > 0 ? Math.round((leadResponses / totalLeads) * 100) : 0

  // Action breakdown
  const actionCounts: Record<string, number> = {}
  activity.forEach(a => { actionCounts[a.action] = (actionCounts[a.action] || 0) + 1 })
  const sortedActions = Object.entries(actionCounts).sort((a, b) => b[1] - a[1])

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-gray-200 border-t-navy-500 rounded-full animate-spin" /></div>
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weekly Report</h1>
          <p className="text-sm text-gray-500 mt-1">Board packet -- performance at a glance</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard label="Leads This Week" value={thisWeekLeads.toString()} trend={leadsTrend} />
        <KPICard label="Response Rate" value={`${responseRate}%`} trend={responseRate >= 90 ? 100 : responseRate >= 50 ? 0 : -100} />
        <KPICard label="Total Actions" value={activity.length.toString()} />
        <KPICard label="Avg Leads/Day" value={(totalLeads / 7).toFixed(1)} />
      </div>

      {/* 7-Day Chart */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
        <h2 className="text-sm font-semibold text-gray-900 mb-6">Last 7 Days</h2>
        <div className="flex items-end gap-3 h-40">
          {last7.map(day => {
            const leadH = Math.max((day.leads / maxLeads) * 100, 4)
            const actionH = Math.max((day.actions / maxActions) * 100, 4)
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-end gap-1 h-32 w-full">
                  <div className="flex-1 flex flex-col justify-end">
                    <div className="rounded-t-md bg-navy-500 transition-all" style={{ height: `${leadH}%` }} />
                  </div>
                  <div className="flex-1 flex flex-col justify-end">
                    <div className="rounded-t-md bg-emerald-400 transition-all" style={{ height: `${actionH}%` }} />
                  </div>
                </div>
                <span className="text-[10px] text-gray-400">
                  {new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-navy-500" />
            <span className="text-xs text-gray-500">Leads</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-400" />
            <span className="text-xs text-gray-500">Actions</span>
          </div>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Breakdown */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Action Breakdown</h2>
          </div>
          <div className="p-6">
            {sortedActions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center">No actions yet</p>
            ) : (
              <div className="space-y-4">
                {sortedActions.map(([action, count]) => {
                  const pct = Math.round((count / activity.length) * 100)
                  return (
                    <div key={action}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 capitalize">{action.replace(/_/g, ' ')}</span>
                        <span className="text-sm text-gray-500">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-navy-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Lead Sources */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Lead Sources</h2>
          </div>
          <div className="p-6">
            {(() => {
              const sources: Record<string, number> = {}
              leads.forEach(l => { sources[l.source || 'unknown'] = (sources[l.source || 'unknown'] || 0) + 1 })
              const sorted = Object.entries(sources).sort((a, b) => b[1] - a[1])
              if (sorted.length === 0) return <p className="text-sm text-gray-400 text-center">No leads yet</p>
              return (
                <div className="space-y-4">
                  {sorted.map(([source, count]) => {
                    const pct = Math.round((count / leads.length) * 100)
                    return (
                      <div key={source}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 capitalize">{source}</span>
                          <span className="text-sm text-gray-500">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}

function KPICard({ label, value, trend }: { label: string; value: string; trend?: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend !== undefined && trend !== 0 && (
          <span className={`text-xs font-medium flex items-center gap-0.5 mb-1 ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  )
}

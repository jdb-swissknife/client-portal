import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { DollarSign, TrendingUp, Clock, CheckCircle, ArrowUpRight, BarChart3 } from 'lucide-react'

type Deal = {
  id: string
  title: string
  contact_name: string | null
  contact_email: string | null
  value: number | null
  stage: string
  probability: number | null
  next_action: string | null
  next_action_date: string | null
  created_at: string
  updated_at: string
}

const STAGES = [
  { key: 'new_lead', label: 'New Lead', color: 'bg-gray-100 text-gray-700' },
  { key: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-700' },
  { key: 'qualified', label: 'Qualified', color: 'bg-purple-100 text-purple-700' },
  { key: 'proposal', label: 'Proposal', color: 'bg-amber-100 text-amber-700' },
  { key: 'negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-700' },
  { key: 'closed_won', label: 'Closed Won', color: 'bg-emerald-100 text-emerald-700' },
  { key: 'closed_lost', label: 'Closed Lost', color: 'bg-red-100 text-red-700' },
]

export default function Pipeline() {
  const { client } = useAuth()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase || !client) return
    const fetchDeals = async () => {
      const { data } = await supabase
        .from('client_deals')
        .select('*')
        .eq('client_id', client.id)
        .order('updated_at', { ascending: false })
      setDeals(data || [])
      setLoading(false)
    }
    fetchDeals()
  }, [client])

  // Stats
  const totalValue = deals.filter(d => d.stage !== 'closed_lost').reduce((sum, d) => sum + (d.value || 0), 0)
  const activeDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length
  const wonValue = deals.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + (d.value || 0), 0)
  const avgDealSize = wonValue / (deals.filter(d => d.stage === 'closed_won').length || 1)
  const winRate = deals.length > 0
    ? Math.round((deals.filter(d => d.stage === 'closed_won').length / deals.filter(d => ['closed_won', 'closed_lost'].includes(d.stage)).length) * 100) || 0
    : 0

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-gray-200 border-t-navy-500 rounded-full animate-spin" /></div>
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">Revenue report -- every deal, every stage</p>
      </div>

      {/* CFO Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 lg:col-span-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Pipeline Value</p>
          <p className="text-3xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">{activeDeals} active deals</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Won</p>
          <p className="text-3xl font-bold text-emerald-600">${wonValue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Avg Deal</p>
          <p className="text-3xl font-bold text-gray-900">${Math.round(avgDealSize).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Win Rate</p>
          <p className="text-3xl font-bold text-gray-900">{winRate}%</p>
        </div>
      </div>

      {/* Stage columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAGES.filter(s => !['closed_won', 'closed_lost'].includes(s.key)).map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage.key)
          const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0)
          return (
            <div key={stage.key} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stage.color}`}>{stage.label}</span>
                  <span className="text-xs text-gray-400">{stageDeals.length}</span>
                </div>
                <p className="text-sm font-semibold text-gray-700 mt-1">${stageValue.toLocaleString()}</p>
              </div>
              <div className="p-3 space-y-2 min-h-[80px]">
                {stageDeals.length === 0 ? (
                  <p className="text-xs text-gray-300 text-center py-4">No deals</p>
                ) : stageDeals.map(deal => (
                  <div key={deal.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{deal.title}</p>
                    {deal.contact_name && <p className="text-xs text-gray-500 mt-0.5">{deal.contact_name}</p>}
                    <div className="flex items-center justify-between mt-2">
                      {deal.value ? (
                        <span className="text-sm font-semibold text-gray-900">${deal.value.toLocaleString()}</span>
                      ) : <span />}
                      {deal.next_action && (
                        <span className="text-[10px] text-gray-400 truncate ml-2 max-w-[100px]">{deal.next_action}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Closed deals */}
      {deals.filter(d => ['closed_won', 'closed_lost'].includes(d.stage)).length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Closed Deals</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {['closed_won', 'closed_lost'].map(stageKey => {
              const stage = STAGES.find(s => s.key === stageKey)!
              const stageDeals = deals.filter(d => d.stage === stageKey)
              if (stageDeals.length === 0) return null
              return (
                <div key={stageKey} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stage.color}`}>{stage.label}</span>
                    <span className="text-sm font-semibold text-gray-700 ml-3">
                      ${stageDeals.reduce((s, d) => s + (d.value || 0), 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {stageDeals.map(deal => (
                      <div key={deal.id} className="px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{deal.title}</p>
                          {deal.contact_name && <p className="text-xs text-gray-500">{deal.contact_name}</p>}
                        </div>
                        {deal.value && <p className="text-sm font-semibold text-gray-900">${deal.value.toLocaleString()}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

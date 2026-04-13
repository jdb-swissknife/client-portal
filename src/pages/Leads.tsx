import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { Mail, Phone, RefreshCw, Download } from 'lucide-react'

type Lead = { id: string; email: string; phone: string | null; source: string; created_at: string }

export default function Leads() {
  const { client } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLeads = async () => {
    if (!supabase || !client) return
    setLoading(true)
    const { data } = await supabase
      .from('client_leads')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(100)
    setLeads(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchLeads() }, [client])

  const exportCSV = () => {
    const header = 'Email,Phone,Source,Created\n'
    const rows = leads.map(l =>
      `"${l.email}","${l.phone || ''}","${l.source}","${new Date(l.created_at).toLocaleString()}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalLeads = leads.length
  const withPhone = leads.filter(l => l.phone).length
  const today = leads.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">Every lead your agents have captured</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchLeads} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={exportCSV} disabled={leads.length === 0} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-navy-500 rounded-xl hover:bg-navy-600 disabled:opacity-40">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Today</p>
          <p className="text-2xl font-bold text-gray-900">{today}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">With Phone</p>
          <p className="text-2xl font-bold text-gray-900">{withPhone}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-4 border-gray-200 border-t-navy-500 rounded-full animate-spin" /></div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No leads yet. They'll show up here when they come in.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{lead.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{lead.phone || <span className="text-gray-300">Not provided</span>}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{lead.source}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(lead.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { ArrowLeft, ChevronDown, ChevronUp, ExternalLink, Search, Phone, ChevronLeft, ChevronRight } from 'lucide-react'

const STATUS_OPTIONS = ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled']
const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  dispatched: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const PAGE_SIZE = 20
const FILTERS = ['all', ...STATUS_OPTIONS]

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const requestId = useRef(0)

  // wait for the admin to stop typing before searching
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(0) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    const id = ++requestId.current
    const load = async () => {
      setLoading(true)
      try {
        let q = supabase
          .from('orders')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

        if (statusFilter !== 'all') q = q.eq('status', statusFilter)

        if (search) {
          const idPrefix = search.replace(/^#/, '')
          if (/^[0-9a-f]{8}$/i.test(idPrefix)) {
            // the short order id shown in Telegram / on the customer's confirmation
            const p = idPrefix.toLowerCase()
            q = q.gte('id', `${p}-0000-0000-0000-000000000000`).lte('id', `${p}-ffff-ffff-ffff-ffffffffffff`)
          } else {
            const term = search.replace(/[,()%*\\"']/g, ' ').trim()
            if (term) q = q.or(`customer_name.ilike.%${term}%,phone.ilike.%${term}%,city.ilike.%${term}%`)
          }
        }

        const { data, count, error } = await q
        if (id !== requestId.current) return // a newer request replaced this one
        if (error) throw error
        setOrders(data || [])
        setTotal(count ?? (data || []).length)
      } catch (err) {
        if (id === requestId.current) toast.error('Failed to load orders: ' + err.message)
      } finally {
        if (id === requestId.current) setLoading(false)
      }
    }
    load()
  }, [statusFilter, search, page])

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id)
      if (error) throw error
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      toast.success('Order status updated!')
    } catch (err) {
      toast.error('Update failed: ' + err.message)
    }
  }

  const toggleExpand = (id) => setExpanded(prev => prev === id ? null : id)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">All Orders</h1>
        <span className="ml-auto text-sm text-gray-400 mr-2">{total} order{total === 1 ? '' : 's'}</span>
        <Link
          to="/"
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Website
        </Link>
      </div>

      {/* Search + status filter */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by name, phone, city or order ID (e.g. ABCDEF12)"
            className="w-full border border-gray-300 rounded-xl pl-9 pr-3 py-2.5 text-sm bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => { setStatusFilter(f); setPage(0) }}
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors capitalize ${
                statusFilter === f ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-5xl">📦</span>
          <p className="text-gray-500 mt-4">{search || statusFilter !== 'all' ? 'No orders match your search' : 'No orders yet'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Row */}
              <div className="flex flex-wrap items-center gap-4 p-4 cursor-pointer" onClick={() => toggleExpand(order.id)}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-gray-400">{String(order.id).slice(0, 8)}...</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm mt-0.5">{order.customer_name}</p>
                  <p className="text-xs text-gray-400">{order.phone} · {order.city}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-700">₹{Number(order.total).toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                </div>
                <select
                  value={order.status}
                  onClick={e => e.stopPropagation()}
                  onChange={e => updateStatus(order.id, e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
                {expanded === order.id
                  ? <ChevronUp className="w-4 h-4 text-gray-400" />
                  : <ChevronDown className="w-4 h-4 text-gray-400" />
                }
              </div>

              {/* Expanded Details */}
              {expanded === order.id && (
                <div className="border-t bg-gray-50 p-4 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase mb-1">Delivery Address</p>
                      <p className="text-gray-700">{order.address}</p>
                      <p className="text-gray-700">{order.city} - {order.pincode}</p>
                      {order.landmark && <p className="text-gray-500 text-xs">Near: {order.landmark}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase mb-1">Contact</p>
                      <p className="text-gray-700">{order.email}</p>
                      <a href={`tel:${order.phone}`} className="inline-flex items-center gap-1 text-green-700 font-medium hover:underline"><Phone className="w-3.5 h-3.5" />{order.phone}</a>
                      {order.notes && (
                        <p className="text-xs text-gray-500 mt-1">Notes: {order.notes}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase mb-2">Items</p>
                    <div className="space-y-1">
                      {(Array.isArray(order.items) ? order.items : []).map((item, i) => (
                        <div key={i} className="flex justify-between text-gray-700">
                          <span>{item.name} x{item.quantity}</span>
                          <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button disabled={page === 0 || loading} onClick={() => setPage(p => p - 1)}
            className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50">
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-sm text-gray-500">Page {page + 1} of {pageCount}</span>
          <button disabled={page + 1 >= pageCount || loading} onClick={() => setPage(p => p + 1)}
            className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

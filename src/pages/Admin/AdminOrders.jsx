import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { ArrowLeft, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

const STATUS_OPTIONS = ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled']
const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  dispatched: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      toast.error('Failed to load orders: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

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
        <span className="ml-auto text-sm text-gray-400 mr-2">{orders.length} orders</span>
        <Link
          to="/"
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Website
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-5xl">📦</span>
          <p className="text-gray-500 mt-4">No orders yet</p>
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
                      <p className="text-gray-700">{order.phone}</p>
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
    </div>
  )
}

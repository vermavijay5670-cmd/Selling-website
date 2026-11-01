import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { supabase } from '../lib/supabase'
import { Leaf, Package, LogOut, ShoppingBag, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'

const STATUS_STEPS = ['pending', 'confirmed', 'dispatched', 'delivered']

const STATUS_INFO = {
  pending:    { label: 'Order Placed',     icon: '📋', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  confirmed:  { label: 'Confirmed',        icon: '✅', color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200' },
  dispatched: { label: 'Out for Delivery', icon: '🚚', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  delivered:  { label: 'Delivered',        icon: '🎉', color: 'text-green-600',  bg: 'bg-green-50 border-green-200' },
  cancelled:  { label: 'Cancelled',        icon: '❌', color: 'text-red-600',    bg: 'bg-red-50 border-red-200' },
}

function StatusTracker({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
        <span className="text-xl">❌</span>
        <span className="text-red-600 font-semibold text-sm">Order Cancelled</span>
      </div>
    )
  }
  const currentIdx = STATUS_STEPS.indexOf(status)
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {STATUS_STEPS.map((step, idx) => {
        const done = idx <= currentIdx
        const active = idx === currentIdx
        return (
          <div key={step} className="flex items-center gap-1 flex-shrink-0">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${done ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-300 text-gray-400'} ${active ? 'ring-2 ring-green-300 ring-offset-1' : ''}`}>
                {done ? '✓' : idx + 1}
              </div>
              <span className={`text-xs mt-1 font-medium ${done ? 'text-green-700' : 'text-gray-400'} whitespace-nowrap`}>
                {STATUS_INFO[step]?.label}
              </span>
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`w-8 h-0.5 mb-4 flex-shrink-0 rounded ${done && idx < currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function CustomerOrders() {
  const { customer, signOut, customerLoading } = useCustomerAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!customerLoading && !customer) navigate('/login')
  }, [customer, customerLoading, navigate])

  useEffect(() => {
    if (customer) fetchOrders()
  }, [customer])

  const fetchOrders = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', customer.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      console.error('Orders fetch error:', err)
      setOrders([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  if (customerLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (!customer) return null

  const displayName = customer.user_metadata?.full_name || customer.email?.split('@')[0] || 'Customer'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-green-700 font-bold text-lg">
            <Leaf className="w-5 h-5" />
            GreenBasket
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700">{displayName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
            <p className="text-sm text-gray-500 mt-0.5">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-medium px-3 py-2 rounded-lg hover:bg-green-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              to="/products"
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop More
            </Link>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 py-20 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders yet</h3>
            <p className="text-gray-400 text-sm mb-6">Your order history will appear here</p>
            <Link to="/products" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-full transition-colors">
              <ShoppingBag className="w-4 h-4" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const info = STATUS_INFO[order.status] || STATUS_INFO.pending
              const isExpanded = expanded === order.id
              const items = Array.isArray(order.items) ? order.items : []
              const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              const orderTime = new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Order Header - always visible */}
                  <div
                    className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : order.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                            #{String(order.id).slice(0, 8).toUpperCase()}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${info.bg} ${info.color}`}>
                            {info.icon} {info.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{orderDate} at {orderTime}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {items.length} item{items.length !== 1 ? 's' : ''} · {order.payment_method?.toUpperCase() || 'COD'}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-lg font-bold text-green-700">₹{Number(order.total).toFixed(2)}</p>
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4 text-gray-400" />
                          : <ChevronDown className="w-4 h-4 text-gray-400" />
                        }
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50">
                      {/* Status Tracker */}
                      <div className="px-5 py-4 border-b border-gray-100 bg-white">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Order Status</p>
                        <StatusTracker status={order.status} />
                      </div>

                      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Items */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Items Ordered</p>
                          <div className="space-y-2">
                            {items.map((item, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" onError={e => { e.target.style.display='none' }} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                                  <p className="text-xs text-gray-400">{item.unit} × {item.quantity}</p>
                                </div>
                                <span className="text-sm font-semibold text-gray-700">₹{(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-sm font-bold text-gray-800">
                            <span>Total</span>
                            <span className="text-green-700">₹{Number(order.total).toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Delivery Info */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Delivery Details</p>
                          <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex gap-2">
                              <span className="text-gray-400">📍</span>
                              <div>
                                <p>{order.address}</p>
                                <p>{order.city} - {order.pincode}</p>
                                {order.landmark && <p className="text-xs text-gray-400">Near: {order.landmark}</p>}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-gray-400">📞</span>
                              <p>{order.phone}</p>
                            </div>
                            {order.notes && (
                              <div className="flex gap-2">
                                <span className="text-gray-400">📝</span>
                                <p className="text-gray-500 italic">{order.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

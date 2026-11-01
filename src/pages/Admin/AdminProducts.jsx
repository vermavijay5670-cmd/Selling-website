import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { products as localProducts } from '../../data/products'
import toast from 'react-hot-toast'
import { Save, ArrowLeft, ToggleLeft, ToggleRight, ExternalLink } from 'lucide-react'

export default function AdminProducts() {
  const [productList, setProductList] = useState(
    localProducts.map(p => ({ ...p, active: true }))
  )
  const [saving, setSaving] = useState({})

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data } = await supabase.from('products').select('*')
      if (data && data.length > 0) {
        setProductList(data)
      }
    } catch (err) {
      console.warn('Using local product data:', err.message)
    }
  }

  const handleStockChange = (id, value) => {
    setProductList(prev =>
      prev.map(p => p.id === id ? { ...p, stock: Number(value) } : p)
    )
  }

  const handleToggleActive = (id) => {
    setProductList(prev =>
      prev.map(p => p.id === id ? { ...p, active: !p.active } : p)
    )
  }

  const handleSave = async (product) => {
    setSaving(prev => ({ ...prev, [product.id]: true }))
    try {
      const { error } = await supabase
        .from('products')
        .upsert({ ...product })
      if (error) throw error
      toast.success(`${product.name} updated!`)
    } catch (err) {
      toast.error('Save failed: ' + err.message)
    } finally {
      setSaving(prev => ({ ...prev, [product.id]: false }))
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Manage Products</h1>
        <Link
          to="/"
          className="ml-auto flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Website
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Active</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {productList.map(product => (
              <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${!product.active ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={product.image} alt={product.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                    <span className="font-medium text-gray-800">{product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 capitalize">{product.category}</td>
                <td className="px-4 py-3 text-green-700 font-semibold">₹{product.price}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="0"
                    value={product.stock}
                    onChange={e => handleStockChange(product.id, e.target.value)}
                    className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggleActive(product.id)} className="transition-colors">
                    {product.active
                      ? <ToggleRight className="w-6 h-6 text-green-600" />
                      : <ToggleLeft className="w-6 h-6 text-gray-400" />
                    }
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleSave(product)}
                    disabled={saving[product.id]}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saving[product.id] ? 'Saving...' : 'Save'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

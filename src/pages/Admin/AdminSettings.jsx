import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'
import toast from 'react-hot-toast'
import { ArrowLeft, ExternalLink, Leaf, Loader2 } from 'lucide-react'

const input = 'w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400'
const label = 'block text-sm font-medium text-gray-700 mb-1'

export default function AdminSettings() {
  const { settings, updateSettings } = useSettings()
  const [form, setForm] = useState(settings)
  const [saving, setSaving] = useState(false)

  const set = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const dirty = Object.keys(settings).some(k => (form[k] ?? '').trim() !== settings[k])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const clean = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, (v ?? '').trim()]))
    if (clean.shop_name.length < 2 || clean.shop_name.length > 40) return toast.error('Shop name must be 2–40 characters')
    if (clean.phone && !/^[+\d][\d\s()-]{6,19}$/.test(clean.phone)) return toast.error('Enter a valid phone number')
    if (clean.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) return toast.error('Enter a valid email address')
    setSaving(true)
    try {
      await updateSettings(clean)
      setForm(clean)
      toast.success('Settings saved!')
    } catch (err) {
      toast.error(err.message || 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Shop Settings</h1>
        <Link to="/" className="ml-auto flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 rounded-full transition-colors">
          <ExternalLink className="w-3.5 h-3.5" /> View Website
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">Shop</h2>
          <div>
            <label className={label}>Shop Name</label>
            <input name="shop_name" value={form.shop_name} onChange={set} maxLength={40} placeholder="e.g. Sharma Fresh Mart" className={input} />
            <p className="text-xs text-gray-400 mt-1">Shown in the header, footer, login pages, browser tab and admin panel.</p>
          </div>
          <div>
            <label className={label}>Footer Description</label>
            <textarea name="tagline" value={form.tagline} onChange={set} rows={3} maxLength={200} className={input} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Preview</p>
            <div className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-xl px-4 py-3 flex items-center gap-2 text-white font-bold text-xl">
              <Leaf className="w-6 h-6 text-green-200" />
              <span className="tracking-tight truncate">{form.shop_name.trim() || '—'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">Contact Details <span className="text-xs font-normal text-gray-400">(shown in the website footer; leave blank to hide)</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>Phone</label>
              <input name="phone" type="tel" value={form.phone} onChange={set} placeholder="+91 98765 43210" className={input} />
            </div>
            <div>
              <label className={label}>Email</label>
              <input name="email" type="email" value={form.email} onChange={set} placeholder="hello@yourshop.in" className={input} />
            </div>
          </div>
          <div>
            <label className={label}>Address</label>
            <textarea name="address" value={form.address} onChange={set} rows={3} placeholder={'Shop no., Street,\nCity, State PIN'} className={input} />
          </div>
        </div>

        <button type="submit" disabled={saving || !dirty}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'
import toast from 'react-hot-toast'
import { ArrowLeft, ExternalLink, Leaf, Loader2, Plus, Trash2, Star } from 'lucide-react'

// trim every text field so "changed?" ignores stray spaces
const normalize = (v) => Object.fromEntries(Object.entries(v).map(([k, x]) =>
  [k, k === 'testimonials'
    ? (x || []).map(t => ({ name: (t.name || '').trim(), city: (t.city || '').trim(), text: (t.text || '').trim(), stars: Number(t.stars) || 5 }))
    : (x ?? '').trim()]))

const input = 'w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400'
const label = 'block text-sm font-medium text-gray-700 mb-1'

export default function AdminSettings() {
  const { settings, updateSettings } = useSettings()
  const [form, setForm] = useState(settings)
  const [saving, setSaving] = useState(false)

  const set = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const dirty = JSON.stringify(normalize(form)) !== JSON.stringify(normalize(settings))

  const setReview = (i, key, value) =>
    setForm(prev => ({ ...prev, testimonials: prev.testimonials.map((t, idx) => idx === i ? { ...t, [key]: value } : t) }))
  const addReview = () =>
    setForm(prev => ({ ...prev, testimonials: [...prev.testimonials, { name: '', city: '', text: '', stars: 5 }] }))
  const removeReview = (i) =>
    setForm(prev => ({ ...prev, testimonials: prev.testimonials.filter((_, idx) => idx !== i) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const clean = normalize(form)
    if (clean.shop_name.length < 2 || clean.shop_name.length > 40) return toast.error('Shop name must be 2–40 characters')
    if (clean.phone && !/^[+\d][\d\s()-]{6,19}$/.test(clean.phone)) return toast.error('Enter a valid phone number')
    if (clean.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) return toast.error('Enter a valid email address')
    if (clean.whatsapp && clean.whatsapp.replace(/\D/g, '').length < 10) return toast.error('Enter the WhatsApp number with country code, e.g. 919876543210')
    if (clean.testimonials.some(t => !t.name || !t.text)) return toast.error('Each review needs a name and text (or remove the empty one)')
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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">Social Links <span className="text-xs font-normal text-gray-400">(an icon appears in the footer only for the ones you fill in)</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>Instagram</label>
              <input name="instagram" value={form.instagram} onChange={set} placeholder="@yourshop or full link" className={input} />
            </div>
            <div>
              <label className={label}>Facebook</label>
              <input name="facebook" value={form.facebook} onChange={set} placeholder="page name or full link" className={input} />
            </div>
          </div>
          <div>
            <label className={label}>WhatsApp number</label>
            <input name="whatsapp" type="tel" value={form.whatsapp} onChange={set} placeholder="919876543210 (with country code)" className={input} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-semibold text-gray-800">Customer Reviews <span className="block sm:inline text-xs font-normal text-gray-400">(only add real reviews. The home page section is hidden while this list is empty)</span></h2>
            {form.testimonials.length < 6 && (
              <button type="button" onClick={addReview} className="shrink-0 flex items-center gap-1 text-sm font-medium text-green-700 hover:bg-green-50 px-3 py-1.5 rounded-lg">
                <Plus className="w-4 h-4" /> Add
              </button>
            )}
          </div>
          {form.testimonials.length === 0 && <p className="text-sm text-gray-400">No reviews yet.</p>}
          {form.testimonials.map((t, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={t.name} onChange={e => setReview(i, 'name', e.target.value)} placeholder="Customer name" maxLength={40} className={input} />
                <input value={t.city} onChange={e => setReview(i, 'city', e.target.value)} placeholder="City (optional)" maxLength={40} className={input} />
              </div>
              <textarea value={t.text} onChange={e => setReview(i, 'text', e.target.value)} rows={2} maxLength={300} placeholder="What the customer said" className={input} />
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button type="button" key={n} onClick={() => setReview(i, 'stars', n)} aria-label={`${n} stars`}>
                      <Star className={`w-5 h-5 ${n <= t.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => removeReview(i)} className="flex items-center gap-1 text-sm text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg">
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={saving || !dirty}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

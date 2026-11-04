import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'

const SettingsContext = createContext()

export const DEFAULT_SETTINGS = {
  shop_name: 'GreenBasket',
  phone: '+91 98765 43210',
  email: 'hello@greenbasket.in',
  address: '123, Fresh Market Lane,\nBengaluru, Karnataka 560001',
  instagram: '',
  facebook: '',
  whatsapp: '',
  testimonials: [], // [{ name, city, text, stars }] - real reviews added by the admin
  tagline: 'Your trusted source for farm-fresh vegetables, herbs, and authentic spices delivered straight to your doorstep.',
}
const FIELDS = Object.keys(DEFAULT_SETTINGS)
const CACHE_KEY = 'shop-settings'

const readCache = () => {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
    return { ...DEFAULT_SETTINGS, ...cached }
  } catch { return DEFAULT_SETTINGS }
}

export function SettingsProvider({ children }) {
  // start from the last known values so the page doesn't flash defaults while loading
  const [settings, setSettings] = useState(readCache)

  const apply = useCallback((next) => {
    setSettings(next)
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (!supabaseConfigured) return
    supabase.from('shop_settings').select(FIELDS.join(',')).eq('id', 1).maybeSingle()
      .then(({ data }) => { if (data) apply({ ...DEFAULT_SETTINGS, ...data }) })
  }, [apply])

  useEffect(() => { document.title = settings.shop_name }, [settings.shop_name])

  const updateSettings = async (values) => {
    const { data, error } = await supabase
      .from('shop_settings')
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq('id', 1)
      .select()
    if (error) throw new Error(error.message + ' (did you run supabase-migration-settings.sql?)')
    if (supabaseConfigured && (!data || data.length === 0)) {
      throw new Error('Not saved. Run supabase-migration-settings.sql and make sure you are an admin.')
    }
    apply({ ...settings, ...values })
  }

  return (
    <SettingsContext.Provider value={{ settings, shopName: settings.shop_name, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}

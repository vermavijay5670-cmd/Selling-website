import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { products as localProducts } from '../data/products'

const ProductsContext = createContext()

const normalize = (p) => ({
  ...p,
  price: Number(p.price),
  stock: Number(p.stock ?? 0),
  description: p.description || '',
  badge: p.badge || null,
})

// Storefront products come from Supabase (what the admin manages).
// Falls back to the built-in list when Supabase isn't configured, errors, or the table is still empty.
export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(localProducts)
  const [loading, setLoading] = useState(supabaseConfigured)

  const refresh = useCallback(async () => {
    if (!supabaseConfigured) { setLoading(false); return }
    try {
      const { data, error } = await supabase.from('products').select('*').order('id')
      if (!error && data && data.length > 0) {
        setProducts(data.filter(p => p.active !== false).map(normalize))
      }
    } catch (err) {
      console.warn('Using local product data:', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return (
    <ProductsContext.Provider value={{ products, loading, refresh }}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider')
  return ctx
}

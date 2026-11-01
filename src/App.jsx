import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './context/CartContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartSidebar from './components/CartSidebar'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import AdminLogin from './pages/Admin/AdminLogin'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminProducts from './pages/Admin/AdminProducts'
import AdminOrders from './pages/Admin/AdminOrders'
import { useState } from 'react'

function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading...</div>
  return admin ? children : <Navigate to="/admin" replace />
}

function AppLayout() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const [globalSearch, setGlobalSearch] = useState('')

  return (
    <>
      {!isAdmin && <Navbar onSearch={setGlobalSearch} />}
      <CartSidebar />
      <main className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products globalSearch={globalSearch} />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '12px', fontSize: '14px' },
          }}
        />
        <AppLayout />
      </CartProvider>
    </AuthProvider>
  )
}

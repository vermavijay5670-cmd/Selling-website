import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ShoppingCart, Menu, X, Leaf, User, PackageSearch } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import SearchBar from './SearchBar'

export default function Navbar({ onSearch }) {
  const { cartCount, setIsCartOpen } = useCart()
  const { customer } = useCustomerAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-green-700 to-emerald-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
            <Leaf className="w-7 h-7 text-green-200" />
            <span className="tracking-tight">GreenBasket</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-white underline underline-offset-4' : 'text-green-100 hover:text-white'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop Search */}
          <div className="hidden md:block flex-1 max-w-xs mx-6">
            <SearchBar onSearch={onSearch} />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-full transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Track / Account */}
            <Link
              to="/track"
              className="hidden sm:flex items-center gap-1 text-sm text-green-100 hover:text-white transition-colors"
            >
              <PackageSearch className="w-4 h-4" />
              Track
            </Link>
            <Link
              to={customer ? '/my-orders' : '/login'}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-full transition-colors text-sm font-medium"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{customer ? 'My Orders' : 'Login'}</span>
            </Link>

            {/* Admin Link */}
            <Link
              to="/admin"
              className="hidden sm:block text-xs text-green-200 hover:text-white transition-colors"
            >
              Admin
            </Link>

            {/* Hamburger */}
            <button
              className="md:hidden text-white p-1"
              onClick={() => setMobileOpen(prev => !prev)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <SearchBar onSearch={(q) => { onSearch && onSearch(q); setMobileOpen(false) }} />
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `block text-sm font-medium px-2 py-1 rounded ${isActive ? 'text-white bg-white/20' : 'text-green-100 hover:text-white'}`
                }
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/track"
              className="block text-sm font-medium text-green-100 hover:text-white px-2 py-1"
              onClick={() => setMobileOpen(false)}
            >
              Track Order
            </Link>
            <Link
              to="/admin"
              className="block text-xs text-green-200 hover:text-white px-2 py-1"
              onClick={() => setMobileOpen(false)}
            >
              Admin Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

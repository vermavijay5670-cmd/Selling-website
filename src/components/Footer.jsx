import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { Leaf, Phone, Mail, MapPin, Share2, Users, MessageCircle } from 'lucide-react'

export default function Footer() {
  const { shopName, settings } = useSettings()
  return (
    <footer className="bg-green-900 text-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-6 h-6 text-green-400" />
              <span className="text-white font-bold text-lg">{shopName}</span>
            </div>
            <p className="text-sm text-green-300 leading-relaxed">
              {settings.tagline}
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-green-400 hover:text-white transition-colors"><Share2 className="w-5 h-5" /></a>
              <a href="#" className="text-green-400 hover:text-white transition-colors"><Users className="w-5 h-5" /></a>
              <a href="#" className="text-green-400 hover:text-white transition-colors"><MessageCircle className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Cart</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Admin</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              {settings.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-400 shrink-0" />
                  <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} className="hover:text-white transition-colors">{settings.phone}</a>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-400 shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors break-all">{settings.email}</a>
                </li>
              )}
              {settings.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <span className="whitespace-pre-line">{settings.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-green-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-green-400">
          <span>© {new Date().getFullYear()} {shopName}. All rights reserved.</span>
          <span>Powered by <span className="text-green-300 font-medium">{shopName}</span> 🌿</span>
        </div>
      </div>
    </footer>
  )
}

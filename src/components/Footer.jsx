import { Link } from 'react-router-dom'
import { Leaf, Phone, Mail, MapPin, Share2, Users, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-green-900 text-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-6 h-6 text-green-400" />
              <span className="text-white font-bold text-lg">GreenBasket</span>
            </div>
            <p className="text-sm text-green-300 leading-relaxed">
              Your trusted source for farm-fresh vegetables, herbs, and authentic spices delivered straight to your doorstep.
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
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-400 shrink-0" />
                <span>hello@greenbasket.in</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <span>123, Fresh Market Lane,<br />Bengaluru, Karnataka 560001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-green-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-green-400">
          <span>© {new Date().getFullYear()} GreenBasket. All rights reserved.</span>
          <span>Powered by <span className="text-green-300 font-medium">GreenBasket</span> 🌿</span>
        </div>
      </div>
    </footer>
  )
}

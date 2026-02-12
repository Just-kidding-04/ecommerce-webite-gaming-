import React from 'react'
import { Link } from 'react-router-dom'
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaDiscord, FaTwitch } from 'react-icons/fa'
import { SiVisa, SiMastercard, SiPaypal, SiGooglepay, SiApplepay } from 'react-icons/si'
import { HiShieldCheck } from 'react-icons/hi'

export default function Footer() {
  return (
    <footer className="bg-card text-text mt-8 border-t border-border">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                GamingStore
              </span>
            </Link>
            <p className="text-muted mb-4 max-w-sm">
              Your ultimate destination for gaming gear. From high-performance peripherals to immersive audio, we've got everything you need to level up your game.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-secondary hover:bg-blue-600 hover:text-white rounded-lg flex items-center justify-center transition-colors text-muted">
                <FaFacebookF className="text-lg" />
              </a>
              <a href="#" className="w-10 h-10 bg-secondary hover:bg-sky-500 hover:text-white rounded-lg flex items-center justify-center transition-colors text-muted">
                <FaTwitter className="text-lg" />
              </a>
              <a href="#" className="w-10 h-10 bg-secondary hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:text-white rounded-lg flex items-center justify-center transition-colors text-muted">
                <FaInstagram className="text-lg" />
              </a>
              <a href="#" className="w-10 h-10 bg-secondary hover:bg-red-600 hover:text-white rounded-lg flex items-center justify-center transition-colors text-muted">
                <FaYoutube className="text-lg" />
              </a>
              <a href="#" className="w-10 h-10 bg-secondary hover:bg-indigo-600 hover:text-white rounded-lg flex items-center justify-center transition-colors text-muted">
                <FaDiscord className="text-lg" />
              </a>
              <a href="#" className="w-10 h-10 bg-secondary hover:bg-purple-600 hover:text-white rounded-lg flex items-center justify-center transition-colors text-muted">
                <FaTwitch className="text-lg" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-text">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted hover:text-purple-400 transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-muted hover:text-purple-400 transition-colors">Shop</Link></li>
              <li><Link to="/products?category=4" className="text-muted hover:text-purple-400 transition-colors">Gaming</Link></li>
              <li><Link to="/products?category=6" className="text-muted hover:text-purple-400 transition-colors">Audio</Link></li>
              <li><Link to="/products?category=5" className="text-muted hover:text-purple-400 transition-colors">Monitors</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-text">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-muted hover:text-purple-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/help" className="text-muted hover:text-purple-400 transition-colors">Help Center</Link></li>
              <li><Link to="/orders" className="text-muted hover:text-purple-400 transition-colors">Track Order</Link></li>
              <li><Link to="/help" className="text-muted hover:text-purple-400 transition-colors">Returns</Link></li>
              <li><Link to="/help" className="text-muted hover:text-purple-400 transition-colors">Shipping Info</Link></li>
            </ul>
          </div>

          {/* My Account */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-text">My Account</h3>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-muted hover:text-purple-400 transition-colors">Login</Link></li>
              <li><Link to="/register" className="text-muted hover:text-purple-400 transition-colors">Register</Link></li>
              <li><Link to="/profile" className="text-muted hover:text-purple-400 transition-colors">My Profile</Link></li>
              <li><Link to="/wishlist" className="text-muted hover:text-purple-400 transition-colors">Wishlist</Link></li>
              <li><Link to="/cart" className="text-muted hover:text-purple-400 transition-colors">Cart</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment & Security */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Payment Methods */}
            <div className="flex items-center gap-6">
              <span className="text-sm text-muted">We Accept:</span>
              <div className="flex items-center gap-3">
                <SiVisa className="text-3xl text-muted hover:text-blue-500 transition-colors" />
                <SiMastercard className="text-3xl text-muted hover:text-orange-500 transition-colors" />
                <SiPaypal className="text-3xl text-muted hover:text-blue-400 transition-colors" />
                <SiGooglepay className="text-3xl text-muted hover:text-text transition-colors" />
                <SiApplepay className="text-3xl text-muted hover:text-text transition-colors" />
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-2 text-muted">
              <HiShieldCheck className="text-2xl text-green-500" />
              <span className="text-sm">100% Secure Payments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border bg-secondary">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-muted">
            <p>© {new Date().getFullYear()} GamingStore. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/help" className="hover:text-purple-400 transition-colors">Privacy Policy</Link>
              <Link to="/help" className="hover:text-purple-400 transition-colors">Terms of Service</Link>
              <Link to="/help" className="hover:text-purple-400 transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

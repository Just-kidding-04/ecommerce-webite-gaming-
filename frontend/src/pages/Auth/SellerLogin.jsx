import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser } from '../../redux/slices/authSlice'
import { sellerLogin } from '../../services/authService'
import { FaStore, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import { toast } from '../../utils/toast'

export default function SellerLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const user = await sellerLogin({ email, password })
      localStorage.setItem('seller_mode', 'true')
      dispatch(setUser(user))
      toast.success('Welcome back, Seller!')
      navigate('/seller/dashboard')
    } catch (error) {
      toast.error(error.message || 'Invalid seller credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-4">
            <FaStore className="text-4xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Seller Portal</h1>
          <p className="text-gray-400 mt-2">Sign in to manage your store</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                  placeholder="seller@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-xl pl-12 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link to="/forgot" className="text-emerald-400 hover:text-emerald-300 text-sm">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <FaStore />
                  Sign In as Seller
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-800/50 text-gray-400">New to selling?</span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/seller/register"
            className="block w-full text-center border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 font-semibold py-3 rounded-xl transition"
          >
            Create Seller Account
          </Link>
        </div>

        {/* Customer Login Link */}
        <div className="text-center text-gray-400 mt-6 space-y-2">
          <span>Are you a customer?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
              Sign in here
            </Link>
          </span>
          <div>
            <Link to="/admin-login" className="text-gray-400 hover:text-indigo-400 text-sm inline-flex items-center gap-2 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Admin Login
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-800/30 rounded-xl p-4">
            <div className="text-2xl mb-2">📦</div>
            <p className="text-gray-400 text-xs">Easy Product Management</p>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-4">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-gray-400 text-xs">Sales Analytics</p>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-4">
            <div className="text-2xl mb-2">💰</div>
            <p className="text-gray-400 text-xs">Quick Payouts</p>
          </div>
        </div>
      </div>
    </div>
  )
}

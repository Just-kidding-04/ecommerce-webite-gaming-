import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from '../../utils/toast'
import { FaGamepad, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaArrowLeft } from 'react-icons/fa'
import axiosInstance from '../../services/axiosInstance'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Enter Email, 2: Verify Phone, 3: Reset Password
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [userData, setUserData] = useState(null)
  const [maskedPhone, setMaskedPhone] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Step 1: Verify Email
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email) {
      toast.error('Please enter your email')
      return
    }
    
    setLoading(true)
    try {
      const response = await axiosInstance.post('/api/auth/verify-email', { email: formData.email })
      if (response.data.success) {
        setUserData(response.data.user)
        setMaskedPhone(response.data.maskedPhone)
        setStep(2)
        toast.success('Email verified! Please verify your phone number')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Email not found')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify Phone
  const handlePhoneSubmit = async (e) => {
    e.preventDefault()
    if (!formData.phone) {
      toast.error('Please enter your phone number')
      return
    }
    
    setLoading(true)
    try {
      const response = await axiosInstance.post('/api/auth/verify-phone', { 
        email: formData.email,
        phone: formData.phone 
      })
      if (response.data.success) {
        setStep(3)
        toast.success('Phone verified! Create your new password')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Phone number does not match')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Reset Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }
    
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    setLoading(true)
    try {
      const response = await axiosInstance.post('/api/auth/reset-password', {
        email: formData.email,
        phone: formData.phone,
        newPassword: formData.newPassword
      })
      if (response.data.success) {
        toast.success('Password reset successfully!')
        setTimeout(() => navigate('/login'), 1500)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <FaGamepad className="text-2xl text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              GamingStore
            </span>
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
              step >= 1 ? 'bg-purple-500 text-white' : 'bg-slate-700 text-gray-400'
            }`}>
              {step > 1 ? <FaCheckCircle /> : '1'}
            </div>
            <div className={`w-16 h-1 rounded transition-all ${step > 1 ? 'bg-purple-500' : 'bg-slate-700'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
              step >= 2 ? 'bg-purple-500 text-white' : 'bg-slate-700 text-gray-400'
            }`}>
              {step > 2 ? <FaCheckCircle /> : '2'}
            </div>
            <div className={`w-16 h-1 rounded transition-all ${step > 2 ? 'bg-purple-500' : 'bg-slate-700'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
              step >= 3 ? 'bg-purple-500 text-white' : 'bg-slate-700 text-gray-400'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
          {/* Step 1: Email Verification */}
          {step === 1 && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaEnvelope className="text-3xl text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
                <p className="text-gray-400">Enter your email to begin the recovery process</p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Verifying...
                    </span>
                  ) : 'Continue'}
                </button>
              </form>
            </>
          )}

          {/* Step 2: Phone Verification */}
          {step === 2 && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaPhone className="text-3xl text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Verify Your Phone</h2>
                <p className="text-gray-400">Enter your phone number to verify your identity</p>
                {maskedPhone && (
                  <p className="text-purple-400 text-sm mt-2">Hint: {maskedPhone}</p>
                )}
              </div>

              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <div className="relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <FaArrowLeft /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaLock className="text-3xl text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Create New Password</h2>
                <p className="text-gray-400">Your identity has been verified. Create a new password.</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-2">Password must:</p>
                  <ul className="text-xs space-y-1">
                    <li className={`flex items-center gap-2 ${formData.newPassword.length >= 6 ? 'text-green-400' : 'text-gray-500'}`}>
                      <FaCheckCircle className="text-xs" /> Be at least 6 characters
                    </li>
                    <li className={`flex items-center gap-2 ${formData.newPassword === formData.confirmPassword && formData.confirmPassword ? 'text-green-400' : 'text-gray-500'}`}>
                      <FaCheckCircle className="text-xs" /> Passwords match
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Resetting...
                    </span>
                  ) : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link to="/login" className="text-purple-400 hover:text-purple-300 transition-colors text-sm">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

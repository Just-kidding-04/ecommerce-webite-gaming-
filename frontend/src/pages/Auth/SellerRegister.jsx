import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaStore, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone, FaBuilding, FaMapMarkerAlt, FaCheck } from 'react-icons/fa'
import { toast } from '../../utils/toast'
import axiosInstance from '../../services/axiosInstance'

export default function SellerRegister() {
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    businessName: '',
    businessType: '',
    gstNumber: '',
    panNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      toast.error('Please fill in all required fields')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return false
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return false
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.businessName || !formData.businessType) {
      toast.error('Please fill in business details')
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions')
      return
    }

    setLoading(true)
    try {
      const res = await axiosInstance.post('/api/auth/seller/register', {
        ...formData,
        isSeller: true
      })
      
      toast.success('Seller account created successfully!')
      navigate('/seller/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const StepIndicator = ({ number, title, active, completed }) => (
    <div className={`flex items-center gap-2 ${active ? 'text-emerald-400' : completed ? 'text-emerald-500' : 'text-gray-500'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        active ? 'bg-emerald-500 text-white' : 
        completed ? 'bg-emerald-500/20 text-emerald-400' : 
        'bg-gray-700 text-gray-400'
      }`}>
        {completed ? <FaCheck /> : number}
      </div>
      <span className="hidden sm:inline text-sm font-medium">{title}</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-4">
            <FaStore className="text-4xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Become a Seller</h1>
          <p className="text-gray-400 mt-2">Start selling on Gaming Store today</p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8 px-4">
          <StepIndicator number={1} title="Personal Info" active={step === 1} completed={step > 1} />
          <div className={`flex-1 h-0.5 mx-4 ${step > 1 ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
          <StepIndicator number={2} title="Business Info" active={step === 2} completed={step > 2} />
          <div className={`flex-1 h-0.5 mx-4 ${step > 2 ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
          <StepIndicator number={3} title="Address" active={step === 3} completed={false} />
        </div>

        {/* Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Full Name *</label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email Address *</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                      placeholder="seller@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Phone Number *</label>
                  <div className="relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Password *</label>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
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
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Confirm Password *</label>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Business Info */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-white mb-6">Business Information</h2>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Business/Store Name *</label>
                  <div className="relative">
                    <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                      placeholder="Your Store Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Business Type *</label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                  >
                    <option value="">Select business type</option>
                    <option value="individual">Individual / Sole Proprietor</option>
                    <option value="partnership">Partnership</option>
                    <option value="pvt_ltd">Private Limited Company</option>
                    <option value="llp">LLP</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">GST Number (Optional)</label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition uppercase"
                      placeholder="22AAAAA0000A1Z5"
                      maxLength={15}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">PAN Number (Optional)</label>
                    <input
                      type="text"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleChange}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition uppercase"
                      placeholder="ABCDE1234F"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <p className="text-emerald-400 text-sm">
                    💡 GST & PAN details are optional during registration. You can add them later from your seller dashboard.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Address */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-white mb-6">Business Address</h2>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Address Line 1 *</label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                      placeholder="Street address, building name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Address Line 2</label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                    placeholder="Apartment, suite, floor (optional)"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                      placeholder="Maharashtra"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-gray-400 text-sm mb-2">PIN Code *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                      placeholder="400001"
                      maxLength={6}
                    />
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer mt-6">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500 mt-0.5"
                  />
                  <span className="text-gray-400 text-sm">
                    I agree to the{' '}
                    <Link to="/terms" className="text-emerald-400 hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/seller-policy" className="text-emerald-400 hover:underline">Seller Policy</Link>
                  </span>
                </label>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition"
                >
                  Back
                </button>
              ) : (
                <div></div>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl transition"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <FaStore />
                      Create Seller Account
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Login Link */}
        <p className="text-center text-gray-400 mt-6">
          Already have a seller account?{' '}
          <Link to="/seller/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

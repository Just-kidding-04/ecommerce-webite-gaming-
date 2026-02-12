import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { setUser } from '../../redux/slices/authSlice'
import { 
  FaStore, FaUser, FaEnvelope, FaPhone, FaBuilding, FaIdCard, 
  FaMapMarkerAlt, FaSave, FaArrowLeft, FaLock, FaCheck, FaTimes,
  FaFileInvoice, FaShieldAlt, FaCamera, FaEdit
} from 'react-icons/fa'
import { toast } from '../../utils/toast'
import axiosInstance from '../../services/axiosInstance'

export default function SellerProfile() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(s => s.auth.user)
  
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: ''
  })
  
  const [businessData, setBusinessData] = useState({
    businessName: '',
    businessType: '',
    gstNumber: '',
    panNumber: '',
    sellerAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    }
  })
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    avgRating: 0
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get('/api/seller/profile')
      const data = res.data
      
      setProfileData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        avatar: data.avatar || ''
      })
      
      setBusinessData({
        businessName: data.businessName || '',
        businessType: data.businessType || '',
        gstNumber: data.gstNumber || '',
        panNumber: data.panNumber || '',
        sellerAddress: data.sellerAddress || {
          street: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India'
        }
      })
      
      setStats({
        totalProducts: data.totalProducts || 0,
        totalOrders: data.totalOrders || 0,
        totalRevenue: data.totalRevenue || 0,
        avgRating: data.avgRating || 0
      })
    } catch (error) {
      console.error('Failed to load profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  const handleBusinessChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('address_')) {
      const field = name.replace('address_', '')
      setBusinessData(prev => ({
        ...prev,
        sellerAddress: { ...prev.sellerAddress, [field]: value }
      }))
    } else {
      setBusinessData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({ ...prev, [name]: value }))
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      await axiosInstance.put('/api/seller/profile', profileData)
      dispatch(setUser({ ...user, name: profileData.name, phone: profileData.phone }))
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const saveBusiness = async () => {
    setSaving(true)
    try {
      await axiosInstance.put('/api/seller/business', businessData)
      dispatch(setUser({ ...user, businessName: businessData.businessName }))
      toast.success('Business details updated!')
    } catch (error) {
      toast.error('Failed to update business details')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords don't match!")
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    
    setSaving(true)
    try {
      await axiosInstance.put('/api/users/me/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      toast.success('Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Personal Info', icon: FaUser },
    { id: 'business', label: 'Business Details', icon: FaBuilding },
    { id: 'security', label: 'Security', icon: FaLock }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700 z-40">
        <div className="p-6 border-b border-slate-700">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <FaStore className="text-xl text-white" />
            </div>
            <div>
              <span className="font-bold text-white">Gaming</span>
              <span className="text-emerald-400">Store</span>
              <p className="text-xs text-gray-500">Seller Portal</p>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            to="/seller/dashboard"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-slate-700/50 transition-all"
          >
            <FaArrowLeft className="text-lg" />
            Back to Dashboard
          </Link>
          
          <div className="border-t border-slate-700 my-4"></div>
          
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-white border border-emerald-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <tab.icon className="text-lg" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="bg-slate-700/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Products</span>
              <span className="text-white font-semibold">{stats.totalProducts}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Orders</span>
              <span className="text-white font-semibold">{stats.totalOrders}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Revenue</span>
              <span className="text-emerald-400 font-semibold">₹{stats.totalRevenue.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              {activeTab === 'profile' && 'Personal Information'}
              {activeTab === 'business' && 'Business Details'}
              {activeTab === 'security' && 'Security Settings'}
            </h1>
            <p className="text-gray-400 mt-1">Manage your seller account settings</p>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-gray-700">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-4xl font-bold text-white">
                      {profileData.avatar ? (
                        <img src={profileData.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        profileData.name.charAt(0) || 'S'
                      )}
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white hover:bg-emerald-400 transition">
                      <FaCamera className="text-sm" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{profileData.name || 'Seller'}</h3>
                    <p className="text-gray-400">{profileData.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full flex items-center gap-1">
                        <FaStore /> Seller Account
                      </span>
                      {user?.sellerVerified && (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full flex items-center gap-1">
                          <FaShieldAlt /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <FaUser className="inline mr-2" /> Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <FaEnvelope className="inline mr-2" /> Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      disabled
                      className="w-full bg-slate-700/30 border border-slate-600 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <FaPhone className="inline mr-2" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50"
                  >
                    {saving ? (
                      <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                    ) : (
                      <FaSave />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'business' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <FaBuilding className="inline mr-2" /> Business Name
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={businessData.businessName}
                      onChange={handleBusinessChange}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                      placeholder="Your business name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <FaStore className="inline mr-2" /> Business Type
                    </label>
                    <select
                      name="businessType"
                      value={businessData.businessType}
                      onChange={handleBusinessChange}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                    >
                      <option value="">Select business type</option>
                      <option value="individual">Individual / Sole Proprietor</option>
                      <option value="partnership">Partnership</option>
                      <option value="llp">LLP</option>
                      <option value="pvtltd">Private Limited</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <FaFileInvoice className="inline mr-2" /> GST Number
                    </label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={businessData.gstNumber}
                      onChange={handleBusinessChange}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition uppercase"
                      placeholder="22AAAAA0000A1Z5"
                      maxLength={15}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <FaIdCard className="inline mr-2" /> PAN Number
                    </label>
                    <input
                      type="text"
                      name="panNumber"
                      value={businessData.panNumber}
                      onChange={handleBusinessChange}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition uppercase"
                      placeholder="ABCDE1234F"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-emerald-400" /> Business Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Street Address</label>
                      <input
                        type="text"
                        name="address_street"
                        value={businessData.sellerAddress.street}
                        onChange={handleBusinessChange}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                        placeholder="Street address, building, floor"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">City</label>
                      <input
                        type="text"
                        name="address_city"
                        value={businessData.sellerAddress.city}
                        onChange={handleBusinessChange}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                        placeholder="City"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">State</label>
                      <input
                        type="text"
                        name="address_state"
                        value={businessData.sellerAddress.state}
                        onChange={handleBusinessChange}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                        placeholder="State"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">PIN Code</label>
                      <input
                        type="text"
                        name="address_pincode"
                        value={businessData.sellerAddress.pincode}
                        onChange={handleBusinessChange}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                        placeholder="PIN Code"
                        maxLength={6}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Country</label>
                      <input
                        type="text"
                        name="address_country"
                        value={businessData.sellerAddress.country}
                        onChange={handleBusinessChange}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={saveBusiness}
                    disabled={saving}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50"
                  >
                    {saving ? (
                      <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                    ) : (
                      <FaSave />
                    )}
                    Save Business Details
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-slate-700/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FaLock className="text-emerald-400" /> Change Password
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                        placeholder="Enter current password"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                        placeholder="Enter new password"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                        placeholder="Confirm new password"
                      />
                    </div>
                    
                    <button
                      onClick={changePassword}
                      disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword}
                      className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50"
                    >
                      {saving ? (
                        <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                      ) : (
                        <FaLock />
                      )}
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FaShieldAlt className="text-emerald-400" /> Account Security
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                      <div>
                        <p className="text-white font-medium">Two-Factor Authentication</p>
                        <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full">Coming Soon</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                      <div>
                        <p className="text-white font-medium">Login Notifications</p>
                        <p className="text-gray-400 text-sm">Get notified of new login attempts</p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full">Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

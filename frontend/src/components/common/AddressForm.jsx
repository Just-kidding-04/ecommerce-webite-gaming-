import React, { useState, useEffect } from 'react'
import axios from '../../services/axiosInstance'
import { toast } from '../../utils/toast'
import { FaTimes, FaSave } from 'react-icons/fa'

export default function AddressForm({ onSave, onCancel, editAddress = null }) {
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
    isDefault: false
  })

  useEffect(() => {
    if (editAddress) {
      setAddress({
        fullName: editAddress.fullName || editAddress.name || '',
        phone: editAddress.phone || '',
        line1: editAddress.line1 || editAddress.street || '',
        line2: editAddress.line2 || editAddress.label || '',
        city: editAddress.city || '',
        state: editAddress.state || '',
        zip: editAddress.zip || editAddress.zipCode || '',
        country: editAddress.country || 'India',
        isDefault: editAddress.isDefault || false
      })
    }
  }, [editAddress])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setAddress(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!address.fullName || !address.phone || !address.line1 || !address.city || !address.state || !address.zip) {
      toast.error('Please fill all required fields')
      return
    }
    
    setLoading(true)
    try {
      let savedAddress
      if (editAddress) {
        const res = await axios.put(`/api/addresses/${editAddress.id}`, address)
        savedAddress = res.data
        toast.success('Address updated!')
      } else {
        const res = await axios.post('/api/addresses', address)
        savedAddress = res.data
        toast.success('Address added!')
      }
      onSave(savedAddress)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save address')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          {editAddress ? 'Edit Address' : 'Add New Address'}
        </h2>
        {onCancel && (
          <button onClick={onCancel} className="text-gray-400 hover:text-white p-2">
            <FaTimes />
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Full Name *</label>
            <input 
              name="fullName" 
              value={address.fullName} 
              onChange={handleChange} 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition" 
              placeholder="John Doe" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Phone Number *</label>
            <input 
              name="phone" 
              value={address.phone} 
              onChange={handleChange} 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition" 
              placeholder="+91 9876543210" 
              required 
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Address Line 1 *</label>
          <input 
            name="line1" 
            value={address.line1} 
            onChange={handleChange} 
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition" 
            placeholder="Street address, Building, House No." 
            required 
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Address Line 2 (Optional)</label>
          <input 
            name="line2" 
            value={address.line2} 
            onChange={handleChange} 
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition" 
            placeholder="Apartment, Suite, Landmark" 
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">City *</label>
            <input 
              name="city" 
              value={address.city} 
              onChange={handleChange} 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition" 
              placeholder="City" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">State *</label>
            <input 
              name="state" 
              value={address.state} 
              onChange={handleChange} 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition" 
              placeholder="State" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">ZIP Code *</label>
            <input 
              name="zip" 
              value={address.zip} 
              onChange={handleChange} 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition" 
              placeholder="600001" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Country *</label>
            <input 
              name="country" 
              value={address.country} 
              onChange={handleChange} 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition" 
              placeholder="India" 
              required 
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="checkbox"
            name="isDefault" 
            checked={address.isDefault} 
            onChange={handleChange}
            className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-purple-500 focus:ring-purple-500"
          />
          <label className="text-gray-300 text-sm">Set as default address</label>
        </div>
        
        <div className="flex gap-3 pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-70 transition"
          >
            {loading ? (
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            ) : (
              <FaSave />
            )}
            {loading ? 'Saving...' : 'Save Address'}
          </button>
          {onCancel && (
            <button 
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

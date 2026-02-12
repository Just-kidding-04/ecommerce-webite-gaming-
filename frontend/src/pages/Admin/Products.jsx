import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'
import { useSelector, useDispatch } from 'react-redux'
import { clearUser } from '../../redux/slices/authSlice'
import { logout } from '../../services/authService'
import { useNavigate } from 'react-router-dom'

export default function Products(){
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  
  const [form, setForm] = useState({
    name: '',
    short: '',
    price: '',
    originalPrice: '',
    description: '',
    image: '',
    brand: '',
    stock: '',
    categoryId: '',
    features: [],
    specs: {}
  })

  const user = useSelector(s => s.auth.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axiosInstance.get('/api/products'),
        axiosInstance.get('/api/products/categories')
      ])
      setItems(productsRes.data)
      setCategories(categoriesRes.data)
    } catch (e) {
      console.error('Failed to load data:', e)
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    logout()
    dispatch(clearUser())
    navigate('/login')
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
    
    // Upload file
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const res = await axiosInstance.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setForm({ ...form, image: res.data.url || res.data.path })
    } catch (e) {
      // If upload fails, use a placeholder URL or the file preview
      console.error('Upload failed:', e)
      // Use the preview as base64 or a default image
      setForm({ ...form, image: imagePreview || 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600' })
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
        stock: parseInt(form.stock) || 10,
        categoryId: form.categoryId || null
      }
      
      if (editing) {
        await axiosInstance.put('/api/products/' + editing.id, payload)
      } else {
        await axiosInstance.post('/api/products', payload)
      }
      
      loadData()
      closeModal()
    } catch (e) {
      console.error('Save failed:', e)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await axiosInstance.delete('/api/products/' + id)
      loadData()
    } catch (e) {
      console.error('Delete failed:', e)
    }
  }

  function openModal(product = null) {
    if (product) {
      setEditing(product)
      setForm({
        name: product.name || '',
        short: product.short || '',
        price: product.price?.toString() || '',
        originalPrice: product.originalPrice?.toString() || '',
        description: product.description || '',
        image: product.image || '',
        brand: product.brand || '',
        stock: product.stock?.toString() || '',
        categoryId: product.categoryId?.toString() || '',
        features: product.features || [],
        specs: product.specs || {}
      })
      setImagePreview(product.image || '')
    } else {
      setEditing(null)
      setForm({
        name: '', short: '', price: '', originalPrice: '', description: '',
        image: '', brand: '', stock: '', categoryId: '', features: [], specs: {}
      })
      setImagePreview('')
    }
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditing(null)
    setImagePreview('')
  }

  // Filter products
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || item.categoryId?.toString() === filterCategory
    return matchesSearch && matchesCategory
  })

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/admin/products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { path: '/admin/orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { path: '/admin/users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { path: '/admin/reports', label: 'Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700 z-40">
        <div className="p-6 border-b border-slate-700">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 6H3a1 1 0 00-1 1v10a1 1 0 001 1h18a1 1 0 001-1V7a1 1 0 00-1-1zM5 16v-2h2v2H5zm0-4v-2h2v2H5zm4 4v-2h2v2H9zm0-4v-2h2v2H9zm4 4v-2h2v2h-2zm0-4v-2h2v2h-2zm6 4h-2v-2h2v2zm0-4h-2v-2h2v2z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-white">Gaming</span>
              <span className="text-purple-400">Store</span>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </Link>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Products</h1>
            <p className="text-gray-400 mt-1">Manage your product inventory</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/25"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 rounded-2xl p-4 mb-6 border border-slate-700 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-slate-900/50 border border-slate-600 text-white pl-10 pr-4 py-2 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="bg-slate-900/50 border border-slate-600 text-white px-4 py-2 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <div className="text-gray-400 flex items-center">
            {filteredItems.length} products
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden group hover:border-purple-500/50 transition-all">
                <div className="aspect-square bg-slate-900 relative overflow-hidden">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400'}
                    alt={item.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openModal(item)}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-purple-400 text-xs font-medium mb-1">{item.brand || 'No Brand'}</p>
                  <h3 className="text-white font-semibold line-clamp-2 mb-2">{item.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-white">₹{item.price}</span>
                    <span className="text-sm text-gray-400">Stock: {item.stock}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editing ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Product Image</label>
                <div className="flex gap-4">
                  <div className="w-32 h-32 bg-slate-900 rounded-xl border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden">
                    {imagePreview || form.image ? (
                      <img src={imagePreview || form.image} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <label className="block w-full cursor-pointer">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <div className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </div>
                    </label>
                    <input
                      type="url"
                      value={form.image}
                      onChange={e => { setForm({...form, image: e.target.value}); setImagePreview(e.target.value) }}
                      placeholder="Or paste image URL..."
                      className="w-full bg-slate-900/50 border border-slate-600 text-white px-4 py-2 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product Name *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    required
                    className="w-full bg-slate-900/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Brand</label>
                  <input
                    value={form.brand}
                    onChange={e => setForm({...form, brand: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Brand name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={form.categoryId}
                    onChange={e => setForm({...form, categoryId: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Short Description</label>
                <input
                  value={form.short}
                  onChange={e => setForm({...form, short: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Brief tagline or key specs"
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={form.price}
                      onChange={e => setForm({...form, price: e.target.value})}
                      required
                      step="0.01"
                      className="w-full bg-slate-900/50 border border-slate-600 text-white pl-8 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Original Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={form.originalPrice}
                      onChange={e => setForm({...form, originalPrice: e.target.value})}
                      step="0.01"
                      className="w-full bg-slate-900/50 border border-slate-600 text-white pl-8 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={e => setForm({...form, stock: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="10"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  rows={4}
                  className="w-full bg-slate-900/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  placeholder="Detailed product description..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold transition-all"
                >
                  {editing ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { FaArrowLeft, FaCloudUploadAlt, FaPlus, FaTimes, FaSave, FaStore, FaBox, FaTrash } from 'react-icons/fa'
import { toast } from '../../utils/toast'
import axiosInstance from '../../services/axiosInstance'

export default function EditProduct() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [imagePreview, setImagePreview] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    price: '',
    originalPrice: '',
    categoryId: '',
    stock: '',
    image: '',
    features: [''],
    specifications: {}
  })
  const [specKey, setSpecKey] = useState('')
  const [specValue, setSpecValue] = useState('')

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [productRes, categoriesRes] = await Promise.all([
        axiosInstance.get(`/api/products/${id}`),
        axiosInstance.get('/api/products/categories')
      ])
      
      const product = productRes.data
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        description: product.description || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        categoryId: product.categoryId || '',
        stock: product.stock || 0,
        image: product.image || '',
        features: product.features?.length ? product.features : [''],
        specifications: product.specs || {}
      })
      setImagePreview(product.image)
      setCategories(categoriesRes.data || [])
    } catch (error) {
      toast.error('Failed to load product')
      navigate('/seller/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        setFormData(prev => ({ ...prev, image: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData(prev => ({ ...prev, features: newFeatures }))
  }

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }))
  }

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, features: newFeatures.length ? newFeatures : [''] }))
  }

  const addSpecification = () => {
    if (specKey && specValue) {
      setFormData(prev => ({
        ...prev,
        specifications: { ...prev.specifications, [specKey]: specValue }
      }))
      setSpecKey('')
      setSpecValue('')
    }
  }

  const removeSpecification = (key) => {
    const newSpecs = { ...formData.specifications }
    delete newSpecs[key]
    setFormData(prev => ({ ...prev, specifications: newSpecs }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        categoryId: parseInt(formData.categoryId),
        features: formData.features.filter(f => f.trim()),
        specs: formData.specifications
      }

      await axiosInstance.put(`/api/products/${id}`, productData)
      toast.success('Product updated successfully!')
      navigate('/seller/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return
    
    try {
      await axiosInstance.delete(`/api/products/${id}`)
      toast.success('Product deleted')
      navigate('/seller/dashboard')
    } catch (error) {
      toast.error('Failed to delete product')
        const [showDeleteModal, setShowDeleteModal] = useState(false);
    }
  }

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
          
          <div className="px-4 py-3 text-gray-400">
            <p className="text-xs text-gray-500 mb-2">EDITING</p>
            <div className="flex items-center gap-3">
              {imagePreview && (
                <img src={imagePreview} alt="" className="w-10 h-10 rounded-lg object-cover" />
              )}
              <p className="text-white text-sm font-medium truncate">{formData.name || 'Product'}</p>
            </div>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition"
          >
            <FaTrash />
            Delete Product
          </button>
        </div>
      </aside>

      <main className="ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Edit Product</h1>
            <p className="text-gray-400 text-sm">Update your product details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FaBox className="text-emerald-400" /> Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-gray-400 text-sm mb-2">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                    placeholder="e.g., Gaming Laptop RTX 4090"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                    placeholder="e.g., ASUS, MSI, Dell"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Category *</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-400 text-sm mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition resize-none"
                    placeholder="Describe your product..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Pricing & Inventory</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Original Price (₹)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Product Image</h2>
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <label className="block text-gray-400 text-sm mb-2">Image URL</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={(e) => {
                      handleInputChange(e)
                      setImagePreview(e.target.value)
                    }}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-gray-500 text-xs mt-2">Or upload an image:</p>
                  <label className="mt-2 flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 rounded-xl px-4 py-3 cursor-pointer transition">
                    <FaCloudUploadAlt className="text-emerald-400" />
                    <span className="text-gray-400 text-sm">Choose file</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
                {imagePreview && (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-xl border border-slate-600"
                      onError={() => setImagePreview(null)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null)
                        setFormData(prev => ({ ...prev, image: '' }))
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Product Features</h2>
              <div className="space-y-3">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                      placeholder="e.g., RGB Backlit Keyboard"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl transition"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition"
                >
                  <FaPlus /> Add Feature
                </button>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Specifications</h2>
              
              {Object.entries(formData.specifications).length > 0 && (
                <div className="space-y-2 mb-4">
                  {Object.entries(formData.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between bg-slate-700/30 rounded-lg px-4 py-2">
                      <span className="text-gray-400">{key}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-white">{value}</span>
                        <button
                          type="button"
                          onClick={() => removeSpecification(key)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={specKey}
                  onChange={(e) => setSpecKey(e.target.value)}
                  placeholder="Spec name (e.g., RAM)"
                  className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                />
                <input
                  type="text"
                  value={specValue}
                  onChange={(e) => setSpecValue(e.target.value)}
                  placeholder="Value (e.g., 16GB DDR5)"
                  className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={addSpecification}
                  className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition"
                >
                  <FaPlus />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4">
              <Link
                to="/seller/dashboard"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold transition disabled:opacity-50"
              >
                <FaSave />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
          <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Delete Product?</h2>
              <p className="text-gray-400 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
              <div className="flex justify-center gap-4">
                <button className="bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-3 rounded-xl transition" onClick={confirmDelete}>Delete</button>
                <button className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold px-6 py-3 rounded-xl transition" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              </div>
            </div>
          </Modal>
    </div>
  )
}

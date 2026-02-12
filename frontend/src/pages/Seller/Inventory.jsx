import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  FaArrowLeft, FaWarehouse, FaSearch, FaEdit, FaSave, FaTimes, 
  FaExclamationTriangle, FaCheckCircle, FaSort
} from 'react-icons/fa'
import { toast } from '../../utils/toast'
import axiosInstance from '../../services/axiosInstance'

export default function SellerInventory() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editStock, setEditStock] = useState('')
  const [sortBy, setSortBy] = useState('stock-asc')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get('/api/products?limit=200')
      const productsData = Array.isArray(res.data) ? res.data : res.data.products || []
      setProducts(productsData)
    } catch (error) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStock = async (productId) => {
    if (!editStock || editStock < 0) {
      toast.error('Please enter a valid stock quantity')
      return
    }
    try {
      await axiosInstance.put(`/api/products/${productId}`, { stock: parseInt(editStock) })
      setProducts(products.map(p => 
        p.id === productId ? { ...p, stock: parseInt(editStock) } : p
      ))
      setEditingId(null)
      setEditStock('')
      toast.success('Stock updated successfully')
    } catch (error) {
      toast.error('Failed to update stock')
    }
  }

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      if (filter === 'low') return matchesSearch && p.stock < 10
      if (filter === 'out') return matchesSearch && p.stock === 0
      if (filter === 'ok') return matchesSearch && p.stock >= 10
      return matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'stock-asc': return a.stock - b.stock
        case 'stock-desc': return b.stock - a.stock
        case 'name': return a.name.localeCompare(b.name)
        case 'price': return b.price - a.price
        default: return 0
      }
    })

  const stats = {
    total: products.length,
    low: products.filter(p => p.stock > 0 && p.stock < 10).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    healthy: products.filter(p => p.stock >= 10).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 transition"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FaWarehouse className="text-purple-500" />
              Inventory Management
            </h1>
            <p className="text-gray-400 text-sm">Manage product stock levels</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Total Products</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <p className="text-green-400 text-sm">Healthy Stock</p>
            <p className="text-2xl font-bold text-green-400">{stats.healthy}</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-yellow-400 text-sm">Low Stock</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.low}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 text-sm">Out of Stock</p>
            <p className="text-2xl font-bold text-red-400">{stats.outOfStock}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'low', label: 'Low Stock' },
                { id: 'out', label: 'Out of Stock' },
                { id: 'ok', label: 'Healthy' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    filter === f.id 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="stock-asc">Stock: Low to High</option>
              <option value="stock-desc">Stock: High to Low</option>
              <option value="name">Name: A-Z</option>
              <option value="price">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 bg-gray-900/50">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className="border-t border-gray-700/50 hover:bg-gray-700/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-700"
                        onError={(e) => e.target.src = 'https://placehold.co/48x48/1f2937/9ca3af?text=Img'}
                      />
                      <div>
                        <p className="text-white font-medium line-clamp-1">{product.name}</p>
                        <p className="text-gray-500 text-xs">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-purple-400 font-semibold">
                    ₹{product.price?.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === product.id ? (
                      <input
                        type="number"
                        value={editStock}
                        onChange={(e) => setEditStock(e.target.value)}
                        className="w-24 bg-gray-700 border border-purple-500 rounded-lg px-3 py-1 text-white focus:outline-none"
                        min="0"
                        autoFocus
                      />
                    ) : (
                      <span className={`font-bold ${
                        product.stock === 0 ? 'text-red-400' :
                        product.stock < 10 ? 'text-yellow-400' :
                        'text-white'
                      }`}>
                        {product.stock} units
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {product.stock === 0 ? (
                      <span className="flex items-center gap-1 text-red-400 text-sm">
                        <FaExclamationTriangle /> Out of Stock
                      </span>
                    ) : product.stock < 10 ? (
                      <span className="flex items-center gap-1 text-yellow-400 text-sm">
                        <FaExclamationTriangle /> Low Stock
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-400 text-sm">
                        <FaCheckCircle /> In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === product.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateStock(product.id)}
                          className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition"
                        >
                          <FaSave />
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null)
                            setEditStock('')
                          }}
                          className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(product.id)
                          setEditStock(product.stock.toString())
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg transition"
                      >
                        <FaEdit /> Update
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <FaWarehouse className="text-5xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>
    </div>
  )
}

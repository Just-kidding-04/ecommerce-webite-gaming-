import React from 'react'
import { Link } from 'react-router-dom'
import { useCompare } from '../../context/CompareContext'
import { FaTimes, FaBalanceScale, FaStar, FaShoppingCart, FaArrowLeft, FaCheck, FaMinus, FaPlus, FaExchangeAlt, FaTrash } from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { addItem } from '../../redux/slices/cartSlice'
import { toast } from '../../utils/toast'

export default function Compare() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare()
  const dispatch = useDispatch()

  const addToCart = (product) => {
    dispatch(addItem(product));
    toast.success('Added to cart!');
  }

  // Get all unique spec keys from all compare items
  const allSpecs = [...new Set(compareItems.flatMap(item => {
    if (item.specsData) return Object.keys(item.specsData)
    if (Array.isArray(item.specs)) return item.specs.map(s => s.key)
    return item.specs ? Object.keys(item.specs) : []
  }))]

  const getSpecsObj = (item) => {
    if (item.specsData) return item.specsData
    if (Array.isArray(item.specs)) {
      return item.specs.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {})
    }
    return item.specs || {}
  }

  return (
    <div className="animate-fade-in">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <FaExchangeAlt className="text-xl" />
            </div>
            Compare Products
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            {compareItems.length} {compareItems.length === 1 ? 'product' : 'products'} selected
          </p>
        </div>
        <div className="flex items-center gap-3">
          {compareItems.length > 0 && (
            <button
              onClick={clearCompare}
              className="inline-flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-5 py-3 rounded-xl font-medium transition border border-red-500/30"
            >
              <FaTrash />
              Clear All
            </button>
          )}
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition backdrop-blur-sm border border-white/10"
          >
            <FaPlus />
            Add Products
          </Link>
        </div>
      </div>


      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {compareItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-700">
              <FaExchangeAlt className="text-5xl text-gray-600" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">No products to compare</h2>
            <p className="text-gray-400 mb-8 text-lg max-w-md mx-auto">Add products to compare their features, specifications, and prices side by side</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-10 py-4 rounded-xl font-bold text-lg transition transform hover:scale-105 shadow-lg shadow-blue-600/25"
            >
              <FaArrowLeft />
              Browse Products
            </Link>

            {/* How it works */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 text-center">
                <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-400">1</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Browse Products</h3>
                <p className="text-gray-400 text-sm">Find products you're interested in from our catalog</p>
              </div>
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 text-center">
                <div className="w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-400">2</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Add to Compare</h3>
                <p className="text-gray-400 text-sm">Click the compare button on product cards</p>
              </div>
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 text-center">
                <div className="w-14 h-14 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-pink-400">3</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Compare Features</h3>
                <p className="text-gray-400 text-sm">View all specs side by side and make your choice</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="p-6 text-left text-gray-400 font-semibold w-56 bg-gray-900/50">
                      <span className="text-lg">Feature</span>
                    </th>
                    {compareItems.map(item => (
                      <th key={item.id} className="p-6 text-center min-w-[280px] bg-gray-900/30">
                        <div className="relative group">
                          <button
                            onClick={() => removeFromCompare(item.id)}
                            className="absolute -top-2 -right-2 p-2 bg-gray-800 text-gray-400 hover:bg-red-500 hover:text-white rounded-full transition opacity-0 group-hover:opacity-100 z-10"
                            title="Remove from compare"
                          >
                            <FaTimes size={12} />
                          </button>
                          <Link to={`/products/${item.id}`} className="block">
                            <div className="w-40 h-40 mx-auto mb-4 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                onError={(e) => e.target.src = 'https://placehold.co/160x160/1f2937/9ca3af?text=No+Image'}
                              />
                            </div>
                            <p className="text-white font-semibold text-base line-clamp-2 hover:text-purple-400 transition">
                              {item.name}
                            </p>
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Price Row */}
                  <tr className="border-b border-gray-700/50 hover:bg-gray-800/30 transition">
                    <td className="p-5 text-gray-400 font-semibold bg-gray-900/30">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-purple-400">₹</span>
                        </span>
                        Price
                      </div>
                    </td>
                    {compareItems.map(item => (
                      <td key={item.id} className="p-5 text-center">
                        <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                          ₹{item.price?.toLocaleString('en-IN')}
                        </div>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <div className="flex items-center justify-center gap-2 mt-1">
                            <span className="text-sm text-gray-500 line-through">
                              ₹{item.originalPrice?.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                              {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off
                            </span>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Brand Row */}
                  <tr className="border-b border-gray-700/50 hover:bg-gray-800/30 transition">
                    <td className="p-5 text-gray-400 font-semibold bg-gray-900/30">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 text-sm">B</span>
                        Brand
                      </div>
                    </td>
                    {compareItems.map(item => (
                      <td key={item.id} className="p-5 text-center text-white font-medium">
                        {item.brand || <span className="text-gray-500">-</span>}
                      </td>
                    ))}
                  </tr>

                  {/* Rating Row */}
                  <tr className="border-b border-gray-700/50 hover:bg-gray-800/30 transition">
                    <td className="p-5 text-gray-400 font-semibold bg-gray-900/30">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <FaStar className="text-yellow-400 text-sm" />
                        </span>
                        Rating
                      </div>
                    </td>
                    {compareItems.map(item => (
                      <td key={item.id} className="p-5 text-center">
                        {item.rating ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="flex items-center gap-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-lg font-semibold">
                              <FaStar className="text-sm" />
                              {item.rating.toFixed(1)}
                            </div>
                            {item.reviewCount && (
                              <span className="text-gray-500 text-sm">({item.reviewCount})</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">No ratings</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Availability Row */}
                  <tr className="border-b border-gray-700/50 hover:bg-gray-800/30 transition">
                    <td className="p-5 text-gray-400 font-semibold bg-gray-900/30">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <FaCheck className="text-green-400 text-sm" />
                        </span>
                        Availability
                      </div>
                    </td>
                    {compareItems.map(item => (
                      <td key={item.id} className="p-5 text-center">
                        {item.stock > 0 ? (
                          <span className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg font-medium">
                            <FaCheck /> In Stock ({item.stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg font-medium">
                            <FaTimes /> Out of Stock
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Dynamic Specs Rows */}
                  {allSpecs.map((spec, idx) => (
                    <tr key={spec} className={`border-b border-gray-700/50 hover:bg-gray-800/30 transition ${idx % 2 === 0 ? 'bg-gray-900/10' : ''}`}>
                      <td className="p-5 text-gray-400 font-semibold bg-gray-900/30">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                            {spec.charAt(0).toUpperCase()}
                          </span>
                          {spec}
                        </div>
                      </td>
                      {compareItems.map(item => {
                        const specs = getSpecsObj(item)
                        return (
                          <td key={item.id} className="p-5 text-center text-white">
                            {specs[spec] || <FaMinus className="text-gray-600 mx-auto" />}
                          </td>
                        )
                      })}
                    </tr>
                  ))}

                  {/* Key Features Row */}
                  <tr className="border-b border-gray-700/50 hover:bg-gray-800/30 transition">
                    <td className="p-5 text-gray-400 font-semibold bg-gray-900/30 align-top">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                          <FaCheck className="text-pink-400 text-sm" />
                        </span>
                        Key Features
                      </div>
                    </td>
                    {compareItems.map(item => (
                      <td key={item.id} className="p-5 text-left align-top">
                        {item.features && item.features.length > 0 ? (
                          <ul className="space-y-2">
                            {item.features.slice(0, 5).map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <FaCheck className="text-green-400 flex-shrink-0 mt-1" size={10} />
                                <span className="text-gray-300">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-500">No features listed</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Action Row */}
                  <tr className="bg-gray-900/50">
                    <td className="p-5 text-gray-400 font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <FaShoppingCart className="text-purple-400 text-sm" />
                        </span>
                        Action
                      </div>
                    </td>
                    {compareItems.map(item => (
                      <td key={item.id} className="p-5 text-center">
                        <div className="space-y-2">
                          <button
                            onClick={() => addToCart(item)}
                            disabled={item.stock === 0}
                            className="w-full bg-white text-slate-900 hover:bg-slate-200 px-6 py-3 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                          >
                            <FaShoppingCart className="text-blue-600" />
                            Add to Cart
                          </button>
                          <Link
                            to={`/products/${item.id}`}
                            className="block w-full bg-slate-800 hover:bg-slate-700 border border-white/10 text-white px-6 py-3 rounded-xl font-medium transition text-center hover:border-white/20"
                          >
                            View Details
                          </Link>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

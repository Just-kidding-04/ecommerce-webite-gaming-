import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import ProductCard from '../../components/product/ProductCard'
import { fetchAll, fetchCategories } from '../../services/productService'
import { FaSearch, FaFilter, FaTimes, FaTag, FaLaptop, FaMobileAlt, FaGamepad, FaDesktop, FaTv, FaHeadphones, FaChevronDown, FaChevronUp, FaRupeeSign, FaSlidersH, FaSortAmountDown } from 'react-icons/fa'

const CATEGORY_ICONS = {
  'Laptops': FaLaptop,
  'Mobiles': FaMobileAlt,
  'Accessories': FaGamepad,
  'Gaming PCs': FaDesktop,
  'Monitors': FaTv,
  'Audio': FaHeadphones
}

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    search: true,
    category: true,
    price: true
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [productsData, categoriesData] = await Promise.all([
          fetchAll({ limit: 500 }),
          fetchCategories()
        ])
        setProducts(productsData)
        setCategories(categoriesData)
        applyFilters(productsData)
      } catch (error) {
        console.error('Failed to load products:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    const cat = searchParams.get('category')
    const q = searchParams.get('search')
    setSelectedCategory(cat || '')
    setSearch(q || '')
  }, [searchParams])

  useEffect(() => {
    if (products.length > 0) {
      applyFilters(products)
    }
  }, [selectedCategory, search, minPrice, maxPrice, sortBy, products])

  function applyFilters(data) {
    let result = [...data]
    // Hot Deals filter: show only products with isDeal and dealPercent > 0 if ?deals=true
    const showDeals = searchParams.get('deals') === 'true';
    if (showDeals) {
      result = result.filter(p => p.isDeal && p.dealPercent > 0);
    }

    if (selectedCategory) {
      const catId = parseInt(selectedCategory)
      result = result.filter(p =>
        p.categoryId === catId ||
        p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        p.Category?.name?.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      )
    }

    if (minPrice) result = result.filter(p => p.price >= Number(minPrice))
    if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice))

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    setFiltered(result)
  }

  function clearFilters() {
    setSelectedCategory('')
    setSearch('')
    setMinPrice('')
    setMaxPrice('')
    setSortBy('newest')
    setSearchParams({})
  }

  function handleCategoryChange(cat) {
    setSelectedCategory(cat)
    if (cat) {
      setSearchParams({ category: cat })
    } else {
      searchParams.delete('category')
      setSearchParams(searchParams)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    )
  }

  const currentCategoryName = selectedCategory
    ? categories.find(c => c.id == selectedCategory)?.name || selectedCategory
    : null

  return (
    <div>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm mb-8 flex overflow-x-auto pb-2">
          <ol className="flex items-center gap-2 text-slate-400 whitespace-nowrap">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li>/</li>
            <li className={currentCategoryName ? 'hover:text-white transition-colors' : 'text-blue-400 font-medium'}>
              <Link to="/products">Products</Link>
            </li>
            {currentCategoryName && (
              <>
                <li>/</li>
                <li className="text-blue-400 font-medium">{currentCategoryName}</li>
              </>
            )}
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 border border-white/10 text-white rounded-xl font-medium shadow-lg active:scale-95 transition-all"
          >
            <FaSlidersH />
            Filters & Sort
          </button>

          {/* Filters Sidebar */}
          <aside className={`
            fixed inset-0 z-50 lg:relative lg:z-auto
            ${showMobileFilters ? 'visible' : 'invisible lg:visible'}
          `}>
            {/* Mobile Overlay */}
            <div
              className={`absolute inset-0 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity ${showMobileFilters ? 'opacity-100' : 'opacity-0'}`}
              onClick={() => setShowMobileFilters(false)}
            />

            {/* Sidebar Content */}
            <div className={`
              absolute right-0 top-0 h-full w-80 max-w-[85vw] lg:relative lg:w-72 lg:h-auto
              transform transition-transform lg:transform-none duration-300
              ${showMobileFilters ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}>
              <div className="h-full lg:h-auto bg-slate-900 lg:bg-transparent overflow-y-auto lg:overflow-visible custom-scrollbar">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between p-5 border-b border-white/10 bg-slate-900">
                  <div className="flex items-center gap-2">
                    <FaFilter className="text-blue-500" />
                    <span className="font-bold text-lg text-white">Filters</span>
                  </div>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="p-5 lg:p-0 space-y-6">
                  {/* Filter Card */}
                  <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl sticky top-24">
                    <div className="p-5 border-b border-white/5 bg-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FaFilter className="text-blue-400" />
                          <h2 className="font-bold text-white">Filters</h2>
                        </div>
                        <button
                          onClick={clearFilters}
                          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>

                    {/* Search Section */}
                    <div className="border-b border-white/5">
                      <button
                        onClick={() => toggleSection('search')}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors group"
                      >
                        <span className="font-medium text-slate-200 group-hover:text-white transition-colors">Search</span>
                        {expandedSections.search ? <FaChevronUp className="text-slate-500" /> : <FaChevronDown className="text-slate-500" />}
                      </button>
                      {expandedSections.search && (
                        <div className="px-4 pb-4">
                          <div className="relative group">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                            <input
                              type="text"
                              value={search}
                              onChange={e => setSearch(e.target.value)}
                              placeholder="Search..."
                              className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm"
                            />
                            {search && (
                              <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                              >
                                <FaTimes />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Categories Section */}
                    <div className="border-b border-white/5">
                      <button
                        onClick={() => toggleSection('category')}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors group"
                      >
                        <span className="font-medium text-slate-200 group-hover:text-white transition-colors">Category</span>
                        {expandedSections.category ? <FaChevronUp className="text-slate-500" /> : <FaChevronDown className="text-slate-500" />}
                      </button>
                      {expandedSections.category && (
                        <div className="px-4 pb-4 space-y-1">
                          <button
                            onClick={() => handleCategoryChange('')}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-sm ${!selectedCategory
                              ? 'bg-blue-500/10 text-blue-400 font-medium'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                              }`}
                          >
                            <span>All Categories</span>
                            {!selectedCategory && <FaCheckCircle className="w-3.5 h-3.5" />}
                          </button>
                          {categories.map(cat => {
                            const isActive = selectedCategory == cat.id
                            return (
                              <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.id.toString())}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-sm ${isActive
                                  ? 'bg-blue-500/10 text-blue-400 font-medium'
                                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                                  }`}
                              >
                                <span>{cat.name}</span>
                                {isActive && <FaCheckCircle className="w-3.5 h-3.5" />}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Price Range Section */}
                    <div>
                      <button
                        onClick={() => toggleSection('price')}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors group"
                      >
                        <span className="font-medium text-slate-200 group-hover:text-white transition-colors">Price Range</span>
                        {expandedSections.price ? <FaChevronUp className="text-slate-500" /> : <FaChevronDown className="text-slate-500" />}
                      </button>
                      {expandedSections.price && (
                        <div className="px-4 pb-4 space-y-4">
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <label className="text-xs text-slate-500 mb-1 block">Min</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₹</span>
                                <input
                                  type="number"
                                  value={minPrice}
                                  onChange={e => setMinPrice(e.target.value)}
                                  placeholder="0"
                                  className="w-full pl-6 pr-2 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <label className="text-xs text-slate-500 mb-1 block">Max</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₹</span>
                                <input
                                  type="number"
                                  value={maxPrice}
                                  onChange={e => setMaxPrice(e.target.value)}
                                  placeholder="Any"
                                  className="w-full pl-6 pr-2 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Quick Price Filters */}
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { label: '< ₹5K', min: 0, max: 5000 },
                              { label: '₹5K-15K', min: 5000, max: 15000 },
                              { label: '₹15K-50K', min: 15000, max: 50000 },
                              { label: '> ₹50K', min: 50000, max: '' }
                            ].map((range, idx) => {
                              const isActive = minPrice == range.min && maxPrice == range.max
                              return (
                                <button
                                  key={idx}
                                  onClick={() => { setMinPrice(range.min); setMaxPrice(range.max); }}
                                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all border ${isActive
                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                                    : 'bg-transparent text-slate-400 border-white/5 hover:border-white/20 hover:text-white'
                                    }`}
                                >
                                  {range.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Apply Filters Button (Mobile) */}
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="lg:hidden w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20"
                  >
                    Show {filtered.length} Results
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1 min-w-0">
            {/* Header */}
            <div className="bg-slate-800/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  {currentCategoryName || 'All Products'}
                  <span className="text-lg font-normal text-slate-500 bg-white/5 px-3 py-0.5 rounded-full border border-white/5">
                    {filtered.length}
                  </span>
                </h1>
                <p className="text-slate-400 text-sm mt-2">
                  Browse our premium collection of gaming gear
                </p>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-3 bg-black/20 border border-white/10 rounded-xl p-1.5 pl-4">
                <span className="text-sm text-slate-400 flex items-center gap-2">
                  <FaSortAmountDown /> Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-slate-800 border-none text-white text-sm focus:ring-0 rounded-lg py-2 pl-3 pr-8 cursor-pointer hover:bg-slate-700 transition-colors"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Best Rating</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCategory || search || minPrice || maxPrice) && (
              <div className="flex flex-wrap items-center gap-3 mb-8">
                {selectedCategory && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-sm border border-blue-500/20 animate-fade-in">
                    {currentCategoryName}
                    <button onClick={() => handleCategoryChange('')} className="hover:text-white ml-1 transition-colors">
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                )}
                {search && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-lg text-sm border border-purple-500/20 animate-fade-in">
                    "{search}"
                    <button onClick={() => setSearch('')} className="hover:text-white ml-1 transition-colors">
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-sm border border-green-500/20 animate-fade-in">
                    ₹{minPrice || 0} - ₹{maxPrice || '∞'}
                    <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="hover:text-white ml-1 transition-colors">
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm text-slate-500 hover:text-white transition-colors underline decoration-slate-700 hover:decoration-white underline-offset-4"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Products */}
            {filtered.length === 0 ? (
              <div className="bg-slate-800/20 border border-white/5 rounded-3xl p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-slate-800 rounded-full flex items-center justify-center">
                  <FaSearch className="text-3xl text-slate-600" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">No products found</h2>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                  We couldn't find matches for your current filters. Try adjusting your search or category selection.
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/25"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-12">
                {filtered.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
const FaCheckCircle = ({ className }) => <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.248-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628 0z"></path></svg>

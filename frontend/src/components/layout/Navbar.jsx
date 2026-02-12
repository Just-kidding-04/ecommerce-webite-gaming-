import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../services/authService'
import { clearUser } from '../../redux/slices/authSlice'
import { loadUserCart } from '../../redux/slices/cartSlice'
import { fetchCategories, searchProducts } from '../../services/productService'
import { useCompare } from '../../context/CompareContext'
import { FaBalanceScale, FaLaptop, FaMobileAlt, FaGamepad, FaDesktop, FaTv, FaHeadphones, FaFire, FaChevronDown, FaSearch, FaHeart, FaShoppingCart, FaUser, FaBars, FaTimes, FaBox, FaSignOutAlt, FaStore, FaShieldAlt } from 'react-icons/fa'

// Category icons mapping
const CATEGORY_ICONS = {
  'Laptops': FaLaptop,
  'Mobiles': FaMobileAlt,
  'Accessories': FaGamepad,
  'Gaming PCs': FaDesktop,
  'Monitors': FaTv,
  'Audio': FaHeadphones
}

// Backend base URL
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

// Helper to get full image URL
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
};

export default function Navbar() {
  const cartItems = useSelector(s => s.cart.items)
  const cartCount = cartItems.reduce((sum, item) => sum + (item.qty || 1), 0)
  const user = useSelector(s => s.auth.user)
  // ... (rest of the file until the image part)

  // ... (navigation to image render)
  const { compareCount } = useCompare()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [q, setQ] = useState('')
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const searchRef = useRef(null)
  const userMenuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error)
  }, [])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Reload cart when user changes
  useEffect(() => {
    dispatch(loadUserCart())
  }, [user, dispatch])

  // Live search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (q.length >= 2) {
        setIsSearching(true)
        try {
          const results = await searchProducts(q)
          setSearchResults(results.slice(0, 6))
          setShowSearchResults(true)
        } catch (e) {
          console.error(e)
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setShowSearchResults(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [q])

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function onSearch(e) {
    e.preventDefault()
    setShowSearchResults(false)
    if (!q && !selectedCategory) return navigate('/products')
    const params = new URLSearchParams()
    if (q) params.set('search', q)
    if (selectedCategory) params.set('category', selectedCategory)
    navigate(`/products?${params.toString()}`)
  }

  function handleProductClick(productId) {
    setShowSearchResults(false)
    setQ('')
    navigate(`/products/${productId}`)
  }

  function onLogout() {
    logout()
    dispatch(clearUser())
    setShowUserMenu(false)
    navigate('/')
  }

  const getCategoryName = () => {
    if (!selectedCategory) return 'All'
    const cat = categories.find(c => c.id == selectedCategory)
    return cat?.name || 'All'
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background-primary/80 backdrop-blur-md shadow-lg shadow-black/20' : 'bg-background-primary/50 backdrop-blur-sm'}`}>

      {/* Main Navbar */}
      <div className="border-b border-white/5 relative z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4 lg:gap-8">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                  <FaGamepad className="text-xl text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="text-2xl font-black text-white tracking-tight group-hover:text-glow transition-all">
                  Gaming<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Store</span>
                </span>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div ref={searchRef} className="flex-1 max-w-2xl hidden md:block relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
              <form onSubmit={onSearch} className="relative flex items-center bg-slate-800/80 border border-white/10 rounded-2xl overflow-hidden shadow-inner">

                {/* Category Dropdown */}
                <div className="relative border-r border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="h-11 px-4 text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 text-sm font-medium min-w-[130px]"
                  >
                    <span className="truncate">{getCategoryName()}</span>
                    <FaChevronDown className={`text-xs text-slate-500 transition-transform duration-300 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-slate-800 border border-white/10 rounded-xl shadow-xl py-2 z-50 animate-fade-in backdrop-blur-xl">
                      <button
                        type="button"
                        onClick={() => { setSelectedCategory(''); setShowCategoryDropdown(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center gap-3 ${!selectedCategory ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300'}`}
                      >
                        All Categories
                      </button>
                      {categories.map(cat => {
                        const IconComponent = CATEGORY_ICONS[cat.name] || FaGamepad
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => { setSelectedCategory(cat.id.toString()); setShowCategoryDropdown(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center gap-3 ${selectedCategory == cat.id ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300'}`}
                          >
                            <IconComponent className={selectedCategory == cat.id ? 'text-blue-400' : 'text-slate-500'} />
                            {cat.name}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Search Input */}
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  className="flex-1 h-11 px-4 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
                  placeholder="Search for gear..."
                />

                {/* Search Button */}
                <button
                  type="submit"
                  className="h-11 w-14 flex items-center justify-center bg-white/5 hover:bg-blue-600 hover:text-white text-slate-400 transition-all duration-300"
                >
                  {isSearching ? (
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <FaSearch />
                  )}
                </button>
              </form>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50 animate-fade-in">
                  <div className="py-2">
                    {searchResults.map(product => (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-blue-500/10 transition-colors text-left border-b border-white/5 last:border-0 group/item"
                      >
                        <div className="w-12 h-12 bg-slate-700/50 rounded-lg overflow-hidden flex-shrink-0 border border-white/5 group-hover/item:border-blue-500/30 transition-colors">
                          <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-200 font-medium truncate group-hover/item:text-blue-400 transition-colors">{product.name}</p>
                          <p className="text-slate-400 text-sm">₹{product.price?.toLocaleString('en-IN')}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={onSearch}
                    className="w-full px-4 py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors flex items-center justify-center gap-2 border-t border-white/5"
                  >
                    View all results
                    <FaChevronDown className="-rotate-90 text-xs" />
                  </button>
                </div>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4">

              {/* Wishlist */}
              <Link to="/wishlist" className="relative p-3 text-slate-400 hover:text-pink-400 hover:bg-white/5 rounded-xl transition-all group">
                <FaHeart className="text-xl group-hover:scale-110 transition-transform" />
              </Link>

              {/* Compare */}
              <Link to="/compare" className="relative p-3 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-xl transition-all group">
                <FaBalanceScale className="text-xl group-hover:scale-110 transition-transform" />
                {compareCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative p-3 text-slate-400 hover:text-blue-400 hover:bg-white/5 rounded-xl transition-all group mr-2">
                <FaShoppingCart className="text-xl group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg shadow-blue-500/30 animate-pop">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="relative z-50" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 pl-2 pr-1 py-1 hover:bg-white/5 rounded-full border border-transparent hover:border-white/10 transition-all group"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg ring-2 ring-transparent group-hover:ring-blue-500/30 transition-all overflow-hidden">
                      {user.avatar ? (
                        <img
                          src={getImageUrl(user.avatar)}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.name?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-4 w-64 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 animate-fade-in backdrop-blur-xl">
                      <div className="px-5 py-4 border-b border-white/5 mb-2">
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>

                      <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                        <FaUser className="text-slate-500" /> Profile
                      </Link>
                      <Link to="/orders" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                        <FaBox className="text-slate-500" /> Orders
                      </Link>

                      {user.isAdmin && (
                        <Link to="/admin/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors">
                          <FaShieldAlt /> Admin
                        </Link>
                      )}

                      {user.isSeller && !user.isAdmin && (
                        <Link to="/seller/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-green-400 hover:text-green-300 hover:bg-green-500/10 transition-colors">
                          <FaStore /> Seller Dashboard
                        </Link>
                      )}

                      <div className="border-t border-white/5 mt-2 pt-2">
                        <button onClick={onLogout} className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left">
                          <FaSignOutAlt /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" state={{ from: location }} className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    Log In
                  </Link>
                  <Link to="/register" state={{ from: location }} className="hidden sm:flex px-6 py-2.5 bg-white text-slate-900 text-sm font-bold rounded-xl hover:bg-blue-50 hover:scale-105 transition-all shadow-lg shadow-white/5">
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2 ml-1 text-slate-300 md:hidden">
                {showMobileMenu ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation Bar (Desktop) */}
      <div className="border-b border-white/5 hidden md:block bg-black/10 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-6 py-3 overflow-x-auto scrollbar-hide">
            <Link to="/products" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
              <FaStore className="text-slate-500" /> All Products
            </Link>

            <div className="w-px h-4 bg-white/10"></div>

            {categories.map(cat => (
              <Link key={cat.id} to={`/products?category=${cat.id}`} className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-blue-400 transition-colors whitespace-nowrap">
                {cat.name}
              </Link>
            ))}

            <div className="flex-1"></div>

            <Link to="/products?deals=true" className="flex items-center gap-2 text-sm font-bold text-orange-400 hover:text-orange-300 transition-colors">
              <FaFire className="animate-pulse" /> Hot Deals
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${showMobileMenu ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity ${showMobileMenu ? 'opacity-100' : 'opacity-0'}`} onClick={() => setShowMobileMenu(false)} />

        <div className={`absolute right-0 top-0 h-full w-4/5 max-w-sm bg-slate-900 border-l border-white/10 transform transition-transform duration-300 ${showMobileMenu ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <span className="text-lg font-bold text-white">Menu</span>
              <button onClick={() => setShowMobileMenu(false)} className="p-2 text-slate-400 hover:text-white"><FaTimes /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <Link to="/" onClick={() => setShowMobileMenu(false)} className="block px-4 py-3 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white font-medium">Home</Link>
              <Link to="/products" onClick={() => setShowMobileMenu(false)} className="block px-4 py-3 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white font-medium">All Products</Link>

              <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categories</div>
              {categories.map(cat => (
                <Link key={cat.id} to={`/products?category=${cat.id}`} onClick={() => setShowMobileMenu(false)} className="block px-4 py-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-blue-400 font-medium transition-colors">
                  {cat.name}
                </Link>
              ))}
            </div>

            {user && (
              <div className="p-4 border-t border-white/10 bg-black/20">
                <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold transition-all">
                  <FaSignOutAlt /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

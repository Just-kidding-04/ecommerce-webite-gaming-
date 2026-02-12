import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../../components/product/ProductCard'
import { fetchAll, fetchCategories } from '../../services/productService'
import { getRecentlyViewed } from '../../services/recentlyViewedService'
import { useCompare } from '../../context/CompareContext'
import { FaBalanceScale, FaGamepad, FaLaptop, FaMobileAlt, FaHeadphones, FaDesktop, FaTv, FaShippingFast, FaShieldAlt, FaUndo, FaHeadset, FaFire, FaStar, FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import axios from '../../services/axiosInstance'
import { toast } from '../../utils/toast'

// Hero carousel slides
const HERO_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1200&q=80',
    title: 'Ultimate Gaming PCs',
    subtitle: 'Experience 4K gaming with RTX 4090',
    link: '/products?category=4',
    gradient: 'from-purple-900/90 via-purple-800/70 to-transparent'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200&q=80',
    title: 'Gaming Laptops',
    subtitle: 'Portable power with 240Hz displays',
    link: '/products?category=1',
    gradient: 'from-blue-900/90 via-blue-800/70 to-transparent'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80',
    title: 'Gaming Smartphones',
    subtitle: 'Play anywhere with 165Hz AMOLED',
    link: '/products?category=2',
    gradient: 'from-red-900/90 via-red-800/70 to-transparent'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=1200&q=80',
    title: 'Pro Gaming Accessories',
    subtitle: 'Mice, keyboards, controllers & more',
    link: '/products?category=3',
    gradient: 'from-emerald-900/90 via-emerald-800/70 to-transparent'
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&q=80',
    title: 'Gaming Monitors',
    subtitle: '360Hz displays with 1ms response',
    link: '/products?category=6',
    gradient: 'from-pink-900/90 via-pink-800/70 to-transparent'
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80',
    title: 'Gaming Audio',
    subtitle: 'Immersive headsets & speakers',
    link: '/products?category=5',
    gradient: 'from-amber-900/90 via-amber-800/70 to-transparent'
  }
]

const CATEGORY_ICONS = {
  'Laptops': FaLaptop,
  'Mobiles': FaMobileAlt,
  'Accessories': FaGamepad,
  'Gaming PCs': FaDesktop,
  'Monitors': FaTv,
  'Audio': FaHeadphones
}

const CATEGORY_IMAGES = {
  'Laptops': 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&q=80',
  'Mobiles': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
  'Accessories': 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&q=80',
  'Gaming PCs': 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&q=80',
  'Monitors': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80',
  'Audio': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80'
}

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const { compareCount } = useCompare()
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const [prods, cats] = await Promise.all([
          fetchAll({ limit: 50 }),
          fetchCategories()
        ])
        setProducts(prods)
        setCategories(cats)
        setRecentlyViewed(getRecentlyViewed())
      } catch (e) {
        console.error('Failed to load data:', e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  async function handleSubscribe(e) {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email')
      return
    }
    setSubscribing(true)
    try {
      const res = await axios.post('/api/subscription', { email })
      if (res.data.success) {
        toast.success(res.data.message)
        setEmail('')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to subscribe')
    } finally {
      setSubscribing(false)
    }
  }

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Get deals (products with original price higher than current)
  const deals = products.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 8)

  // Get featured products (highest rated)
  const featured = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8)

  // Get new arrivals (most recent)
  const newArrivals = [...products].slice(0, 4)

  // Get best sellers (for demo, using random selection)
  const bestSellers = [...products].sort(() => Math.random() - 0.5).slice(0, 4)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading amazing products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover transform scale-105"
            />

            <div className="absolute inset-0 flex items-center z-20">
              <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl animate-slide-up">
                  <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider shadow-lg shadow-blue-500/20">
                    New Collection
                  </span>
                  <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
                    {slide.title}
                  </h1>
                  <p className="text-xl text-slate-300 mb-10 font-light leading-relaxed max-w-lg">
                    {slide.subtitle}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to={slide.link}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-600/30"
                    >
                      Shop Now
                      <FaArrowRight />
                    </Link>
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md hover:bg-white/10 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all border border-white/10 hover:border-white/20"
                    >
                      Explore All
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Controls */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex items-center gap-6 z-30">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="w-12 h-12 bg-black/30 backdrop-blur-md hover:bg-white/10 text-white rounded-full flex items-center justify-center transition-all border border-white/10"
          >
            <FaChevronLeft />
          </button>

          <div className="flex gap-3">
            {HERO_SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-blue-500 w-8' : 'bg-white/20 w-2 hover:bg-white/40'
                  }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
            className="w-12 h-12 bg-black/30 backdrop-blur-md hover:bg-white/10 text-white rounded-full flex items-center justify-center transition-all border border-white/10"
          >
            <FaChevronRight />
          </button>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-24">

        {/* Categories Grid */}
        <section>
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                <span className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <FaGamepad />
                </span>
                Shop by Category
              </h2>
              <p className="text-slate-400 ml-1">The Gaming World Awaits!!</p>
            </div>
            <Link
              to="/products"
              className="hidden md:flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold transition-colors group"
            >
              View All Categories
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map(cat => {
              const IconComponent = CATEGORY_ICONS[cat.name] || FaGamepad
              return (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.id}`}
                  className="group relative h-64 rounded-3xl overflow-hidden bg-slate-800 border border-white/5 hover:border-purple-500/50 transition-all hover:-translate-y-1 shadow-lg hover:shadow-purple-500/10"
                >
                  <img
                    src={CATEGORY_IMAGES[cat.name] || CATEGORY_IMAGES['Gaming PCs']}
                    alt={cat.name}
                    className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/10 group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-all group-hover:scale-110">
                      <IconComponent className="text-3xl text-white group-hover:text-purple-400 transition-colors" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">{cat.name}</h3>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                      {cat.productCount || products.filter(p => p.categoryId === cat.id).length || 0} Products
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Flash Deals Section */}
        {deals.length > 0 && (
          <section className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-orange-600/10 to-yellow-600/10 rounded-[3rem] blur-3xl"></div>
            <div className="relative bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20 animate-pulse">
                    <FaFire className="text-3xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-2">Flash Deals</h2>
                    <p className="text-red-300 font-medium">Limited time offers - Don't miss out!</p>
                  </div>
                </div>
                <Link
                  to="/products"
                  className="hidden md:flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold transition border border-white/10"
                >
                  View All Deals
                  <FaArrowRight />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                {deals.slice(0, 4).map(product => {
                  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                  return (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="group bg-slate-900/50 rounded-2xl p-4 hover:bg-slate-800/80 transition-all border border-white/5 hover:border-red-500/30 hover:-translate-y-1 block"
                    >
                      <div className="relative mb-4 aspect-square bg-black/20 rounded-xl overflow-hidden p-4">
                        <span className="absolute top-0 left-0 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-3 py-1.5 rounded-br-xl font-bold z-10 shadow-lg">
                          -{discount}%
                        </span>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-lg"
                        />
                      </div>
                      <h3 className="font-bold text-white line-clamp-2 mb-2 group-hover:text-red-400 transition-colors pointer-events-none">
                        {product.name}
                      </h3>
                      <div className="flex items-end gap-2 pointer-events-none">
                        <span className="text-xl font-bold text-white">
                          ₹{product.price?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-sm text-slate-500 line-through mb-0.5">
                          ₹{product.originalPrice?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Featured Products */}
        <section>
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                <span className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                  <FaStar />
                </span>
                Featured Products
              </h2>
              <p className="text-slate-400 ml-1">Top-rated gaming gear</p>
            </div>
            <Link
              to="/products"
              className="hidden md:flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold transition-colors group"
            >
              View All Products
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* New Arrivals & Best Sellers Split */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* New Arrivals */}
          <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-lg">✨</span>
                New Arrivals
              </h3>
              <Link to="/products" className="text-blue-400 hover:text-blue-300 text-sm font-bold flex items-center gap-1 group">
                View All <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="space-y-4">
              {newArrivals.map(product => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="flex items-center gap-5 bg-black/20 hover:bg-white/5 rounded-2xl p-4 transition-all group border border-transparent hover:border-white/5"
                >
                  <div className="w-20 h-20 bg-slate-900 rounded-xl overflow-hidden flex-shrink-0 p-2 border border-white/5">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0 pointer-events-none">
                    <h4 className="text-white font-bold line-clamp-1 group-hover:text-blue-400 transition-colors">{product.name}</h4>
                    <p className="text-slate-400 text-sm line-clamp-1 mb-2">{product.category}</p>
                    <p className="text-white font-bold">₹{product.price?.toLocaleString('en-IN')}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Best Sellers */}
          <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 text-lg">🏆</span>
                Best Sellers
              </h3>
              <Link to="/products" className="text-orange-400 hover:text-orange-300 text-sm font-bold flex items-center gap-1 group">
                View All <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="space-y-4">
              {bestSellers.map((product, idx) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="flex items-center gap-5 bg-black/20 hover:bg-white/5 rounded-2xl p-4 transition-all group border border-transparent hover:border-white/5"
                >
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center font-black text-slate-500 italic text-lg flex-shrink-0 border border-white/5">
                    #{idx + 1}
                  </div>
                  <div className="w-16 h-16 bg-slate-900 rounded-xl overflow-hidden flex-shrink-0 p-2 border border-white/5">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0 pointer-events-none">
                    <h4 className="text-white font-bold line-clamp-1 group-hover:text-orange-400 transition-colors">{product.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-slate-300 font-bold text-sm">₹{product.price?.toLocaleString('en-IN')}</span>
                      {product.rating && (
                        <span className="text-yellow-400 text-xs flex items-center gap-1 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                          <FaStar /> {product.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Promo Banner */}
        <section className="relative h-96 rounded-[2.5rem] overflow-hidden group">
          <img
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80"
            alt="Gaming Setup"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-60 group-hover:opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-2xl px-10 md:px-20">
              <span className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-6 shadow-lg shadow-green-500/20">
                Limited Time Offer
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                Level Up Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Gaming Setup</span>
              </h2>
              <p className="text-slate-300 mb-8 text-lg font-light max-w-lg">
                Get free shipping on orders over ₹5,000 & 30-day easy returns. Don't wait to upgrade.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-200 px-8 py-4 rounded-xl font-bold transition-all transform hover:-translate-y-1 shadow-xl"
              >
                Shop Now
                <FaArrowRight />
              </Link>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: FaShippingFast, title: 'Free Shipping', desc: 'On orders over ₹5,000', color: 'from-blue-500 to-cyan-500' },
            { icon: FaShieldAlt, title: 'Secure Payment', desc: '256-bit SSL encryption', color: 'from-green-500 to-emerald-500' },
            { icon: FaUndo, title: 'Easy Returns', desc: '30-day return policy', color: 'from-purple-500 to-pink-500' },
            { icon: FaHeadset, title: '24/7 Support', desc: 'Always here to help', color: 'from-orange-500 to-red-500' },
          ].map((item, i) => (
            <div key={i} className="bg-slate-800/20 backdrop-blur-sm border border-white/5 rounded-3xl p-8 text-center hover:border-white/10 hover:bg-slate-800/40 transition-all group">
              <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="text-3xl text-white" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </section>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  Recently Viewed
                </h2>
                <p className="text-slate-400 ml-1">Pick up where you left off</p>
              </div>
              <Link
                to="/products"
                className="hidden md:flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold transition"
              >
                Browse More
                <FaArrowRight />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {recentlyViewed.slice(0, 5).map(product => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="bg-slate-800/40 border border-white/5 rounded-2xl p-4 hover:border-blue-500/30 transition-all group block shadow-lg hover:-translate-y-1"
                >
                  <div className="aspect-square bg-black/20 rounded-xl overflow-hidden mb-4 flex items-center justify-center p-2">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-bold text-white line-clamp-1 text-sm mb-1 group-hover:text-blue-400 transition-colors pointer-events-none">
                    {product.name}
                  </h3>
                  <p className="text-blue-400 font-bold pointer-events-none">
                    ₹{product.price?.toLocaleString('en-IN')}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Newsletter Section */}
        <section className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border border-white/10 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Gaming</span> Community
            </h2>
            <p className="text-indigo-200 mb-10 text-lg">
              Subscribe to get exclusive deals, gaming tips, and be the first to know about new arrivals. No spam, we promise.
            </p>
            <div className="w-full">
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 bg-black/30 backdrop-blur-md border border-white/20 rounded-xl px-6 py-4 text-white placeholder-indigo-300 focus:border-white focus:ring-2 focus:ring-white/20 outline-none transition"
                  disabled={subscribing}
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="bg-white text-indigo-900 hover:bg-indigo-50 px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-xl disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {subscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>

      {/* Compare Floating Button */}
      {compareCount > 0 && (
        <Link
          to="/compare"
          className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-4 rounded-full font-bold shadow-lg shadow-blue-500/40 hover:shadow-blue-500/60 transition-all flex items-center gap-3 z-50 hover:-translate-y-1 animate-float"
        >
          <FaBalanceScale className="text-xl" />
          <span>Compare ({compareCount})</span>
        </Link>
      )}
    </div>
  )
}

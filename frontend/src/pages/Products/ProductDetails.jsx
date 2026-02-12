import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchById, fetchByCategory } from '../../services/productService'
import { useSelector, useDispatch } from 'react-redux'
import { addItem, updateItemQty, removeItem } from '../../redux/slices/cartSlice'
import { addToWishlist, removeFromWishlist, checkWishlist } from '../../services/wishlistService'
import { addToRecentlyViewed } from '../../services/recentlyViewedService'
import { addToCart as addToCartApi } from '../../services/cartService'
import { useCompare } from '../../context/CompareContext'
import { toast } from '../../utils/toast'
import { FaBalanceScale, FaShare, FaFacebook, FaTwitter, FaWhatsapp, FaLink, FaCheck, FaHeart, FaTruck, FaShieldAlt, FaStar, FaChevronRight, FaShoppingCart, FaBolt } from 'react-icons/fa'
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa'
import ProductCard from '../../components/product/ProductCard'
import ReviewForm from '../../components/product/ReviewForm'
import ReviewsList from '../../components/product/ReviewsList'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const cartItems = useSelector(s => s.cart.items)
  const cartItem = cartItems.find(i => i.id === Number(id))
  const [quantity, setQuantity] = useState(cartItem ? cartItem.qty : 1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [cartLoading, setCartLoading] = useState(false)
  const [buyNowLoading, setBuyNowLoading] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const dispatch = useDispatch()
  const user = useSelector(state => state.auth.user)
  const { addToCompare, isInCompare, removeFromCompare } = useCompare()

  useEffect(() => {
    async function loadProduct() {
      setLoading(true)
      setQuantity(1)
      setSelectedImage(0)
      const p = await fetchById(Number(id))
      if (p) {
        // Ensure reviews array exists
        if (!p.reviews) p.reviews = []
        setProduct(p)
        addToRecentlyViewed(p)

        if (user) {
          const inWishlist = await checkWishlist(p.id)
          setIsWishlisted(inWishlist)
        }

        if (p.categoryId) {
          const related = await fetchByCategory(p.categoryId)
          setRelatedProducts(related.filter(r => r.id !== p.id).slice(0, 4))
        }
      }
      setLoading(false)
    }
    loadProduct()
  }, [id, user]) // Added user to dependency array to re-check wishlist on login

  // Close share menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (showShareMenu && !e.target.closest('.share-menu-container')) {
        setShowShareMenu(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showShareMenu])

  async function addToCart() {
    if (!product.stock || product.stock < 1) {
      toast.error('Product is out of stock')
      return
    }

    setCartLoading(true)
    try {
      dispatch(addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        qty: 1,
        image: product.image
      }))
      const token = localStorage.getItem('gamingstore_token')
      if (token) {
        await addToCartApi(product.id, 1)
      }
      toast.success(`Added ${product.name} to cart!`)
    } catch (e) {
      toast.error('Failed to add to cart')
    } finally {
      setCartLoading(false)
    }
  }

  async function buyNow() {
    if (!product.stock || product.stock < 1) {
      toast.error('Product is out of stock')
      return
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available`)
      return
    }

    setBuyNowLoading(true)
    try {
      dispatch(addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        qty: quantity,
        image: product.image
      }))

      const token = localStorage.getItem('gamingstore_token')
      if (token) {
        await addToCartApi(product.id, quantity)
      }

      navigate('/checkout')
    } catch (e) {
      toast.error('Failed to proceed to checkout')
      setBuyNowLoading(false)
    }
  }

  async function toggleWishlist() {
    const token = localStorage.getItem('gamingstore_token')
    if (!token) {
      toast.error('Please login to add items to wishlist')
      navigate('/login')
      return
    }

    setWishlistLoading(true)
    try {
      if (isWishlisted) {
        const result = await removeFromWishlist(product.id)
        if (result.success) {
          setIsWishlisted(false)
          toast.success('Removed from wishlist')
        }
      } else {
        const result = await addToWishlist(product.id)
        if (result.success) {
          setIsWishlisted(true)
          toast.success('Added to wishlist!')
        } else {
          toast.info(result.error)
        }
      }
    } catch (e) {
      toast.error('Failed to update wishlist')
    } finally {
      setWishlistLoading(false)
    }
  }

  function handleCompareClick() {
    if (isInCompare(product.id)) {
      removeFromCompare(product.id)
      toast.info('Removed from compare')
    } else {
      const added = addToCompare(product)
      if (added) {
        toast.success('Added to compare!')
      }
    }
  }

  function shareProduct(platform) {
    const url = window.location.href
    const text = `Check out ${product.name} - ₹${product.price?.toLocaleString('en-IN')}`

    let shareUrl = ''
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
        break
      case 'copy':
        navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard!')
        setShowShareMenu(false)
        return
      default:
        return
    }

    window.open(shareUrl, '_blank', 'width=600,height=400')
    setShowShareMenu(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Product not found</h2>
          <Link to="/products" className="text-blue-400 hover:text-blue-300 mt-4 inline-block hover:underline">
            ← Back to Products
          </Link>
        </div>
      </div>
    )
  }

  // Generate images array (use product.images if available, else use main image)
  const images = product.images && product.images.length > 0
    ? product.images
    : [product.image]

  // Get specs from specsData or specs array
  const specs = product.specsData || (product.specs && Array.isArray(product.specs)
    ? product.specs.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {})
    : product.specs || {})

  // Calculate discount
  // Show deal badge only if isDeal is true and dealPercent > 0
  const discount = product && product.isDeal && product.dealPercent > 0 ? product.dealPercent : 0

  return (
    <div>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm mb-8 flex overflow-x-auto pb-2">
          <ol className="flex items-center gap-2 text-slate-400 whitespace-nowrap">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li>/</li>
            <li><Link to="/products" className="hover:text-white transition-colors">Products</Link></li>
            {product.category && (
              <>
                <li>/</li>
                <li><Link to={`/products?category=${product.categoryId}`} className="hover:text-white transition-colors">{product.category}</Link></li>
              </>
            )}
            <li>/</li>
            <li className="text-blue-400 font-medium truncate max-w-[200px]">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Image Gallery (Span 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-3xl p-4 lg:p-8 overflow-hidden group shadow-2xl">
              <div className="relative aspect-[4/3] flex items-center justify-center rounded-2xl overflow-hidden bg-black/20">
                {discount > 0 && (
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm px-4 py-1.5 rounded-full font-bold shadow-lg shadow-red-500/20 z-10 animate-pulse">
                    -{discount}% OFF
                  </span>
                )}
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-2xl"
                  onError={(e) => { e.target.src = 'https://placehold.co/800x600/1e293b/475569?text=Product+Image' }}
                />
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all p-2 bg-slate-800/40 backdrop-blur-sm ${selectedImage === idx
                      ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-105 ring-2 ring-blue-500/20'
                      : 'border-white/5 hover:border-white/20 opacity-70 hover:opacity-100'
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Features (moved from right) */}
            {product.features && product.features.length > 0 && (
              <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">✨</span>
                  Key Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-black/20 border border-white/5 hover:border-blue-500/30 transition-colors group">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                        <FaCheck className="w-3 h-3 text-green-400" />
                      </div>
                      <span className="text-slate-200 font-medium group-hover:text-white transition-colors">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs Section for Description & Specs */}
            <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-xl">
              <div className="flex border-b border-white/5 bg-black/20">
                {['description', 'specs', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-5 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === tab
                      ? 'text-blue-400 bg-blue-500/5'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-8 min-h-[300px]">
                {activeTab === 'description' && (
                  <div className="animate-fade-in space-y-6">
                    <h3 className="text-2xl font-bold text-white mb-4">Product Description</h3>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-slate-300 leading-relaxed text-lg">{product.description}</p>
                      <p className="text-slate-400 leading-relaxed mt-4">
                        Designed for peak performance and durability, the {product.name} stands out in its category.
                        With premium materials and cutting-edge technology, it delivers an exceptional user experience that
                        gamers and professionals specifically rely on.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="animate-fade-in">
                    <h3 className="text-2xl font-bold text-white mb-6">Technical Specifications</h3>
                    {Object.keys(specs).length > 0 ? (
                      <div className="grid grid-cols-1 gap-y-0 rounded-2xl overflow-hidden border border-white/5">
                        {Object.entries(specs).map(([key, value], idx) => (
                          <div key={key} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-white/5 last:border-0 ${idx % 2 === 0 ? 'bg-black/20' : 'bg-transparent'}`}>
                            <span className="font-medium text-slate-400 sm:w-1/3">{key}</span>
                            <span className="text-white font-semibold sm:w-2/3 sm:text-right">{value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">No detailed specifications available.</p>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="animate-fade-in text-center py-12">
                    <div className="text-6xl font-black text-white mb-2">{product.rating}</div>
                    <div className="flex justify-center text-yellow-400 mb-4 text-2xl gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-slate-700'} />
                      ))}
                    </div>
                    <p className="text-slate-400 mb-8">Based on {product.reviewCount || 0} user reviews</p>
                    {/* Review Form */}
                    <ReviewForm productId={product.id} onReviewAdded={newReview => {
                      setProduct(prev => ({
                        ...prev,
                        reviews: prev.reviews ? [newReview, ...prev.reviews] : [newReview]
                      }))
                    }} />
                    {/* Reviews List */}
                    <ReviewsList reviews={product.reviews || []} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Sticky Info (Span 5) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-8">
              {/* Header Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {product.brand && (
                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                      {product.brand}
                    </span>
                  )}
                  {product.stock > 0 ? (
                    <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      In Stock
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                      Out of Stock
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-lg">
                  {product.name}
                </h1>

                <div className="flex items-center gap-4">
                  <div className="flex text-yellow-400 text-lg gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-slate-700'} />
                    ))}
                  </div>
                  <span className="text-slate-400 text-sm border-l border-slate-700 pl-4 font-medium">
                    {product.reviewCount || 0} verified reviews
                  </span>
                </div>
              </div>

              {/* Price Card */}
              <div className="bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/20 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="flex items-end gap-3 mb-2">
                    <span className="text-5xl font-black text-white tracking-tight">
                      ₹{product.price?.toLocaleString('en-IN')}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="flex flex-col mb-1.5">
                        <span className="text-lg text-slate-500 line-through decoration-red-500/50">
                          ₹{product.originalPrice?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-sm text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20 mt-1">
                          Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm mb-8 font-medium">Inclusive of all taxes. Free shipping on this item.</p>

                  {/* Quantity Selector */}
                  {product.stock > 0 && (
                    <div className="flex items-center gap-6 mb-8">
                      <span className="text-slate-300 font-medium">Quantity:</span>
                      {cartItem ? (
                        <div className="flex items-center gap-2">
                          <button
                            className="w-7 h-7 flex items-center justify-center bg-white text-gray-700 border border-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-full font-bold text-base shadow transition duration-150"
                            onClick={() => {
                              if ((cartItem.qty || 1) <= 1) {
                                dispatch(removeItem(product.id));
                              } else {
                                dispatch(updateItemQty({ id: product.id, qty: (cartItem.qty || 1) - 1 }));
                              }
                            }}
                            aria-label="Decrease quantity"
                          >
                            <FaMinus />
                          </button>
                          <span className="px-2 text-base font-semibold text-white">{cartItem.qty || 1}</span>
                          <button
                            className="w-7 h-7 flex items-center justify-center bg-white text-gray-700 border border-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-full font-bold text-base shadow transition duration-150"
                            onClick={() => dispatch(updateItemQty({ id: product.id, qty: (cartItem.qty || 1) + 1 }))}
                            disabled={cartItem.qty >= product.stock}
                            aria-label="Increase quantity"
                          >
                            <FaPlus />
                          </button>
                          <button
                            className="w-7 h-7 flex items-center justify-center bg-red-600 hover:bg-red-500 text-white rounded-full font-bold text-base shadow transition duration-150 ml-2"
                            onClick={() => dispatch(removeItem(product.id))}
                            title="Remove from cart"
                            aria-label="Remove from cart"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            className="w-7 h-7 flex items-center justify-center bg-white text-gray-700 border border-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-full font-bold text-base shadow transition duration-150"
                            onClick={addToCart}
                            disabled={cartLoading || product.stock < 1}
                            aria-label="Add to cart"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <button
                        onClick={addToCart}
                        disabled={cartLoading || product.stock < 1}
                        className="flex-1 bg-white text-slate-900 hover:bg-slate-200 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group disabled:opacity-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      >
                        {cartLoading ? (
                          <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <FaShoppingCart className="group-hover:scale-110 transition-transform text-blue-600" />
                            Add to Cart
                          </>
                        )}
                      </button>
                      <button
                        onClick={toggleWishlist}
                        disabled={wishlistLoading}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 transition-all shadow-lg hover:-translate-y-0.5 font-bold py-4 ${isWishlisted
                          ? 'border-red-500 bg-red-500 text-white'
                          : 'border-white/10 bg-slate-800/40 text-slate-300 hover:text-white hover:border-white/30'
                          }`}
                      >
                        {wishlistLoading ? (
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <FaHeart className={`text-lg ${isWishlisted ? "animate-pop" : ""}`} />
                            <span>{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCompareClick}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 transition-all shadow-lg hover:-translate-y-0.5 font-bold py-4 ${isInCompare(product.id)
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-white/10 bg-slate-800/40 text-slate-300 hover:text-white hover:border-white/30'
                          }`}
                        title="Compare"
                      >
                        <FaBalanceScale className="text-lg" />
                        <span>{isInCompare(product.id) ? 'Added' : 'Compare'}</span>
                      </button>
                    </div>

                    {product.stock > 0 && (
                      <button
                        onClick={buyNow}
                        disabled={buyNowLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        {buyNowLoading ? 'Processing...' : 'Buy Now'}
                        <FaBolt className="text-yellow-300" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Seller & Trust */}
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-white/5 mt-8 shadow-lg">
                {product.sellerName && (
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                    <span className="text-slate-400 text-sm uppercase tracking-wide font-semibold">Sold by</span>
                    <Link to="#" className="flex items-center gap-2 text-white font-bold hover:text-blue-400 transition-colors">
                      <span className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm border border-indigo-500/30">
                        {product.sellerName.charAt(0)}
                      </span>
                      {product.sellerName}
                      {product.sellerVerified && <FaShieldAlt className="text-green-400" />}
                    </Link>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <FaTruck className="text-lg" />
                    </div>
                    <div>
                      <span className="block text-white font-bold text-sm">Free Delivery</span>
                      <span className="text-xs text-slate-500">Fast shipping</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <FaShieldAlt className="text-lg" />
                    </div>
                    <div>
                      <span className="block text-white font-bold text-sm">2 Year Warranty</span>
                      <span className="text-xs text-slate-500">Official support</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share Links */}
              <div className="flex items-center gap-6 justify-center text-slate-500 text-sm mt-8 border-t border-white/5 pt-6">
                <span className="uppercase tracking-wider font-semibold text-xs">Share Product:</span>
                <div className="flex gap-4">
                  <button onClick={() => shareProduct('facebook')} className="hover:text-blue-500 transition-colors hover:scale-110"><FaFacebook className="text-xl" /></button>
                  <button onClick={() => shareProduct('twitter')} className="hover:text-sky-400 transition-colors hover:scale-110"><FaTwitter className="text-xl" /></button>
                  <button onClick={() => shareProduct('whatsapp')} className="hover:text-green-500 transition-colors hover:scale-110"><FaWhatsapp className="text-xl" /></button>
                  <button onClick={() => shareProduct('copy')} className="hover:text-white transition-colors hover:scale-110"><FaLink className="text-xl" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-16 border-t border-white/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">You may also like</h2>
                <p className="text-slate-400">Similar products picked just for you</p>
              </div>
              <Link to={`/products?category=${product.categoryId}`} className="group flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold transition-colors">
                View All <FaChevronRight className="text-sm group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <div key={p.id} className="h-full">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

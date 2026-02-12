import React, { useEffect, useState } from 'react'
import Modal from '../../components/common/Modal'
import { useSelector, useDispatch } from 'react-redux'
import { removeItem, updateItemQty, loadUserCart, addItem, clearCart } from '../../redux/slices/cartSlice'
import { Link, useNavigate } from 'react-router-dom'
import { FaTrash, FaMinus, FaPlus, FaShoppingBag, FaArrowLeft, FaShieldAlt, FaTruck, FaUndo, FaBookmark, FaRegBookmark, FaPercent } from 'react-icons/fa'
import { getSavedItems, saveForLater, removeSavedItem } from '../../services/savedItemsService'
import { getCart as getBackendCart, updateCartItem, removeCartItem, clearCart as clearBackendCart } from '../../services/cartService'
import { toast } from '../../utils/toast'

export default function Cart() {
  const items = useSelector(s => s.cart.items)
  const user = useSelector(s => s.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [savedItems, setSavedItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [backendCartMap, setBackendCartMap] = useState({}) // Map productId to cartItemId
  const subtotal = items.reduce((s, i) => s + (i.price * (i.qty || 1)), 0)
  const shipping = subtotal > 5000 ? 0 : 99
  const tax = subtotal * 0.18
  const total = subtotal + shipping + tax
  const isLoggedIn = !!localStorage.getItem('gamingstore_token')

  useEffect(() => {
    dispatch(loadUserCart())
    setSavedItems(getSavedItems())

    // Load backend cart to get cartItemIds for logged in users
    if (isLoggedIn) {
      loadBackendCart()
    }
  }, [user, dispatch])

  async function loadBackendCart() {
    try {
      const backendItems = await getBackendCart()
      const map = {}
      backendItems.forEach(item => {
        map[item.id] = item.cartItemId
      })
      setBackendCartMap(map)
    } catch (e) {
      console.error('Failed to load backend cart:', e)
    }
  }

  async function handleUpdateQty(id, newQty) {
    if (newQty < 1) return
    dispatch(updateItemQty({ id, qty: newQty }))

    // Sync with backend if logged in
    if (isLoggedIn && backendCartMap[id]) {
      try {
        await updateCartItem(backendCartMap[id], newQty)
      } catch (e) {
        console.error('Failed to sync qty with backend:', e)
      }
    }
  }

  async function handleRemoveItem(id) {
    dispatch(removeItem(id))
    toast.success('Item removed from cart')

    // Sync with backend if logged in
    if (isLoggedIn && backendCartMap[id]) {
      try {
        await removeCartItem(backendCartMap[id])
        const newMap = { ...backendCartMap }
        delete newMap[id]
        setBackendCartMap(newMap)
      } catch (e) {
        console.error('Failed to sync remove with backend:', e)
      }
    }
  }

  const [showClearModal, setShowClearModal] = useState(false)

  async function handleClearCartConfirmed() {
    dispatch(clearCart())
    toast.success('Cart cleared')
    setShowClearModal(false)
    // Sync with backend if logged in
    if (isLoggedIn) {
      try {
        await clearBackendCart()
        setBackendCartMap({})
      } catch (e) {
        console.error('Failed to sync clear with backend:', e)
      }
    }
  }

  function handleSaveForLater(item) {
    const result = saveForLater(item)
    if (result.success) {
      handleRemoveItem(item.id)
      setSavedItems(getSavedItems())
      toast.success('Saved for later')
    } else {
      toast.info(result.error)
    }
  }

  function handleMoveToCart(item) {
    dispatch(addItem({ ...item, qty: 1 }))
    removeSavedItem(item.id)
    setSavedItems(getSavedItems())
    toast.success('Moved to cart')
  }

  function handleRemoveSaved(itemId) {
    removeSavedItem(itemId)
    setSavedItems(getSavedItems())
    toast.success('Removed from saved items')
  }

  function handleCheckout() {
    if (!isLoggedIn) {
      toast.info('Please login to checkout')
      navigate('/login')
      return
    }
    navigate('/checkout')
  }

  return (
    <div className="animate-fade-in">

      {/* Hero Banner */}
      <div className="bg-transparent border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <FaShoppingBag className="text-xl" />
                </div>
                Shopping Cart
              </h1>
              <p className="text-gray-300 mt-2 text-lg">{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition backdrop-blur-sm border border-white/10"
            >
              <FaArrowLeft />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-700">
              <FaShoppingBag className="text-5xl text-gray-600" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Your cart is empty</h2>
            <p className="text-gray-400 mb-8 text-lg max-w-md mx-auto">Looks like you haven't added any items to your cart yet. Start shopping to fill it up!</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-10 py-4 rounded-xl font-bold text-lg transition transform hover:scale-105 shadow-lg shadow-blue-500/25"
            >
              <FaShoppingBag />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row gap-8">
            {/* Cart Items - Full Width */}
            <div className="flex-1 space-y-4">
              {/* Cart Table Header */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-secondary rounded-xl text-muted text-sm font-medium">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {items.map(item => (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-2xl p-4 lg:p-6 hover:border-purple-500/30 transition group shadow-sm"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Product Info */}
                    <div className="col-span-12 lg:col-span-6">
                      <div className="flex gap-4">
                        <Link to={`/products/${item.id}`} className="flex-shrink-0">
                          <div className="w-24 h-24 lg:w-28 lg:h-28 bg-input rounded-xl overflow-hidden border border-border">
                            <img
                              src={item.image || 'https://placehold.co/150x150/1f2937/9ca3af?text=Product'}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                              onError={(e) => { e.target.src = 'https://placehold.co/150x150/1f2937/9ca3af?text=Product' }}
                            />
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/products/${item.id}`} className="text-lg font-bold text-text hover:text-purple-400 transition line-clamp-2">
                            {item.name}
                          </Link>
                          <p className="text-muted text-sm mt-1">SKU: #{item.id}</p>
                          {item.brand && <p className="text-muted text-sm">Brand: {item.brand}</p>}

                          {/* Mobile Actions */}
                          <div className="flex items-center gap-3 mt-3 lg:hidden">
                            <button
                              onClick={() => handleSaveForLater(item)}
                              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                            >
                              <FaRegBookmark /> Save
                            </button>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                            >
                              <FaTrash /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-4 lg:col-span-2 text-center">
                      <span className="lg:hidden text-muted text-xs block mb-1">Price</span>
                      <span className="text-text font-semibold">₹{item.price.toLocaleString('en-IN')}</span>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-4 lg:col-span-2 flex justify-center">
                      <div className="flex items-center bg-input rounded-xl border border-border">
                        <button
                          onClick={() => handleUpdateQty(item.id, (item.qty || 1) - 1)}
                          className="p-3 text-muted hover:text-text hover:bg-secondary rounded-l-xl transition disabled:opacity-50"
                          disabled={(item.qty || 1) <= 1}
                        >
                          <FaMinus className="text-xs" />
                        </button>
                        <span className="px-4 py-2 text-text font-bold min-w-[50px] text-center bg-card">
                          {item.qty || 1}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(item.id, (item.qty || 1) + 1)}
                          className="p-3 text-muted hover:text-text hover:bg-secondary rounded-r-xl transition"
                        >
                          <FaPlus className="text-xs" />
                        </button>
                      </div>
                    </div>

                    {/* Total & Actions */}
                    <div className="col-span-4 lg:col-span-2 text-right">
                      <span className="lg:hidden text-muted text-xs block mb-1">Total</span>
                      <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        ₹{(item.price * (item.qty || 1)).toLocaleString('en-IN')}
                      </div>
                      {/* Desktop Actions */}
                      <div className="hidden lg:flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => handleSaveForLater(item)}
                          className="p-2 text-muted hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition"
                          title="Save for later"
                        >
                          <FaRegBookmark />
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="Remove"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Saved for Later Section */}
              {savedItems.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
                    <FaBookmark className="text-purple-400" />
                    Saved for Later ({savedItems.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {savedItems.map(item => (
                      <div key={item.id} className="bg-card border border-border rounded-xl p-4 hover:border-purple-500/30 transition shadow-sm">
                        <div className="flex gap-4">
                          <Link to={`/products/${item.id}`}>
                            <img
                              src={item.image || 'https://placehold.co/80x80/1f2937/9ca3af?text=Product'}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link to={`/products/${item.id}`} className="text-text font-medium hover:text-purple-400 line-clamp-2 text-sm">
                              {item.name}
                            </Link>
                            <p className="text-purple-400 font-bold mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleMoveToCart(item)}
                                className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg transition"
                              >
                                Add to Cart
                              </button>
                              <button
                                onClick={() => handleRemoveSaved(item.id)}
                                className="text-xs text-muted hover:text-red-400 p-1.5"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="xl:w-[420px] flex-shrink-0">
              <div className="bg-card border border-border rounded-2xl p-6 xl:sticky xl:top-24 shadow-sm">
                <h2 className="text-2xl font-bold text-text mb-6">Order Summary</h2>



                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-muted">
                    <span>Subtotal ({items.reduce((sum, i) => sum + (i.qty || 1), 0)} items)</span>
                    <span className="text-text font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-500 font-semibold' : 'text-text'}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>GST (18%)</span>
                    <span className="text-text">₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>

                  {shipping > 0 && (
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                      <p className="text-purple-400 text-sm flex items-center gap-2">
                        <FaPercent className="text-purple-500" />
                        Add ₹{(5000 - subtotal).toLocaleString('en-IN')} more for <span className="font-bold text-green-500">FREE shipping!</span>
                      </p>
                      <div className="w-full bg-secondary rounded-full h-2 mt-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((subtotal / 5000) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-text">Total</span>
                      <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-muted text-xs mt-1 text-right">Including all taxes</p>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-center py-4 rounded-xl font-bold text-lg transition transform hover:scale-[1.02] shadow-lg shadow-blue-500/25"
                >
                  Proceed to Checkout
                </button>

                {/* Clear Cart Button */}
                {items.length > 1 && (
                  <>
                    <button
                      onClick={() => setShowClearModal(true)}
                      className="w-full mt-3 py-3 text-gray-400 hover:text-red-400 text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-500/10 rounded-xl transition"
                    >
                      <FaTrash className="text-xs" />
                      Clear Cart
                    </button>
                    <Modal open={showClearModal} onClose={() => setShowClearModal(false)}>
                      <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">Clear Cart?</h2>
                        <p className="text-gray-400 mb-6">Are you sure you want to remove all items from your cart? This action cannot be undone.</p>
                        <div className="flex justify-center gap-4">
                          <button
                            className="bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-3 rounded-xl transition"
                            onClick={handleClearCartConfirmed}
                          >
                            Yes, Clear Cart
                          </button>
                          <button
                            className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold px-6 py-3 rounded-xl transition"
                            onClick={() => setShowClearModal(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </Modal>
                  </>
                )}

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
                        <FaShieldAlt className="text-green-500" />
                      </div>
                      <span className="text-muted text-xs">Secure Payment</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
                        <FaTruck className="text-blue-500" />
                      </div>
                      <span className="text-muted text-xs">Fast Delivery</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center mb-2">
                        <FaUndo className="text-purple-500" />
                      </div>
                      <span className="text-muted text-xs">Easy Returns</span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-muted text-xs text-center mb-3">We Accept</p>
                  <div className="flex justify-center gap-3">
                    <div className="w-12 h-8 bg-white rounded flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xs">VISA</span>
                    </div>
                    <div className="w-12 h-8 bg-white rounded flex items-center justify-center">
                      <span className="text-red-500 font-bold text-xs">MC</span>
                    </div>
                    <div className="w-12 h-8 bg-white rounded flex items-center justify-center">
                      <span className="text-green-600 font-bold text-xs">UPI</span>
                    </div>
                    <div className="w-12 h-8 bg-white rounded flex items-center justify-center">
                      <span className="text-blue-500 font-bold text-xs">PayPal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

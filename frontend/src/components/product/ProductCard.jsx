import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, updateItemQty, removeItem } from '../../redux/slices/cartSlice';
import { toast } from '../../utils/toast';
import { addToWishlist, removeFromWishlist } from '../../services/wishlistService';
import { addToCart as addToCartApi } from '../../services/cartService';
import { useCompare } from '../../context/CompareContext';
import { FaBalanceScale, FaHeart, FaShoppingCart, FaCheckCircle, FaStar, FaStore, FaMinus, FaPlus, FaTrash } from 'react-icons/fa';

export default function ProductCard({ product, onWishlistChange }) {
  const dispatch = useDispatch()
  const cartItems = useSelector(s => s.cart.items)
  const navigate = useNavigate()
  const { addToCompare, isInCompare, removeFromCompare } = useCompare()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [cartLoading, setCartLoading] = useState(false)

  async function add(e) {
    e.preventDefault()
    e.stopPropagation()

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

      // Sync with backend if logged in
      const token = localStorage.getItem('gamingstore_token')
      if (token) {
        await addToCartApi(product.id, 1)
      }

      toast.success(`${product.name} added to cart!`)
    } catch (e) {
      // Still show success since we added to local cart
      toast.success(`${product.name} added to cart!`)
    } finally {
      setCartLoading(false)
    }
  }

  async function toggleWishlist(e) {
    e.preventDefault()
    e.stopPropagation()

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
          onWishlistChange?.()
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

  // Show deal badge only if isDeal is true and dealPercent > 0
  const discount = product.isDeal && product.dealPercent > 0 ? product.dealPercent : 0

  const outOfStock = !product.stock || product.stock < 1

  // Find cart item for this product
  const cartItem = cartItems.find(i => i.id === product.id)

  return (
    <div className="group relative bg-slate-800/40 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col" style={{ transform: 'scale(1.05)' }}>
      <Link to={`/products/${product.id}`} className="relative h-56 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 flex items-center justify-center overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Deal badge: only show for products with isDeal and dealPercent > 0 */}
        {product.isDeal && product.dealPercent > 0 && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg z-10">
            -{product.dealPercent}%
          </span>
        )}

        {/* Out of Stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-20">
            <span className="bg-red-500/20 text-red-500 border border-red-500/50 px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-sm backdrop-blur-md">
              Sold Out
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <button
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            className={`w-9 h-9 flex items-center justify-center rounded-xl backdrop-blur-md border border-white/10 shadow-lg transition-all ${isWishlisted
              ? 'bg-red-500 text-white border-red-500'
              : 'bg-black/40 text-white hover:bg-white hover:text-red-500'
              }`}
            title="Add to Wishlist"
          >
            {wishlistLoading ? (
              <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
            ) : (
              <FaHeart className={isWishlisted ? 'text-white' : ''} />
            )}
          </button>

          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (isInCompare(product.id)) {
                removeFromCompare(product.id)
              } else {
                addToCompare(product)
              }
            }}
            className={`w-9 h-9 flex items-center justify-center rounded-xl backdrop-blur-md border border-white/10 shadow-lg transition-all ${isInCompare(product.id)
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-black/40 text-white hover:bg-white hover:text-blue-500'
              }`}
            title="Compare"
          >
            <FaBalanceScale />
          </button>
        </div>

        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain transform group-hover:scale-110 transition-transform duration-500 ease-in-out drop-shadow-2xl"
          onError={(e) => { e.target.src = 'https://placehold.co/400x400/1e293b/475569?text=No+Image' }}
        />
      </Link>

      <div className="p-5 flex-1 flex flex-col border-t border-white/5 bg-slate-800/20 group-hover:bg-slate-800/40 transition-colors">
        {/* Brand & Stats */}
        <div className="flex items-center justify-between mb-2">
          {product.brand && (
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{product.brand}</span>
          )}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 bg-yellow-500/10 px-1.5 py-0.5 rounded text-xs text-yellow-500 font-medium">
              <FaStar className="text-[10px]" />
              {product.rating}
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="font-semibold text-slate-200 line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors h-11">
          <Link to={`/products/${product.id}`}>
            {product.name}
          </Link>
        </h3>

        {/* Specs/Features (Optional - if short description exists) */}
        {product.short && (
          <p className="text-sm text-slate-500 line-clamp-1 mb-4">{product.short}</p>
        )}

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Price & Cart */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <div>
            <div className="text-xl font-bold text-white flex items-baseline gap-2">
              ₹{product.price?.toLocaleString('en-IN')}
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-slate-500 line-through font-normal">
                  ₹{product.originalPrice?.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {product.sellerName && (
              <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                <FaStore className="text-slate-600" /> {product.sellerName}
              </div>
            )}
          </div>

          {cartItem && !outOfStock ? (
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
              
            </div>
          ) : (
            <button
              onClick={add}
              disabled={cartLoading || outOfStock}
              className={`
                h-10 px-4 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-lg
                ${outOfStock
                  ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                  : 'bg-white text-slate-900 hover:bg-slate-200 hover:scale-105 active:scale-95'
                }
              `}
            >
              {cartLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FaShoppingCart className={outOfStock ? '' : 'text-blue-600 transition-colors'} />
                  <span className="hidden sm:inline">Add</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

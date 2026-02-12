import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getWishlist, removeFromWishlist } from "../../services/wishlistService";
import { useDispatch } from "react-redux";
import { addItem } from "../../redux/slices/cartSlice";
import { toast } from "../../utils/toast";
import { FaHeart, FaShoppingCart, FaBolt, FaTrash, FaArrowLeft, FaStar, FaRegHeart, FaPlus, FaEye } from "react-icons/fa";

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('gamingstore_token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadWishlist();
  }, [navigate]);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const data = await getWishlist();
      console.log('Wishlist data:', data);
      setItems(data || []);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      const result = await removeFromWishlist(productId);
      if (result.success) {
        setItems(items.filter(item => {
          const itemProductId = item.productId || item.product?.id || item.Product?.id;
          return itemProductId !== productId;
        }));
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleAddToCart = (product) => {
    dispatch(addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      image: product.image
    }));
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = (product) => {
    dispatch(addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      image: product.image
    }));
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">

      {/* Hero Banner */}
      <div className="bg-transparent border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <FaHeart className="text-xl" />
                </div>
                My Wishlist
              </h1>
              <p className="text-gray-400 mt-2 text-lg">
                {items.length} {items.length === 1 ? 'item' : 'items'} saved for later
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              {items.length > 0 && (
                <div className="flex bg-gray-800/50 rounded-lg p-1 border border-gray-700">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
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
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-700">
              <FaRegHeart className="text-5xl text-gray-600" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Your wishlist is empty</h2>
            <p className="text-gray-400 mb-8 text-lg max-w-md mx-auto">Save items you love by clicking the heart icon on any product page</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-10 py-4 rounded-xl font-bold text-lg transition transform hover:scale-105 shadow-lg shadow-blue-600/25"
            >
              <FaPlus />
              Discover Products
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {items.map(item => {
              const product = item.product || item.Product || item;
              if (!product || !product.id) return null;

              const discount = product.originalPrice && product.originalPrice > product.price
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0;

              return (
                <div key={item.id || product.id} className="bg-gray-800/30 border border-gray-700/50 rounded-2xl overflow-hidden group hover:border-pink-500/50 transition-all hover:shadow-lg hover:shadow-pink-500/10">
                  {/* Image */}
                  <div className="relative aspect-square">
                    <Link to={`/products/${product.id}`}>
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
                        <img
                          src={product.image || 'https://placehold.co/300x300/1f2937/9ca3af?text=No+Image'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => { e.target.src = 'https://placehold.co/300x300/1f2937/9ca3af?text=No+Image' }}
                        />
                      </div>
                    </Link>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {discount > 0 && (
                        <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                          -{discount}%
                        </span>
                      )}
                      {product.stock === 0 && (
                        <span className="bg-gray-900/90 text-red-400 text-xs px-3 py-1 rounded-full font-medium">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <button
                        onClick={() => handleRemove(product.id)}
                        className="p-2.5 bg-gray-900/90 backdrop-blur-sm rounded-full hover:bg-red-500 text-gray-300 hover:text-white transition-all shadow-lg"
                        title="Remove from wishlist"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/products/${product.id}`}
                        className="p-2.5 bg-gray-900/90 backdrop-blur-sm rounded-full hover:bg-purple-500 text-gray-300 hover:text-white transition-all shadow-lg"
                        title="Quick view"
                      >
                        <FaEye className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* In Stock Badge */}
                    {product.stock > 0 && product.stock <= 5 && (
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-orange-500/90 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Only {product.stock} left
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {product.brand && (
                      <span className="text-xs text-pink-400 font-semibold uppercase tracking-wide">{product.brand}</span>
                    )}
                    <Link to={`/products/${product.id}`}>
                      <h3 className="font-bold text-white hover:text-pink-400 transition-colors line-clamp-2 mt-1 text-lg">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-sm font-semibold">
                          <FaStar className="w-3 h-3" />
                          {product.rating.toFixed(1)}
                        </div>
                        <span className="text-xs text-gray-500">({product.reviewCount || 0} reviews)</span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        ₹{product.price?.toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="flex-1 bg-white text-slate-900 hover:bg-slate-200 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      >
                        <FaShoppingCart className="text-blue-600" />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleBuyNow(product)}
                        disabled={product.stock === 0}
                        className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40"
                        title="Buy Now"
                      >
                        <FaBolt className="w-4 h-4 text-yellow-300" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {items.map(item => {
              const product = item.product || item.Product || item;
              if (!product || !product.id) return null;

              const discount = product.originalPrice && product.originalPrice > product.price
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0;

              return (
                <div key={item.id || product.id} className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-4 lg:p-6 hover:border-pink-500/30 transition group">
                  <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
                    {/* Image */}
                    <Link to={`/products/${product.id}`} className="flex-shrink-0">
                      <div className="w-full sm:w-40 lg:w-48 aspect-square bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl overflow-hidden relative">
                        <img
                          src={product.image || 'https://placehold.co/200x200/1f2937/9ca3af?text=No+Image'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => { e.target.src = 'https://placehold.co/200x200/1f2937/9ca3af?text=No+Image' }}
                        />
                        {discount > 0 && (
                          <span className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            -{discount}%
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1">
                          {product.brand && (
                            <span className="text-xs text-pink-400 font-semibold uppercase tracking-wide">{product.brand}</span>
                          )}
                          <Link to={`/products/${product.id}`}>
                            <h3 className="text-xl font-bold text-white hover:text-pink-400 transition mt-1 line-clamp-2">
                              {product.name}
                            </h3>
                          </Link>

                          {product.rating && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-sm font-semibold">
                                <FaStar className="w-3 h-3" />
                                {product.rating.toFixed(1)}
                              </div>
                              <span className="text-xs text-gray-500">({product.reviewCount || 0} reviews)</span>
                            </div>
                          )}

                          <p className={`text-sm mt-2 ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                          </p>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex flex-col items-start lg:items-end gap-4">
                          <div className="text-right">
                            <div className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                              ₹{product.price?.toLocaleString('en-IN')}
                            </div>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-sm text-gray-500 line-through">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock === 0}
                              className="bg-white text-slate-900 hover:bg-slate-200 px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                              <FaShoppingCart className="text-blue-600 w-4 h-4" />
                              Add to Cart
                            </button>
                            <button
                              onClick={() => handleBuyNow(product)}
                              disabled={product.stock === 0}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40"
                            >
                              <FaBolt className="w-4 h-4 text-yellow-300" />
                              Buy Now
                            </button>
                            <button
                              onClick={() => handleRemove(product.id)}
                              className="p-2.5 bg-gray-700 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl transition"
                              title="Remove"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

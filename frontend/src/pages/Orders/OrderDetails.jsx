import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getOrderById, cancelOrder } from '../../services/orderService'
import { toast } from '../../utils/toast'
import { FaArrowLeft, FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaClock, FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa'

const statusConfig = {
  pending: { icon: FaClock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Pending' },
  processing: { icon: FaBox, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Processing' },
  shipped: { icon: FaTruck, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Shipped' },
  delivered: { icon: FaCheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Delivered' },
  cancelled: { icon: FaTimesCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Cancelled' }
}

export default function OrderDetails() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('gamingstore_token')
    if (!token) {
      navigate('/login')
      return
    }
    loadOrder()
  }, [orderId, navigate])

  async function loadOrder() {
    setLoading(true)
    try {
      const data = await getOrderById(orderId)
      setOrder(data)
    } catch (error) {
      console.error('Failed to load order:', error)
      toast.error('Failed to load order details')
    }
    setLoading(false)
  }

  async function handleCancelOrder() {
    setShowCancelModal(false)
    setCancelling(true)
    try {
      const result = await cancelOrder(orderId)
      if (result.success) {
        toast.success('Order cancelled successfully')
        loadOrder()
      } else {
        toast.error(result.error || 'Failed to cancel order')
      }
    } catch (error) {
      toast.error('Failed to cancel order')
    }
    setCancelling(false)
  }

  function parseAddress(address) {
    if (!address) return null
    if (typeof address === 'string') {
      try {
        return JSON.parse(address)
      } catch {
        return { line1: address }
      }
    }
    return address
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-12">
            <FaBox className="text-6xl text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Order Not Found</h2>
            <p className="text-gray-400 mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
            <Link to="/orders" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition">
              <FaArrowLeft /> View All Orders
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const status = statusConfig[order.status] || statusConfig.pending
  const StatusIcon = status.icon
  const addr = parseAddress(order.address)
  const orderItems = order.OrderItems || []

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/orders" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition mb-2">
              <FaArrowLeft /> Back to Orders
            </Link>
            <h1 className="text-3xl font-bold text-white">Order #{order.id}</h1>
            <p className="text-gray-400 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${status.bg}`}>
            <StatusIcon className={status.color} />
            <span className={`font-semibold ${status.color}`}>{status.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaBox className="text-purple-400" /> Order Items ({orderItems.length})
              </h2>
              <div className="space-y-4">
                {orderItems.map((item, idx) => {
                  const product = item.Product || {}
                  const itemImage = item.image || product.image
                  const itemName = item.name || product.name || `Product #${item.productId}`
                  return (
                    <div key={idx} className="flex items-center gap-4 pb-4 border-b border-gray-700 last:border-0 last:pb-0">
                      <div className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={itemImage || 'https://placehold.co/80x80/1f2937/9ca3af?text=Product'}
                          alt={itemName}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://placehold.co/80x80/1f2937/9ca3af?text=Product' }}
                        />
                      </div>
                      <div className="flex-1">
                        <Link
                          to={`/products/${item.productId}`}
                          className="font-semibold text-white hover:text-purple-400 transition"
                        >
                          {itemName}
                        </Link>
                        <p className="text-gray-400 text-sm">Qty: {item.qty}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                          ₹{(item.price * item.qty).toFixed(2)}
                        </p>
                        <p className="text-gray-500 text-sm">₹{item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Shipping Address */}
            {addr && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-pink-400" /> Shipping Address
                </h2>
                <div className="text-gray-300">
                  <p className="font-medium">{addr.line1}</p>
                  {addr.line2 && <p>{addr.line2}</p>}
                  <p>{addr.city}, {addr.state} {addr.zip}</p>
                  <p>{addr.country}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-white">₹{order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span className="text-green-400">Free</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>GST (18%)</span>
                  <span className="text-white">₹{(order.total * 0.18).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-white">Total</span>
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                      ₹{(order.total * 1.18).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {order.status === 'pending' && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={cancelling}
                  className="w-full mt-6 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                >
                  {cancelling ? (
                    <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FaTimesCircle />
                  )}
                  Cancel Order
                </button>
              )}

              <Link
                to="/products"
                className="block w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-center py-3 rounded-xl font-semibold transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCancelModal(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            {/* Warning Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="text-3xl text-red-500" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-white text-center mb-2">
              Cancel Order?
            </h3>

            {/* Description */}
            <p className="text-gray-400 text-center mb-6">
              Are you sure you want to cancel <span className="text-white font-semibold">Order #{order?.id}</span>? This action cannot be undone.
            </p>

            {/* Order Summary */}
            <div className="bg-gray-700/30 rounded-xl p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Items</span>
                <span className="text-white">{orderItems.length} product(s)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Amount</span>
                <span className="text-white font-semibold">₹{(order?.total * 1.18).toFixed(2)}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                <FaTimesCircle />
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

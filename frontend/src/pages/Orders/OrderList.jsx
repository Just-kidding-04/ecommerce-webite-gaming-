import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getOrders } from "../../services/orderService";
import { FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaClock, FaCog, FaArrowRight, FaShoppingBag } from "react-icons/fa";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('gamingstore_token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  const statusConfig = {
    pending: { icon: FaClock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    processing: { icon: FaCog, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    shipped: { icon: FaTruck, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    delivered: { icon: FaCheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    cancelled: { icon: FaTimesCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' }
  };

  const getStatusConfig = (status) => statusConfig[status?.toLowerCase()] || statusConfig.pending;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <FaBox className="text-purple-500" />
              My Orders
            </h1>
            <p className="text-gray-400 mt-1">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} total
            </p>
          </div>
          <Link
            to="/products"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-2 rounded-xl font-medium transition shadow-lg shadow-blue-500/20"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full font-medium transition whitespace-nowrap ${filter === status
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <span className="ml-1 text-xs opacity-70">
                  ({orders.filter(o => o.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-12 text-center">
            <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBox className="text-4xl text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h2>
            <p className="text-gray-400 mb-6">
              {filter === 'all'
                ? "You haven't placed any orders yet"
                : `You don't have any ${filter} orders`}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-semibold transition shadow-lg shadow-blue-500/25 hover:scale-105 transform"
            >
              <FaShoppingBag />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const config = getStatusConfig(order.status);
              const StatusIcon = config.icon;

              return (
                <div key={order.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden hover:border-purple-500/50 transition">
                  {/* Order Header */}
                  <div className="bg-gray-900/50 px-6 py-4 border-b border-gray-700 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-xs text-gray-500">Order ID</span>
                        <p className="font-bold text-white">#{order.id}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Date</span>
                        <p className="font-medium text-gray-300">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Items</span>
                        <p className="font-medium text-gray-300">{order.OrderItems?.length || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${config.bg} ${config.border} border`}>
                        <StatusIcon className={config.color} />
                        <span className={config.color}>{order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}</span>
                      </span>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">Total</span>
                        <p className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                          ₹{parseFloat(order.total).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    {order.OrderItems && order.OrderItems.length > 0 ? (
                      <div className="space-y-4">
                        {order.OrderItems.slice(0, 3).map((item, idx) => {
                          const itemImage = item.image || item.Product?.image
                          const itemName = item.name || item.Product?.name || `Product #${item.productId}`
                          return (
                            <div key={idx} className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                                {itemImage ? (
                                  <img
                                    src={itemImage}
                                    alt={itemName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = 'https://placehold.co/64x64/1f2937/9ca3af?text=Product' }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    <FaBox />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <Link
                                  to={`/products/${item.productId || item.Product?.id}`}
                                  className="font-medium text-white hover:text-purple-400 transition line-clamp-1"
                                >
                                  {itemName}
                                </Link>
                                <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-white">
                                  ₹{(parseFloat(item.price) * item.qty).toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500">₹{parseFloat(item.price).toFixed(2)} each</p>
                              </div>
                            </div>
                          )
                        })}
                        {order.OrderItems.length > 3 && (
                          <p className="text-sm text-gray-500 text-center pt-2 border-t border-gray-700">
                            +{order.OrderItems.length - 3} more item(s)
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center">No items found</p>
                    )}

                    {/* View Details Button */}
                    <div className="mt-6 flex justify-end">
                      <Link
                        to={`/orders/${order.id}`}
                        className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition"
                      >
                        View Order Details
                        <FaArrowRight className="text-sm" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Summary */}
        {orders.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <span className="text-3xl font-bold text-white">{orders.length}</span>
                <p className="text-sm text-gray-400">Total Orders</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  ₹{orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0).toFixed(2)}
                </span>
                <p className="text-sm text-gray-400">Total Spent</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <span className="text-3xl font-bold text-green-400">
                  {orders.filter(o => o.status === 'delivered').length}
                </span>
                <p className="text-sm text-gray-400">Delivered</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <span className="text-3xl font-bold text-blue-400">
                  {orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length}
                </span>
                <p className="text-sm text-gray-400">In Progress</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;

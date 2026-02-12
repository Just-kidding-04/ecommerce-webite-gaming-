import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { clearUser } from '../../redux/slices/authSlice'
import { logout } from '../../services/authService'
import { 
  FaBox, FaShoppingCart, FaRupeeSign, FaChartLine, FaPlus, 
  FaEdit, FaTrash, FaEye, FaTruck, FaClock, FaCheck, FaTimes,
  FaArrowUp, FaArrowDown, FaWarehouse, FaUsers, FaStar,
  FaUser, FaSignOutAlt, FaStore, FaCog, FaHome
} from 'react-icons/fa'
import { toast } from '../../utils/toast'
import axiosInstance from '../../services/axiosInstance'

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStock: 0,
    avgRating: 0
  })
  const [loading, setLoading] = useState(true)
  const [showAccountModal, setShowAccountModal] = useState(false)
  
  const user = useSelector(s => s.auth.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [productsRes, ordersRes, statsRes] = await Promise.all([
        axiosInstance.get('/api/seller/products'),
        axiosInstance.get('/api/seller/orders').catch(() => ({ data: [] })),
        axiosInstance.get('/api/seller/stats').catch(() => ({ data: {} }))
      ])
      
      const productsData = Array.isArray(productsRes.data) ? productsRes.data : []
      setProducts(productsData)
      
      const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : []
      setOrders(ordersData)
      
      const statsData = statsRes.data || {}
      setStats({
        totalProducts: statsData.totalProducts || productsData.length,
        totalOrders: statsData.totalOrders || ordersData.length,
        totalRevenue: statsData.totalRevenue || 0,
        pendingOrders: statsData.pendingOrders || 0,
        lowStock: statsData.lowStock || productsData.filter(p => p.stock < 10).length,
        avgRating: statsData.avgRating || 0
      })
    } catch (error) {
      console.error('Failed to load dashboard:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const handleDeleteProduct = (productId) => {
    setProductToDelete(productId);
    setShowDeleteModal(true);
  };

  const confirmDeleteProduct = async () => {
    try {
      await axiosInstance.delete(`/api/products/${productToDelete}`);
      setProducts(products.filter(p => p.id !== productToDelete));
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error('Failed to delete product');
    }
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  {/* Modal for delete confirmation */}
  <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Delete Product?</h2>
      <p className="text-gray-400 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
      <div className="flex justify-center gap-4">
        <button className="bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-3 rounded-xl transition" onClick={confirmDeleteProduct}>Delete</button>
        <button className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold px-6 py-3 rounded-xl transition" onClick={() => setShowDeleteModal(false)}>Cancel</button>
      </div>
    </div>
  </Modal>

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axiosInstance.put(`/api/orders/${orderId}/status`, { status: newStatus })
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      toast.success('Order status updated')
    } catch (error) {
      toast.error('Failed to update order status')
    }
  }

  const handleLogout = () => {
    logout()
    dispatch(clearUser())
    navigate('/login')
  }

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: FaChartLine },
    { id: 'products', label: 'Products', icon: FaBox },
    { id: 'orders', label: 'Orders', icon: FaShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: FaWarehouse },
  ]

  const StatCard = ({ icon: Icon, label, value, subValue, color, trend }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-purple-500/50 transition">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="text-2xl text-white" />
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? <FaArrowUp /> : <FaArrowDown />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <h3 className="text-3xl font-bold text-white mt-4">{value}</h3>
      <p className="text-gray-400 text-sm">{label}</p>
      {subValue && <p className="text-purple-400 text-xs mt-1">{subValue}</p>}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700 z-40">
        <div className="p-6 border-b border-slate-700">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <FaStore className="text-xl text-white" />
            </div>
            <div>
              <span className="font-bold text-white">Gaming</span>
              <span className="text-emerald-400">Store</span>
              <p className="text-xs text-gray-500">Seller Portal</p>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-white border border-emerald-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <item.icon className="text-lg" />
              {item.label}
            </button>
          ))}
          
          <div className="border-t border-slate-700 my-4"></div>
          
          <Link
            to="/seller/add-product"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-slate-700/50 transition-all"
          >
            <FaPlus className="text-lg" />
            Add Product
          </Link>
          
          <button
            onClick={() => setShowAccountModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-slate-700/50 transition-all"
          >
            <FaUser className="text-lg" />
            My Account
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center font-bold text-white">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user?.name || 'Seller'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <FaHome />
              <span className="text-sm">Store</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <FaSignOutAlt />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">My Account</h2>
              <button 
                onClick={() => setShowAccountModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                  {user?.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{user?.name || 'Seller'}</h3>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full mt-1">
                    <FaStore /> Seller Account
                  </span>
                </div>
              </div>
              
              <div className="bg-slate-700/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Business Name</span>
                  <span className="text-white">{user?.businessName || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Account Status</span>
                  <span className="text-emerald-400">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Products</span>
                  <span className="text-white">{stats.totalProducts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Revenue</span>
                  <span className="text-white">₹{stats.totalRevenue.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <Link
                  to="/seller/profile"
                  onClick={() => setShowAccountModal(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition"
                >
                  <FaCog /> Edit Profile
                </Link>
                <button
                  onClick={() => setShowAccountModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'products' && 'My Products'}
                {activeTab === 'orders' && 'Orders'}
                {activeTab === 'inventory' && 'Inventory Management'}
              </h1>
              <p className="text-gray-400 mt-1">Welcome back, {user?.name?.split(' ')[0] || 'Seller'}!</p>
            </div>
            <Link
              to="/seller/add-product"
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              <FaPlus />
              Add New Product
            </Link>
          </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={FaBox} 
            label="Total Products" 
            value={stats.totalProducts}
            subValue={`${stats.lowStock} low stock`}
            color="bg-gradient-to-r from-emerald-600 to-emerald-500"
            trend={12}
          />
          <StatCard 
            icon={FaShoppingCart} 
            label="Total Orders" 
            value={stats.totalOrders}
            subValue={`${stats.pendingOrders} pending`}
            color="bg-gradient-to-r from-teal-600 to-teal-500"
            trend={8}
          />
          <StatCard 
            icon={FaRupeeSign} 
            label="Total Revenue" 
            value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
            subValue="This month"
            color="bg-gradient-to-r from-cyan-600 to-cyan-500"
            trend={15}
          />
          <StatCard 
            icon={FaStar} 
            label="Avg Rating" 
            value={stats.avgRating}
            subValue="Out of 5 stars"
            color="bg-gradient-to-r from-yellow-600 to-yellow-500"
            trend={3}
          />
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link to="/seller/add-product" className="bg-gray-700/50 hover:bg-gray-600/50 p-4 rounded-xl text-center transition">
                    <FaPlus className="text-2xl text-emerald-400 mx-auto mb-2" />
                    <span className="text-white text-sm">Add Product</span>
                  </Link>
                  <button onClick={() => setActiveTab('inventory')} className="bg-gray-700/50 hover:bg-gray-600/50 p-4 rounded-xl text-center transition">
                    <FaWarehouse className="text-2xl text-teal-400 mx-auto mb-2" />
                    <span className="text-white text-sm">Manage Stock</span>
                  </button>
                  <button onClick={() => setActiveTab('orders')} className="bg-gray-700/50 hover:bg-gray-600/50 p-4 rounded-xl text-center transition">
                    <FaTruck className="text-2xl text-cyan-400 mx-auto mb-2" />
                    <span className="text-white text-sm">Ship Orders</span>
                  </button>
                  <button onClick={() => setActiveTab('products')} className="bg-gray-700/50 hover:bg-gray-600/50 p-4 rounded-xl text-center transition">
                    <FaChartLine className="text-2xl text-yellow-400 mx-auto mb-2" />
                    <span className="text-white text-sm">View Products</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Recent Orders</h3>
                {orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id} className="bg-gray-700/30 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Order #{order.id}</p>
                          <p className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-400 font-bold">₹{parseFloat(order.total).toLocaleString('en-IN')}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                            order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                            order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No orders yet</p>
                )}
              </div>

              {/* Low Stock Alert */}
              {stats.lowStock > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <h3 className="text-red-400 font-bold mb-2">⚠️ Low Stock Alert</h3>
                  <p className="text-gray-400 text-sm">{stats.lowStock} products have less than 10 items in stock</p>
                  <button 
                    onClick={() => setActiveTab('inventory')} 
                    className="text-red-400 hover:text-red-300 text-sm mt-2 underline"
                  >
                    View inventory →
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Your Products</h3>
                <Link
                  to="/seller/add-product"
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  <FaPlus /> Add Product
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-700">
                      <th className="pb-3 px-2">Product</th>
                      <th className="pb-3 px-2">Price</th>
                      <th className="pb-3 px-2">Stock</th>
                      <th className="pb-3 px-2">Rating</th>
                      <th className="pb-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 10).map(product => (
                      <tr key={product.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-3">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover bg-gray-700"
                              onError={(e) => e.target.src = 'https://placehold.co/48x48/1f2937/9ca3af?text=Img'}
                            />
                            <div>
                              <p className="text-white font-medium line-clamp-1">{product.name}</p>
                              <p className="text-gray-500 text-xs">{product.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-emerald-400 font-semibold">
                          ₹{product.price?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.stock < 10 ? 'bg-red-500/20 text-red-400' :
                            product.stock < 50 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {product.stock} units
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-1">
                            <FaStar className="text-yellow-400 text-sm" />
                            <span className="text-white">{product.rating || 0}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <Link to={`/products/${product.id}`} className="p-2 hover:bg-gray-600 rounded-lg transition">
                              <FaEye className="text-gray-400" />
                            </Link>
                            <Link to={`/seller/edit-product/${product.id}`} className="p-2 hover:bg-gray-600 rounded-lg transition">
                              <FaEdit className="text-blue-400" />
                            </Link>
                            <button 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 hover:bg-gray-600 rounded-lg transition"
                            >
                              <FaTrash className="text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {products.length > 10 && (
                <p className="text-gray-500 text-center mt-4 text-sm">
                  Showing 10 of {products.length} products
                </p>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Manage Orders</h3>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="bg-gray-700/30 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-white font-bold">Order #{order.id}</p>
                          <p className="text-gray-400 text-sm">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <span className="text-emerald-400 font-bold text-lg">
                            ₹{parseFloat(order.total).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                      
                      {order.OrderItems && (
                        <div className="border-t border-gray-600 pt-3 space-y-2">
                          {order.OrderItems.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-gray-300">{item.Product?.name || `Product #${item.productId}`}</span>
                              <span className="text-gray-400">x{item.qty} - ₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {order.address && (
                        <div className="border-t border-gray-600 pt-3 mt-3">
                          <p className="text-gray-500 text-xs mb-1">Ship to:</p>
                          <p className="text-gray-300 text-sm">
                            {order.address.line1}, {order.address.city}, {order.address.state} - {order.address.zip}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaShoppingCart className="text-5xl text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">No orders yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'inventory' && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Inventory Management</h3>
              <div className="grid gap-4">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <h4 className="text-red-400 font-semibold mb-3">Low Stock Items</h4>
                  <div className="space-y-2">
                    {products.filter(p => p.stock < 10).length > 0 ? (
                      products.filter(p => p.stock < 10).map(product => (
                        <div key={product.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <img src={product.image} alt="" className="w-10 h-10 rounded object-cover" />
                            <span className="text-white">{product.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-red-400 font-bold">{product.stock} left</span>
                            <Link to={`/seller/edit-product/${product.id}`} className="text-emerald-400 hover:text-emerald-300 text-sm">
                              Restock →
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No low stock items! 🎉</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-3">All Products Stock</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {products.slice(0, 12).map(product => (
                      <div key={product.id} className="bg-gray-700/30 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={product.image} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                          <span className="text-white text-sm truncate">{product.name}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                          product.stock < 10 ? 'bg-red-500/20 text-red-400' :
                          product.stock < 50 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {product.stock}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </main>
    </div>
  )
}

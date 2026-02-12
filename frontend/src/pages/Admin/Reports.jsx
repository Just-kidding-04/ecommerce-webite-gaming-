import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import axiosInstance from '../../services/axiosInstance'
import { useSelector, useDispatch } from 'react-redux'
import { clearUser } from '../../redux/slices/authSlice'
import { logout } from '../../services/authService'
import { useNavigate } from 'react-router-dom'

export default function Reports() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
    recentOrders: [],
    topProducts: [],
    categoryStats: []
  })
  const [loading, setLoading] = useState(true)
  
  const user = useSelector(s => s.auth.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    setLoading(true)
    try {
      const [products, orders, users, categories] = await Promise.all([
        axiosInstance.get('/api/products'),
        axiosInstance.get('/api/orders'),
        axiosInstance.get('/api/users'),
        axiosInstance.get('/api/products/categories')
      ])
      
      const revenue = orders.data.reduce((sum, o) => sum + parseFloat(o.total || 0), 0)
      
      // Calculate category stats
      const categoryStats = categories.data.map(cat => ({
        name: cat.name,
        count: products.data.filter(p => p.categoryId === cat.id).length
      }))
      
      // Get top products by orders
      const productOrders = {}
      orders.data.forEach(order => {
        order.OrderItems?.forEach(item => {
          productOrders[item.productId] = (productOrders[item.productId] || 0) + item.qty
        })
      })
      
      const topProducts = Object.entries(productOrders)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, qty]) => {
          const product = products.data.find(p => p.id === parseInt(id))
          return { name: product?.name || 'Unknown', qty }
        })

      setStats({
        products: products.data.length,
        orders: orders.data.length,
        users: users.data.length,
        revenue,
        recentOrders: orders.data.slice(0, 5),
        topProducts,
        categoryStats
      })
    } catch (e) {
      console.error('Failed to load stats:', e)
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    logout()
    dispatch(clearUser())
    navigate('/login')
  }

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/admin/products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { path: '/admin/orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { path: '/admin/users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { path: '/admin/reports', label: 'Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700 z-40">
        <div className="p-6 border-b border-slate-700">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 6H3a1 1 0 00-1 1v10a1 1 0 001 1h18a1 1 0 001-1V7a1 1 0 00-1-1zM5 16v-2h2v2H5zm0-4v-2h2v2H5zm4 4v-2h2v2H9zm0-4v-2h2v2H9zm4 4v-2h2v2h-2zm0-4v-2h2v2h-2zm6 4h-2v-2h2v2zm0-4h-2v-2h2v2z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-white">Gaming</span>
              <span className="text-purple-400">Store</span>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </Link>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
            <p className="text-gray-400 mt-1">Overview of your store performance</p>
          </div>
          <button
            onClick={loadStats}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="text-purple-200 text-sm">Total</span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stats.products}</p>
                <p className="text-purple-200 text-sm">Products</p>
              </div>

              <div className="bg-gradient-to-br from-pink-600 to-pink-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="text-pink-200 text-sm">Total</span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stats.orders}</p>
                <p className="text-pink-200 text-sm">Orders</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <span className="text-cyan-200 text-sm">Total</span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stats.users}</p>
                <p className="text-cyan-200 text-sm">Users</p>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-green-200 text-sm">Total</span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">${stats.revenue.toFixed(2)}</p>
                <p className="text-green-200 text-sm">Revenue</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Category Distribution */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <h2 className="text-xl font-bold text-white mb-6">Products by Category</h2>
                <div className="space-y-4">
                  {stats.categoryStats.map((cat, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">{cat.name}</span>
                        <span className="text-white font-medium">{cat.count} products</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                          style={{ width: `${(cat.count / stats.products) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <h2 className="text-xl font-bold text-white mb-6">Top Selling Products</h2>
                {stats.topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {stats.topProducts.map((product, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{product.name}</p>
                        </div>
                        <span className="text-purple-400 font-semibold">{product.qty} sold</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No sales data yet</p>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Recent Orders</h2>
              {stats.recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-slate-700">
                        <th className="pb-3 text-gray-400 font-medium">Order ID</th>
                        <th className="pb-3 text-gray-400 font-medium">Customer</th>
                        <th className="pb-3 text-gray-400 font-medium">Total</th>
                        <th className="pb-3 text-gray-400 font-medium">Status</th>
                        <th className="pb-3 text-gray-400 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {stats.recentOrders.map(order => (
                        <tr key={order.id}>
                          <td className="py-3 text-white font-medium">#{order.id}</td>
                          <td className="py-3 text-gray-300">{order.User?.name || 'Unknown'}</td>
                          <td className="py-3 text-white font-semibold">₹{order.total}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                              order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No orders yet</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

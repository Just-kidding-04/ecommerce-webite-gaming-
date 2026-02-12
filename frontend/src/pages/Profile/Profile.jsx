import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../services/axiosInstance";
import { getWishlist } from "../../services/wishlistService";
import { getOrders } from "../../services/orderService";
import { toast } from "../../utils/toast";
import { setUser as setAuthUser } from "../../redux/slices/authSlice";
import { FaUser, FaShoppingBag, FaHeart, FaMapMarkerAlt, FaLock, FaBell, FaCreditCard, FaShieldAlt, FaSignOutAlt, FaCamera, FaEdit, FaTrash, FaPlus, FaCheck, FaTimes, FaEye, FaEyeSlash, FaHistory, FaGift, FaHeadset, FaChevronRight, FaMobile, FaEnvelope, FaGoogle, FaFacebook, FaDownload } from "react-icons/fa";

// Backend base URL for serving static files like avatars
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

// Helper to get full image URL
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
};

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const reduxUser = useSelector(state => state.auth.user);
  const [user, setUser] = useState(reduxUser || {
    name: "",
    email: "",
    phone: "",
    avatar: "",
    createdAt: ""
  });

  useEffect(() => {
    if (reduxUser) {
      setUser(prev => ({ ...prev, ...reduxUser }));
      setTempValues({
        name: reduxUser.name || '',
        phone: reduxUser.phone || '',
        email: reduxUser.email || ''
      });
    }
  }, [reduxUser]);

  const [tempValues, setTempValues] = useState({
    name: "",
    phone: "",
    email: ""
  });

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    wishlistCount: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    addressCount: 0
  });

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: false,
    newsletter: true
  });

  const [loginActivity, setLoginActivity] = useState([]);
  // Duplicate showDeleteModal removed; use the existing state from above.
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('gamingstore_token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadProfile();
    loadPreferences();
  }, [navigate]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/users/me");
      setUser(res.data);
      setTempValues({
        name: res.data.name || '',
        phone: res.data.phone || '',
        email: res.data.email || ''
      });

      try {
        const statsRes = await axios.get("/api/users/me/stats");
        setStats(prev => ({ ...prev, ...statsRes.data }));
      } catch (e) {
        const ordersRes = await getOrders();
        const totalSpent = ordersRes.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
        setStats(prev => ({
          ...prev,
          totalOrders: ordersRes.length,
          totalSpent: totalSpent
        }));
      }

      // Load additional stats
      try {
        const wishlistRes = await getWishlist();
        setStats(prev => ({ ...prev, wishlistCount: wishlistRes.length }));
      } catch (e) { }

      // Load addresses from database
      try {
        const addressRes = await axios.get("/api/addresses");
        setAddresses(addressRes.data);
        setStats(prev => ({ ...prev, addressCount: addressRes.data.length }));
      } catch (e) {
        console.error('Failed to load addresses:', e);
      }

    } catch (error) {
      console.error('Failed to load profile:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('gamingstore_token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const res = await axios.get("/api/users/me/preferences");
      setPreferences(res.data);
    } catch (e) {
      // Use defaults
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadWishlist = async () => {
    setWishlistLoading(true);
    try {
      const data = await getWishlist();
      setWishlist(data);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const loadAddresses = async () => {
    setAddressLoading(true);
    try {
      const res = await axios.get("/api/addresses");
      setAddresses(res.data);
      setStats(prev => ({ ...prev, addressCount: res.data.length }));
    } catch (error) {
      console.error('Failed to load addresses:', error);
    } finally {
      setAddressLoading(false);
    }
  };

  const loadLoginActivity = async () => {
    try {
      const res = await axios.get("/api/users/me/activity");
      setLoginActivity(res.data);
    } catch (e) {
      // Mock data for now
      setLoginActivity([
        { id: 1, device: 'Chrome on Windows', location: 'Mumbai, India', time: new Date().toISOString(), current: true },
        { id: 2, device: 'Mobile App on Android', location: 'Pune, India', time: new Date(Date.now() - 86400000).toISOString() }
      ]);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') loadOrders();
    if (activeTab === 'wishlist') loadWishlist();
    if (activeTab === 'addresses') loadAddresses();
    if (activeTab === 'security') loadLoginActivity();
  }, [activeTab]);



  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB", { autoClose: 1500, position: "top-center", pauseOnHover: false, theme: "dark" });
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setSaving(true);
      console.log('Uploading avatar...');
      const res = await axios.post("/api/upload/avatar", formData);
      console.log('Upload response:', res.data);

      const avatarUrl = res.data.url;
      console.log('Updating user with avatar:', avatarUrl);
      await axios.put("/api/users/me", { avatar: avatarUrl });

      // Fetch latest user profile from backend
      const profileRes = await axios.get("/api/users/me");
      const latestUser = profileRes.data;
      setUser(latestUser);
      localStorage.setItem('gamingstore_user', JSON.stringify(latestUser));
      dispatch(setAuthUser(latestUser));

      toast.success("Avatar updated!", { autoClose: 1500, position: "top-center", pauseOnHover: false, theme: "dark" });
    } catch (error) {
      console.error('Avatar upload error:', error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Failed to upload avatar", { autoClose: 1500, position: "top-center", pauseOnHover: false, theme: "dark" });
    } finally {
      setSaving(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords don't match!", { autoClose: 1500, position: "top-center", pauseOnHover: false, theme: "dark" });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters", { autoClose: 1500, position: "top-center", pauseOnHover: false, theme: "dark" });
      return;
    }

    setSaving(true);
    try {
      await axios.put("/api/users/me/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success("Password changed successfully!", { autoClose: 1500, position: "top-center", pauseOnHover: false, theme: "dark" });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to change password", { autoClose: 1500, position: "top-center", pauseOnHover: false, theme: "dark" });
    } finally {
      setSaving(false);
    }
  };

  const saveAddress = async () => {
    if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.zipCode) {
      toast.error("Please fill all required fields", { autoClose: 1500, position: "top-center", pauseOnHover: false, theme: "dark" });
      return;
    }

    setSaving(true);
    try {
      if (editingAddress) {
        await axios.put(`/api/addresses/${editingAddress.id}`, addressForm);
        toast.success("Address updated!", { autoClose: 1500, position: "top-center", pauseOnHover: false, theme: "dark" });
      } else {
        await axios.post("/api/addresses", addressForm);
        toast.success("Address added!", { autoClose: 1500, position: "top-center", pauseOnHover: false, theme: "dark" });
      }
      setShowAddressForm(false);
      setEditingAddress(null);
      resetAddressForm();
      loadAddresses();
    } catch (error) {
      toast.error("Failed to save address", { autoClose: 1500, position: "top-center", pauseOnHover: false, theme: "dark" });
    } finally {
      setSaving(false);
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      label: 'Home',
      fullName: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      isDefault: false
    });
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const deleteAddress = (id) => {
    setAddressToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteAddress = async () => {
    try {
      await axios.delete(`/api/addresses/${addressToDelete}`);
      toast.success("Address deleted", { autoClose: 1500, position: "top-center", pauseOnHover: false, theme: "dark" });
      loadAddresses();
    } catch (error) {
      toast.error("Failed to delete address", { autoClose: 1500, position: "top-center", pauseOnHover: false, theme: "dark" });
    }
    setShowDeleteModal(false);
    setAddressToDelete(null);
  };

  {/* Modal for delete confirmation */}
  <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Delete Address?</h2>
      <p className="text-gray-400 mb-6">Are you sure you want to delete this address? This action cannot be undone.</p>
      <div className="flex justify-center gap-4">
        <button className="bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-3 rounded-xl transition" onClick={confirmDeleteAddress}>Delete</button>
        <button className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold px-6 py-3 rounded-xl transition" onClick={() => setShowDeleteModal(false)}>Cancel</button>
      </div>
    </div>
  </Modal>

  const setDefaultAddress = async (id) => {
    try {
      await axios.put(`/api/addresses/${id}/default`);
      toast.success("Default address updated", { autoClose: 1500, position: "top-center", pauseOnHover: false, theme: "dark" });
      loadAddresses();
    } catch (error) {
      toast.error("Failed to update default address", { autoClose: 1500, position: "top-center", pauseOnHover: false, theme: "dark" });
    }
  };

  const updatePreferences = async (key, value) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    try {
      await axios.put("/api/users/me/preferences", newPrefs);
    } catch (e) {
      // Silently fail - preferences will be saved locally
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error("Please type DELETE to confirm", { autoClose: 1500, position: "top-center", pauseOnHover: false, theme: "dark" });
      return;
    }

    try {
      await axios.delete("/api/users/me");
      localStorage.removeItem('gamingstore_token');
      localStorage.removeItem('gamingstore_user');
      toast.success("Account deleted", { autoClose: 1500, position: "top-center", pauseOnHover: false, theme: "dark" });
      navigate('/');
    } catch (error) {
      toast.error("Failed to delete account", { autoClose: 1500, position: "top-center", pauseOnHover: false, theme: "dark" });
    }
  };

  const logout = () => {
    localStorage.removeItem('gamingstore_token');
    localStorage.removeItem('gamingstore_user');
    navigate('/login');
    toast.info("Logged out successfully", { autoClose: 1500, position: "top-center", pauseOnHover: false, theme: "dark" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your account...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FaUser },
    { id: 'orders', name: 'Your Orders', icon: FaShoppingBag },
    { id: 'addresses', name: 'Addresses', icon: FaMapMarkerAlt },
    { id: 'security', name: 'Login & Security', icon: FaLock },
    { id: 'notifications', name: 'Notifications', icon: FaBell },
    { id: 'privacy', name: 'Privacy', icon: FaShieldAlt }
  ];

  const quickActions = [
    { icon: FaShoppingBag, title: 'Your Orders', desc: 'Track, return, or buy things again', link: '/orders', color: 'from-orange-500 to-amber-500' },
    { icon: FaLock, title: 'Login & Security', desc: 'Edit login, name, and mobile number', tab: 'security', color: 'from-blue-500 to-cyan-500' },
    { icon: FaMapMarkerAlt, title: 'Your Addresses', desc: 'Edit addresses for orders', tab: 'addresses', color: 'from-green-500 to-emerald-500' },
    { icon: FaCreditCard, title: 'Payment Options', desc: 'Edit or add payment methods', link: '#', color: 'from-purple-500 to-pink-500' },
    { icon: FaGift, title: 'Gift Cards', desc: 'View balance or redeem a card', link: '#', color: 'from-red-500 to-rose-500' },
    { icon: FaHeadset, title: 'Contact Us', desc: 'Get help with orders and more', link: '/contact', color: 'from-teal-500 to-cyan-500' }
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const getTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return formatDate(dateStr);
  };

  return (
    <div className="animate-fade-in">

      {/* Header Banner */}
      <div className="bg-transparent py-8 border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-full bg-slate-800 border-4 border-white/20 overflow-hidden shadow-2xl">
                {user.avatar ? (
                  <img src={getImageUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-4xl font-bold text-white">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <FaCamera className="text-gray-600" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* User Info */}
            <div className="text-center md:text-left text-white flex-1">
              <h1 className="text-3xl font-bold mb-1">{user.name || 'Welcome!'}</h1>
              <p className="text-white/70 mb-3">{user.email}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  Member since {formatDate(user.createdAt)}
                </span>
                {user.role === 'admin' || user.isAdmin ? (
                  <span className="bg-yellow-500/30 text-yellow-200 px-3 py-1 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Admin
                  </span>
                ) : user.role === 'seller' || user.isSeller ? (
                  <span className="bg-emerald-500/30 text-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                    </svg>
                    Seller
                  </span>
                ) : (
                  <span className="bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full flex items-center gap-1">
                    <FaUser className="w-3 h-3" />
                    User
                  </span>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 text-center min-w-[100px]">
                <div className="text-3xl font-bold text-white">{stats.totalOrders}</div>
                <div className="text-white/70 text-sm">Orders</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 text-center min-w-[100px]">
                <div className="text-3xl font-bold text-white">₹{(stats.totalSpent || 0).toLocaleString()}</div>
                <div className="text-white/70 text-sm">Spent</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 text-center min-w-[100px]">
                <div className="text-3xl font-bold text-white">{stats.wishlistCount}</div>
                <div className="text-white/70 text-sm">Wishlist</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden sticky top-4">
              <div className="p-4 border-b border-slate-700">
                <h3 className="font-semibold text-white">Your Account</h3>
              </div>
              <nav className="p-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-300 hover:bg-slate-700'
                      }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
                <hr className="my-2 border-slate-700" />
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <FaSignOutAlt className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Actions Grid */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => action.tab ? setActiveTab(action.tab) : action.link !== '#' && navigate(action.link)}
                        className="group bg-slate-800 border border-slate-700 rounded-xl p-5 text-left hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all"
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color.replace('purple-500 to-pink-500', 'blue-500 to-purple-500').replace('orange-500 to-red-500', 'blue-400 to-indigo-500')} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-white mb-1">{action.title}</h3>
                        <p className="text-sm text-gray-400">{action.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personal Info Card */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <FaUser className="text-purple-500" />
                    Personal Information
                  </h2>

                  <div className="space-y-5">
                    {/* Name Field */}
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Full Name</label>
                      <input
                        type="text"
                        value={tempValues.name}
                        onChange={e => setTempValues({ ...tempValues, name: e.target.value })}
                        className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl border border-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Email Field - Read Only */}
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Email Address</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full bg-slate-700/50 text-gray-400 px-4 py-3 rounded-xl border border-slate-600 cursor-not-allowed pr-24"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded flex items-center gap-1">
                          <FaCheck className="w-3 h-3" /> Verified
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={tempValues.phone}
                        onChange={e => setTempValues({ ...tempValues, phone: e.target.value })}
                        className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl border border-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                        placeholder="+91 9876543210"
                      />
                    </div>

                    {/* Save Button */}
                    <div className="pt-2">
                      <button
                        onClick={async () => {
                          if (tempValues.name === user.name && tempValues.phone === user.phone) {
                            toast.info("No changes to save", { autoClose: 1500, position: "top-center", pauseOnHover: false, theme: "dark" });
                            return;
                          }
                          setSaving(true);
                          try {
                            const updateData = {};
                            if (tempValues.name !== user.name) updateData.name = tempValues.name;
                            if (tempValues.phone !== user.phone) updateData.phone = tempValues.phone;

                            await axios.put("/api/users/me", updateData);
                            setUser({ ...user, ...updateData });

                            const storedUser = JSON.parse(localStorage.getItem('gamingstore_user') || '{}');
                            const updatedUser = { ...storedUser, ...updateData };
                            localStorage.setItem('gamingstore_user', JSON.stringify(updatedUser));
                            dispatch(setAuthUser(updatedUser));

                            toast.success("Profile updated successfully!", { autoClose: 1500, position: "top-center", pauseOnHover: false, theme: "dark" });
                          } catch (error) {
                            toast.error(error.response?.data?.error || "Failed to update profile", { autoClose: 1500, position: "top-center", pauseOnHover: false, theme: "dark" });
                          } finally {
                            setSaving(false);
                          }
                        }}
                        disabled={saving || (tempValues.name === user.name && tempValues.phone === user.phone)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {saving ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <FaCheck className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <FaHistory className="text-orange-500" />
                      Recent Orders
                    </h2>
                    <Link to="/orders" className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1">
                      View All <FaChevronRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {stats.totalOrders === 0 ? (
                    <div className="text-center py-8">
                      <FaShoppingBag className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                      <p className="text-gray-400 mb-4">No orders yet</p>
                      <Link to="/products" className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full hover:opacity-90 transition">
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <p>You have {stats.totalOrders} orders. <Link to="/orders" className="text-purple-400 hover:underline">View them all</Link></p>
                    </div>
                  )}
                </div>

                {/* Default Address Preview */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <FaMapMarkerAlt className="text-pink-500" />
                      Saved Addresses
                    </h2>
                    <button
                      onClick={() => setActiveTab('addresses')}
                      className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                    >
                      Manage <FaChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <FaMapMarkerAlt className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                      <p className="text-gray-400 mb-4">No addresses saved</p>
                      <button
                        onClick={() => { resetAddressForm(); setShowAddressForm(true); setActiveTab('addresses'); }}
                        className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-blue-500/25 hover:scale-105 transition transform"
                      >
                        Add Address
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Show default address first, then others */}
                      {addresses.filter(a => a.isDefault).concat(addresses.filter(a => !a.isDefault)).slice(0, 2).map(address => (
                        <div key={address.id} className={`border rounded-xl p-4 ${address.isDefault
                          ? 'border-purple-500/50 bg-purple-500/5'
                          : 'border-slate-600 bg-slate-700/30'
                          }`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs bg-slate-600 text-gray-300 px-2 py-0.5 rounded">
                                  {address.label || 'Home'}
                                </span>
                                {address.isDefault && (
                                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-white font-medium">{address.fullName || address.name}</p>
                              <p className="text-gray-400 text-sm">{address.street || address.line1}</p>
                              <p className="text-gray-400 text-sm">{address.city}, {address.state} {address.zipCode || address.zip}</p>
                              {address.phone && <p className="text-gray-500 text-xs mt-1">📞 {address.phone}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                      {addresses.length > 2 && (
                        <p className="text-sm text-gray-500 text-center">
                          +{addresses.length - 2} more address(es)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Your Orders</h2>
                  <Link to="/orders" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2 rounded-lg text-sm transition shadow-lg shadow-blue-500/20">
                    View All Orders
                  </Link>
                </div>

                {ordersLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-purple-500 mx-auto"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <FaShoppingBag className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 mb-4">No orders yet</p>
                    <Link to="/products" className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-blue-500/25 hover:scale-105 transition transform">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map(order => (
                      <Link
                        key={order.id}
                        to={`/orders/${order.id}`}
                        className="block bg-slate-700/50 border border-slate-600 rounded-xl p-4 hover:border-purple-500/50 transition-all"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div>
                            <p className="text-sm text-gray-400">Order #{order.id}</p>
                            <p className="text-white font-medium">{order.OrderItems?.length || 0} items</p>
                            <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                              order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                                order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                  order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                    'bg-gray-500/20 text-gray-400'
                              }`}>
                              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                            </span>
                            <p className="text-lg font-bold text-purple-400 mt-1">₹{parseFloat(order.total).toLocaleString()}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Your Addresses</h2>
                  <button
                    onClick={() => {
                      setEditingAddress(null);
                      resetAddressForm();
                      setShowAddressForm(true);
                    }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition flex items-center gap-2"
                  >
                    <FaPlus /> Add Address
                  </button>
                </div>

                {/* Address Form Modal */}
                {showAddressForm && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                      <div className="p-6 border-b border-slate-700">
                        <h3 className="text-xl font-bold text-white">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className="block text-sm text-gray-400 mb-1">Address Type</label>
                            <div className="flex gap-2">
                              {['Home', 'Work', 'Other'].map(type => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => setAddressForm({ ...addressForm, label: type })}
                                  className={`px-4 py-2 rounded-lg border ${addressForm.label === type
                                    ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                                    : 'border-slate-600 text-gray-400 hover:border-slate-500'
                                    }`}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                            <input
                              type="text"
                              value={addressForm.fullName}
                              onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })}
                              className="w-full bg-slate-700 text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:border-purple-500"
                              placeholder="John Doe"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Phone</label>
                            <input
                              type="tel"
                              value={addressForm.phone}
                              onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                              className="w-full bg-slate-700 text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:border-purple-500"
                              placeholder="+91 9876543210"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm text-gray-400 mb-1">Street Address *</label>
                            <textarea
                              value={addressForm.street}
                              onChange={e => setAddressForm({ ...addressForm, street: e.target.value })}
                              className="w-full bg-slate-700 text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:border-purple-500"
                              rows={2}
                              placeholder="House no., Building, Street, Area"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">City *</label>
                            <input
                              type="text"
                              value={addressForm.city}
                              onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                              className="w-full bg-slate-700 text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:border-purple-500"
                              placeholder="Mumbai"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">State *</label>
                            <input
                              type="text"
                              value={addressForm.state}
                              onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                              className="w-full bg-slate-700 text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:border-purple-500"
                              placeholder="Maharashtra"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">ZIP Code *</label>
                            <input
                              type="text"
                              value={addressForm.zipCode}
                              onChange={e => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                              className="w-full bg-slate-700 text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:border-purple-500"
                              placeholder="400001"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Country</label>
                            <input
                              type="text"
                              value={addressForm.country}
                              onChange={e => setAddressForm({ ...addressForm, country: e.target.value })}
                              className="w-full bg-slate-700 text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:border-purple-500"
                              placeholder="India"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={addressForm.isDefault}
                                onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                className="w-4 h-4 accent-purple-500"
                              />
                              <span className="text-gray-300">Set as default address</span>
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 border-t border-slate-700 flex gap-3 justify-end">
                        <button
                          onClick={() => { setShowAddressForm(false); setEditingAddress(null); }}
                          className="px-6 py-2.5 rounded-lg border border-slate-600 text-gray-300 hover:bg-slate-700 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveAddress}
                          disabled={saving}
                          className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save Address'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {addressLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-purple-500 mx-auto"></div>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <FaMapMarkerAlt className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 mb-4">No addresses saved</p>
                    <button
                      onClick={() => { resetAddressForm(); setShowAddressForm(true); }}
                      className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full hover:opacity-90 transition"
                    >
                      Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map(address => (
                      <div key={address.id} className={`border rounded-xl p-5 ${address.isDefault
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-600 bg-slate-700/30'
                        }`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-slate-600 text-gray-300 px-2 py-1 rounded">
                              {address.label || 'Home'}
                            </span>
                            {address.isDefault && (
                              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingAddress(address);
                                setAddressForm({
                                  label: address.label || 'Home',
                                  fullName: address.fullName || address.name || '',
                                  phone: address.phone || '',
                                  street: address.street || address.line1 || '',
                                  city: address.city || '',
                                  state: address.state || '',
                                  zipCode: address.zipCode || address.zip || '',
                                  country: address.country || 'India',
                                  isDefault: address.isDefault || false
                                });
                                setShowAddressForm(true);
                              }}
                              className="p-2 text-gray-400 hover:text-purple-400 transition"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => deleteAddress(address.id)}
                              className="p-2 text-gray-400 hover:text-red-400 transition"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                        <div className="text-gray-300">
                          {(address.fullName || address.name) && (
                            <p className="font-medium text-white">{address.fullName || address.name}</p>
                          )}
                          <p>{address.street || address.line1}</p>
                          <p>{address.city}, {address.state} {address.zipCode || address.zip}</p>
                          <p>{address.country}</p>
                          {address.phone && <p className="text-gray-400 mt-2">Phone: {address.phone}</p>}
                        </div>
                        {!address.isDefault && (
                          <button
                            onClick={() => setDefaultAddress(address.id)}
                            className="mt-3 text-sm text-purple-400 hover:text-purple-300"
                          >
                            Set as default
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Password Section */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <FaLock className="text-blue-500" />
                    Change Password
                  </h2>

                  <div className="max-w-md space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword.current ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl border border-slate-600 focus:outline-none focus:border-purple-500 pr-12"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showPassword.new ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl border border-slate-600 focus:outline-none focus:border-purple-500 pr-12"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showPassword.confirm ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl border border-slate-600 focus:outline-none focus:border-purple-500 pr-12"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={changePassword}
                      disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
                    >
                      {saving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>

                {/* Login Activity */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <FaHistory className="text-green-500" />
                    Recent Login Activity
                  </h2>

                  <div className="space-y-3">
                    {loginActivity.map(activity => (
                      <div key={activity.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.current ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-gray-400'
                            }`}>
                            <FaMobile className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-white font-medium flex items-center gap-2 flex-wrap">
                              <span>{activity.device}</span>
                              {activity.current && (
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                                  Current Session
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-400">{activity.location}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="text-sm text-gray-400">{getTimeAgo(activity.time)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connected Accounts */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-6">Connected Accounts</h2>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500/20 flex-shrink-0">
                          <FaGoogle className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Google</p>
                          <p className="text-sm text-gray-400">Not connected</p>
                        </div>
                      </div>
                      <button className="text-purple-400 hover:text-purple-300 text-sm px-4 py-2 hover:bg-slate-600 rounded-lg transition">Connect</button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500/20 flex-shrink-0">
                          <FaFacebook className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Facebook</p>
                          <p className="text-sm text-gray-400">Not connected</p>
                        </div>
                      </div>
                      <button className="text-purple-400 hover:text-purple-300 text-sm px-4 py-2 hover:bg-slate-600 rounded-lg transition">Connect</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <FaBell className="text-yellow-500" />
                  Notification Preferences
                </h2>

                <div className="space-y-4">
                  {[
                    { key: 'orderUpdates', label: 'Order Updates', desc: 'Get notified about your order status', icon: FaShoppingBag, color: 'bg-orange-500/20 text-orange-400' },
                    { key: 'promotions', label: 'Promotions & Deals', desc: 'Receive exclusive offers and deals', icon: FaGift, color: 'bg-pink-500/20 text-pink-400' },
                    { key: 'newsletter', label: 'Newsletter', desc: 'Weekly digest of new products and updates', icon: FaEnvelope, color: 'bg-blue-500/20 text-blue-400' },
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email', icon: FaEnvelope, color: 'bg-green-500/20 text-green-400' },
                    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive updates via SMS', icon: FaMobile, color: 'bg-purple-500/20 text-purple-400' }
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.color}`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{item.label}</p>
                          <p className="text-sm text-gray-400">{item.desc}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
                        <input
                          type="checkbox"
                          checked={preferences[item.key]}
                          onChange={e => updatePreferences(item.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <FaShieldAlt className="text-purple-500" />
                    Privacy & Data
                  </h2>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-700/50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-500/20 flex-shrink-0">
                            <FaDownload className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-medium">Download Your Data</h3>
                            <p className="text-sm text-gray-400">Get a copy of your personal data</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 text-purple-400 hover:text-purple-300 hover:bg-slate-600 rounded-lg transition text-sm">
                          Download
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-700/50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-500/20 flex-shrink-0">
                            <FaHistory className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-medium">Browsing History</h3>
                            <p className="text-sm text-gray-400">Clear your recently viewed products</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            localStorage.removeItem('gamingstore_recently_viewed');
                            toast.success("Browsing history cleared", { autoClose: 1500, position: "top-center", pauseOnHover: false, theme: "dark" });
                          }}
                          className="px-4 py-2 text-purple-400 hover:text-purple-300 hover:bg-slate-600 rounded-lg transition text-sm"
                        >
                          Clear History
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delete Account */}
                <div className="bg-slate-800 border border-red-500/30 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-red-400 mb-4">Danger Zone</h2>
                  <p className="text-gray-400 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-500/20 border border-red-500 text-red-400 px-6 py-3 rounded-xl hover:bg-red-500/30 transition"
                  >
                    Delete Account
                  </button>
                </div>

                {/* Delete Account Modal */}
                {showDeleteModal && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6">
                      <h3 className="text-xl font-bold text-red-400 mb-4">Delete Account</h3>
                      <p className="text-gray-400 mb-4">
                        This action cannot be undone. All your data including orders, addresses, and wishlist will be permanently deleted.
                      </p>
                      <p className="text-gray-300 mb-4">
                        Type <span className="font-bold text-white">DELETE</span> to confirm:
                      </p>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={e => setDeleteConfirmText(e.target.value)}
                        className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl border border-slate-600 focus:outline-none focus:border-red-500 mb-4"
                        placeholder="Type DELETE"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                          className="flex-1 px-4 py-3 rounded-xl border border-slate-600 text-gray-300 hover:bg-slate-700 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={deleteAccount}
                          disabled={deleteConfirmText !== 'DELETE'}
                          className="flex-1 bg-red-500 text-white px-4 py-3 rounded-xl hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delete Forever
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

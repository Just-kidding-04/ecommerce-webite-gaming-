import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { FaCreditCard, FaMapMarkerAlt, FaShoppingBag, FaArrowLeft, FaPlus, FaCheck, FaShieldAlt, FaTruck, FaUndo, FaLock, FaMoneyBillWave, FaWallet, FaMobileAlt, FaBuilding, FaEdit, FaTrash, FaTimes, FaQrcode, FaUniversity, FaCheckCircle, FaChevronRight, FaChevronLeft } from 'react-icons/fa'
import { clearCart } from '../../redux/slices/cartSlice'
import { createOrder } from '../../services/orderService'
import AddressForm from '../../components/common/AddressForm'
import Modal from '../../components/common/Modal'
import axios from '../../services/axiosInstance'
import { toast } from '../../utils/toast'

// Payment Processing Component
function PaymentProcessing({ message }) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Outer ring */}
          <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
          {/* Spinning ring */}
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
          {/* Inner pulse */}
          <div className="absolute inset-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full animate-pulse flex items-center justify-center">
            <FaLock className="text-3xl text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{message || 'Processing Payment...'}</h3>
        <p className="text-slate-400">Please do not close this window</p>
        <div className="flex justify-center gap-1 mt-6">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}

// Card Payment Form
function CardPaymentForm({ onSubmit, onCancel, total }) {
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [errors, setErrors] = useState({})

  function formatCardNumber(value) {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19)
  }

  function formatExpiry(value) {
    const clean = value.replace(/\D/g, '')
    if (clean.length >= 2) {
      return clean.slice(0, 2) + '/' + clean.slice(2, 4)
    }
    return clean
  }

  function handleChange(field, value) {
    if (field === 'number') value = formatCardNumber(value.replace(/\D/g, ''))
    if (field === 'expiry') value = formatExpiry(value)
    if (field === 'cvv') value = value.replace(/\D/g, '').slice(0, 4)
    setCardData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  function validate() {
    const newErrors = {}
    if (cardData.number.replace(/\s/g, '').length < 16) newErrors.number = 'Enter valid card number'
    if (!cardData.name.trim()) newErrors.name = 'Enter cardholder name'
    if (cardData.expiry.length < 5) newErrors.expiry = 'Enter valid expiry'
    if (cardData.cvv.length < 3) newErrors.cvv = 'Enter valid CVV'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (validate()) onSubmit(cardData)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <FaCreditCard className="text-blue-400" />
          </div>
          Card Payment
        </h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-white p-2">
          <FaTimes />
        </button>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <p className="text-white/70 text-sm mb-4">Card Number</p>
        <p className="text-white text-2xl font-mono tracking-wider mb-6">
          {cardData.number || '•••• •••• •••• ••••'}
        </p>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-white/70 text-xs">Card Holder</p>
            <p className="text-white font-medium">{cardData.name || 'YOUR NAME'}</p>
          </div>
          <div>
            <p className="text-white/70 text-xs">Expires</p>
            <p className="text-white font-medium">{cardData.expiry || 'MM/YY'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Card Number</label>
          <input
            type="text"
            value={cardData.number}
            onChange={(e) => handleChange('number', e.target.value)}
            placeholder="1234 5678 9012 3456"
            className={`w-full bg-black/20 border ${errors.number ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white font-mono focus:border-blue-500 outline-none transition`}
          />
          {errors.number && <p className="text-red-400 text-xs mt-1">{errors.number}</p>}
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Cardholder Name</label>
          <input
            type="text"
            value={cardData.name}
            onChange={(e) => handleChange('name', e.target.value.toUpperCase())}
            placeholder="JOHN DOE"
            className={`w-full bg-black/20 border ${errors.name ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white uppercase focus:border-blue-500 outline-none transition`}
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Expiry Date</label>
            <input
              type="text"
              value={cardData.expiry}
              onChange={(e) => handleChange('expiry', e.target.value)}
              placeholder="MM/YY"
              className={`w-full bg-black/20 border ${errors.expiry ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition`}
            />
            {errors.expiry && <p className="text-red-400 text-xs mt-1">{errors.expiry}</p>}
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">CVV</label>
            <input
              type="password"
              value={cardData.cvv}
              onChange={(e) => handleChange('cvv', e.target.value)}
              placeholder="•••"
              className={`w-full bg-black/20 border ${errors.cvv ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition`}
            />
            {errors.cvv && <p className="text-red-400 text-xs mt-1">{errors.cvv}</p>}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-4 rounded-xl font-bold text-lg transition mt-6 flex items-center justify-center gap-2"
        >
          <FaLock />
          Pay ₹{total?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </button>
      </form>

      <p className="text-slate-500 text-xs text-center mt-4 flex items-center justify-center gap-2">
        <FaShieldAlt className="text-green-400" />
        Your card details are secured with 256-bit encryption
      </p>
    </div>
  )
}

// UPI Payment Form
function UPIPaymentForm({ onSubmit, onCancel, total }) {
  const [upiId, setUpiId] = useState('')
  const [method, setMethod] = useState('id') // 'id' or 'qr'
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (method === 'id' && !upiId.includes('@')) {
      setError('Enter valid UPI ID (e.g., name@upi)')
      return
    }
    onSubmit({ upiId, method })
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <FaMobileAlt className="text-blue-400" />
          </div>
          UPI Payment
        </h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-white p-2">
          <FaTimes />
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setMethod('id')}
          className={`flex-1 py-3 rounded-xl font-medium transition ${method === 'id' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          Enter UPI ID
        </button>
        <button
          onClick={() => setMethod('qr')}
          className={`flex-1 py-3 rounded-xl font-medium transition ${method === 'qr' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          Scan QR Code
        </button>
      </div>

      {method === 'id' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">UPI ID</label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => { setUpiId(e.target.value); setError('') }}
              placeholder="yourname@paytm"
              className={`w-full bg-gray-800 border ${error ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none transition`}
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>

          <div className="flex gap-3 flex-wrap">
            {['@paytm', '@ybl', '@oksbi', '@okaxis'].map(suffix => (
              <button
                key={suffix}
                type="button"
                onClick={() => setUpiId(prev => prev.split('@')[0] + suffix)}
                className="px-3 py-1 bg-gray-800 text-gray-400 rounded-lg text-sm hover:bg-gray-700 transition"
              >
                {suffix}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-4 rounded-xl font-bold text-lg transition mt-4 flex items-center justify-center gap-2"
          >
            <FaLock />
            Pay ₹{total?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </button>
        </form>
      ) : (
        <div className="text-center">
          <div className="bg-white p-6 rounded-2xl inline-block mb-4">
            <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
              <FaQrcode className="text-8xl text-gray-800" />
            </div>
          </div>
          <p className="text-gray-400 mb-4">Scan with any UPI app</p>
          <div className="flex justify-center gap-4 mb-6">
            {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
              <div key={app} className="text-center">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-1">
                  <FaMobileAlt className="text-purple-400" />
                </div>
                <span className="text-gray-500 text-xs">{app}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => onSubmit({ method: 'qr' })}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2"
          >
            I've Completed Payment
          </button>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-gray-700">
        {['Google Pay', 'PhonePe', 'Paytm', 'Amazon Pay'].map(app => (
          <span key={app} className="text-gray-500 text-xs">{app}</span>
        ))}
      </div>
    </div>
  )
}

// Wallet Payment Form
function WalletPaymentForm({ onSubmit, onCancel, total }) {
  const [selectedWallet, setSelectedWallet] = useState('')

  const wallets = [
    { id: 'amazonpay', name: 'Amazon Pay', balance: '₹2,450' },
    { id: 'paytm', name: 'Paytm Wallet', balance: '₹1,230' },
    { id: 'mobikwik', name: 'MobiKwik', balance: '₹850' },
    { id: 'freecharge', name: 'Freecharge', balance: '₹0' },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
            <FaWallet className="text-orange-400" />
          </div>
          Wallet Payment
        </h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-white p-2">
          <FaTimes />
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {wallets.map(wallet => (
          <div
            key={wallet.id}
            onClick={() => setSelectedWallet(wallet.id)}
            className={`p-4 rounded-xl cursor-pointer transition border-2 flex items-center justify-between ${selectedWallet === wallet.id
              ? 'border-orange-500 bg-orange-500/10'
              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <FaWallet className="text-orange-400" />
              </div>
              <span className="text-white font-medium">{wallet.name}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-400 text-sm">Balance: </span>
              <span className="text-green-400 font-medium">{wallet.balance}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => selectedWallet && onSubmit({ wallet: selectedWallet })}
        disabled={!selectedWallet}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2"
      >
        <FaLock />
        Pay ₹{total?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
      </button>
    </div>
  )
}

// Net Banking Form
function NetBankingForm({ onSubmit, onCancel, total }) {
  const [selectedBank, setSelectedBank] = useState('')

  const popularBanks = [
    { id: 'sbi', name: 'State Bank of India' },
    { id: 'hdfc', name: 'HDFC Bank' },
    { id: 'icici', name: 'ICICI Bank' },
    { id: 'axis', name: 'Axis Bank' },
    { id: 'kotak', name: 'Kotak Mahindra Bank' },
    { id: 'pnb', name: 'Punjab National Bank' },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
            <FaUniversity className="text-cyan-400" />
          </div>
          Net Banking
        </h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-white p-2">
          <FaTimes />
        </button>
      </div>

      <p className="text-gray-400 text-sm mb-4">Select your bank</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {popularBanks.map(bank => (
          <div
            key={bank.id}
            onClick={() => setSelectedBank(bank.id)}
            className={`p-4 rounded-xl cursor-pointer transition border-2 text-center ${selectedBank === bank.id
              ? 'border-cyan-500 bg-cyan-500/10'
              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
          >
            <FaBuilding className={`text-2xl mx-auto mb-2 ${selectedBank === bank.id ? 'text-cyan-400' : 'text-gray-500'}`} />
            <span className={`text-sm ${selectedBank === bank.id ? 'text-white' : 'text-gray-400'}`}>{bank.name}</span>
          </div>
        ))}
      </div>

      <select
        value={selectedBank}
        onChange={(e) => setSelectedBank(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none transition mb-6"
      >
        <option value="">-- Select Other Bank --</option>
        <option value="bob">Bank of Baroda</option>
        <option value="canara">Canara Bank</option>
        <option value="union">Union Bank</option>
        <option value="idbi">IDBI Bank</option>
        <option value="yes">Yes Bank</option>
      </select>

      <button
        onClick={() => selectedBank && onSubmit({ bank: selectedBank })}
        disabled={!selectedBank}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2"
      >
        <FaLock />
        Pay ₹{total?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
      </button>

      <p className="text-gray-500 text-xs text-center mt-4">
        You will be redirected to your bank's secure payment page
      </p>
    </div>
  )
}

// COD Confirmation
function CODConfirmation({ onSubmit, onCancel, total }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <FaMoneyBillWave className="text-green-400" />
          </div>
          Cash on Delivery
        </h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-white p-2">
          <FaTimes />
        </button>
      </div>

      <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-2xl p-6 mb-6 text-center">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaMoneyBillWave className="text-4xl text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Pay on Delivery</h3>
        <p className="text-gray-400">Pay ₹{total?.toLocaleString('en-IN', { maximumFractionDigits: 2 })} when your order arrives</p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-3 text-gray-400 text-sm">
          <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
          <span>Keep exact change ready for faster delivery</span>
        </div>
        <div className="flex items-start gap-3 text-gray-400 text-sm">
          <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
          <span>Pay in cash or use UPI at the time of delivery</span>
        </div>
        <div className="flex items-start gap-3 text-gray-400 text-sm">
          <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
          <span>Order can be cancelled before shipping</span>
        </div>
      </div>

      <button
        onClick={() => onSubmit({ method: 'cod' })}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2"
      >
        <FaCheck />
        Confirm Order
      </button>
    </div>
  )
}

export default function Checkout() {
  const items = useSelector(s => s.cart.items)
  const user = useSelector(s => s.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [loading, setLoading] = useState(false)
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState('')

  // Coupon State
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  const subtotal = items.reduce((s, i) => s + (i.price * (i.qty || 1)), 0)
  const shipping = subtotal > 5000 ? 0 : 99
  const tax = subtotal * 0.18
  const total = subtotal + shipping + tax - couponDiscount

  async function handleApplyCoupon() {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    setValidatingCoupon(true);
    try {
      const res = await axios.post('/api/orders/coupon/validate', {
        code: couponCode,
        amount: subtotal
      });

      if (res.data.success) {
        setCouponDiscount(res.data.discount);
        setAppliedCoupon(res.data.couponCode);
        toast.success(res.data.message);
      }
    } catch (err) {
      setCouponDiscount(0);
      setAppliedCoupon(null);
      toast.error(err.response?.data?.message || 'Failed to apply coupon');
    } finally {
      setValidatingCoupon(false);
    }
  }

  function handleRemoveCoupon() {
    setCouponDiscount(0);
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Coupon removed');
  }

  // Load addresses on mount
  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadAddresses()
  }, [user])

  // Auto-select first address or load from localStorage
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const savedAddressId = localStorage.getItem(`address_${user?.id}`)
      const savedAddr = savedAddressId ? addresses.find(a => a.id === parseInt(savedAddressId)) : null
      setSelectedAddress(savedAddr || addresses[0])
    }
  }, [addresses, user])

  async function loadAddresses() {
    try {
      setLoadingAddresses(true)
      const res = await axios.get('/api/addresses')
      setAddresses(res.data || [])
    } catch (err) {
      console.error('Error loading addresses:', err)
      setAddresses([])
    } finally {
      setLoadingAddresses(false)
    }
  }

  function handleAddressSelect(addr) {
    setSelectedAddress(addr)
    if (user?.id) {
      localStorage.setItem(`address_${user.id}`, addr.id)
    }
  }

  function handleAddressSaved(savedAddress) {
    loadAddresses()
    setSelectedAddress(savedAddress)
    setShowAddressForm(false)
    setEditingAddress(null)
    if (user?.id) {
      localStorage.setItem(`address_${user.id}`, savedAddress.id)
    }
  }

  function handleEditAddress(addr) {
    setEditingAddress(addr)
    setShowAddressForm(true)
  }

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  function handleDeleteAddress(addressId) {
    setAddressToDelete(addressId);
    setShowDeleteModal(true);
  }

  async function confirmDeleteAddress() {
    try {
      await axios.delete(`/api/addresses/${addressToDelete}`);
      toast.success('Address deleted');
      if (selectedAddress?.id === addressToDelete) {
        setSelectedAddress(null);
      }
      loadAddresses();
    } catch (err) {
      toast.error('Failed to delete address');
    }
    setShowDeleteModal(false);
    setAddressToDelete(null);
  }

  // ...existing code...

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

  function handleProceedToPayment() {
    if (!selectedAddress) {
      toast.error('Please select or add a delivery address')
      return
    }
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    setShowPaymentModal(true)
  }

  async function handlePaymentSubmit(paymentData) {
    setShowPaymentModal(false)
    setIsProcessing(true)

    // Show different messages for different payment methods
    const messages = {
      cod: 'Confirming your order...',
      card: 'Processing card payment...',
      upi: 'Waiting for UPI confirmation...',
      wallet: 'Processing wallet payment...',
      netbanking: 'Redirecting to bank...'
    }
    setProcessingMessage(messages[paymentMethod] || 'Processing...')

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    if (paymentMethod !== 'cod') {
      setProcessingMessage('Verifying payment...')
      await new Promise(resolve => setTimeout(resolve, 1500))
    }

    setProcessingMessage('Creating your order...')
    await new Promise(resolve => setTimeout(resolve, 1000))

    try {
      const orderData = {
        items: items.map(i => ({
          productId: i.id,
          name: i.name,
          image: i.image,
          qty: i.qty || 1,
          price: i.price
        })),
        addressId: selectedAddress.id,
        paymentMethod,
        paymentData,
        subtotal,
        shipping,
        tax,
        total
      }

      const res = await createOrder(orderData)
      dispatch(clearCart())
      setIsProcessing(false)
      toast.success('Order placed successfully!')
      navigate(`/orders/${res.id || res.orderId}`)
    } catch (err) {
      setIsProcessing(false)
      toast.error(err.response?.data?.error || 'Failed to place order')
    }
  }

  function renderPaymentForm() {
    const props = {
      total,
      onCancel: () => setShowPaymentModal(false),
      onSubmit: handlePaymentSubmit
    }

    switch (paymentMethod) {
      case 'card':
        return <CardPaymentForm {...props} />
      case 'upi':
        return <UPIPaymentForm {...props} />
      case 'wallet':
        return <WalletPaymentForm {...props} />
      case 'netbanking':
        return <NetBankingForm {...props} />
      case 'cod':
      default:
        return <CODConfirmation {...props} />
    }
  }

  if (!user) return null

  const paymentMethods = [
    { id: 'cod', name: 'Cash on Delivery', icon: FaMoneyBillWave, description: 'Pay when you receive', color: 'green' },
    { id: 'card', name: 'Credit/Debit Card', icon: FaCreditCard, description: 'Visa, Mastercard, RuPay', color: 'blue' },
    { id: 'upi', name: 'UPI', icon: FaMobileAlt, description: 'Google Pay, PhonePe, Paytm', color: 'purple' },
    { id: 'wallet', name: 'Wallet', icon: FaWallet, description: 'Amazon Pay, Paytm Wallet', color: 'orange' },
    { id: 'netbanking', name: 'Net Banking', icon: FaBuilding, description: 'All major banks', color: 'cyan' },
  ]

  // Step validation
  function validateStep1() {
    if (!selectedAddress) {
      toast.error('Please select or add a delivery address')
      return false
    }
    return true
  }

  function validateStep2() {
    if (!paymentMethod) {
      toast.error('Please select a payment method')
      return false
    }
    return true
  }

  function handleNextStep() {
    if (step === 1 && validateStep1()) {
      setStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (step === 2 && validateStep2()) {
      setStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function handlePrevStep() {
    if (step > 1) {
      setStep(step - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Step Indicator Component
  const StepIndicator = ({ number, title, icon: Icon, active, completed }) => (
    <div className={`flex items-center gap-2 sm:gap-3 ${active ? 'text-purple-400' : completed ? 'text-purple-500' : 'text-gray-500'}`}>
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${active ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' :
        completed ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' :
          'bg-gray-800 text-gray-500 border border-gray-700'
        }`}>
        {completed ? <FaCheck /> : <Icon />}
      </div>
      <div className="hidden sm:block">
        <p className={`text-xs ${active || completed ? 'text-gray-300' : 'text-gray-600'}`}>Step {number}</p>
        <p className="font-semibold text-sm">{title}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative">
      {/* Animated Color Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      </div>

      {/* Hero Banner */}
      <div className="bg-transparent border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <FaCreditCard className="text-lg" />
                </div>
                Checkout
              </h1>
            </div>
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition backdrop-blur-sm border border-white/10"
            >
              <FaArrowLeft />
              Back to Cart
            </Link>
          </div>

          {/* Step Indicator */}
          {items.length > 0 && (
            <div className="flex justify-between items-center bg-gray-800/30 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
              <StepIndicator number={1} title="Address" icon={FaMapMarkerAlt} active={step === 1} completed={step > 1} />
              <div className={`flex-1 h-1 mx-2 sm:mx-4 rounded-full ${step > 1 ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-700'}`}></div>
              <StepIndicator number={2} title="Payment" icon={FaCreditCard} active={step === 2} completed={step > 2} />
              <div className={`flex-1 h-1 mx-2 sm:mx-4 rounded-full ${step > 2 ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-700'}`}></div>
              <StepIndicator number={3} title="Review" icon={FaShoppingBag} active={step === 3} completed={false} />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
              <FaShoppingBag className="text-5xl text-slate-600" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Your cart is empty</h2>
            <p className="text-slate-400 mb-8 text-lg">Add some products to checkout</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-10 py-4 rounded-xl font-bold text-lg transition"
            >
              <FaShoppingBag />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row gap-8">

            <div className="flex-1 space-y-6">

              {step === 1 && (
                <div className="bg-slate-800/30 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                      <FaMapMarkerAlt className="text-blue-400" />
                      Select Delivery Address
                    </h2>
                    <button
                      onClick={() => { setEditingAddress(null); setShowAddressForm(true) }}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
                    >
                      <FaPlus />
                      Add New
                    </button>
                  </div>

                  {loadingAddresses ? (
                    <div className="flex justify-center py-12">
                      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
                      <FaMapMarkerAlt className="text-5xl text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 mb-4 text-lg">No saved addresses</p>
                      <button
                        onClick={() => { setEditingAddress(null); setShowAddressForm(true) }}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium"
                      >
                        <FaPlus />
                        Add Your First Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => handleAddressSelect(addr)}
                          className={`relative p-5 rounded-xl cursor-pointer transition border-2 ${selectedAddress?.id === addr.id
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-white/5 bg-slate-800/50 hover:border-white/20'
                            }`}
                        >
                          {selectedAddress?.id === addr.id && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <FaCheck className="text-white text-xs" />
                            </div>
                          )}

                          <div className="pr-10">
                            <p className="font-bold text-white mb-1">{addr.fullName || addr.name || user.name}</p>
                            <p className="text-slate-400 text-sm">{addr.phone || addr.mobile || user.phone}</p>
                            <p className="text-slate-400 text-sm mt-2">
                              {addr.addressLine || addr.street}, {addr.city}, {addr.state} - {addr.pincode || addr.zip}
                            </p>
                            {addr.landmark && <p className="text-slate-500 text-xs mt-1">Landmark: {addr.landmark}</p>}
                          </div>

                          <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditAddress(addr) }}
                              className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.id) }}
                              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Payment Method */}
              {step === 2 && (
                <div className="bg-slate-800/30 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-6">
                    <FaCreditCard className="text-blue-400" />
                    Select Payment Method
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`relative p-5 rounded-xl cursor-pointer transition border-2 ${paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-white/5 bg-slate-800/50 hover:border-white/20'
                          }`}
                      >
                        {paymentMethod === method.id && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <FaCheck className="text-white text-xs" />
                          </div>
                        )}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${method.color === 'green' ? 'bg-green-500/20 text-green-400' :
                          method.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                            method.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                              method.color === 'orange' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-cyan-500/20 text-cyan-400'
                          }`}>
                          <method.icon className="text-xl" />
                        </div>
                        <p className="font-bold text-white">{method.name}</p>
                        <p className="text-slate-500 text-sm mt-1">{method.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Payment Method Info */}
                  <div className="mt-6 p-4 bg-black/20 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <FaShieldAlt className="text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Secure Payment</p>
                        <p className="text-slate-400 text-sm">Your payment information is encrypted and secure</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review Order */}
              {step === 3 && (
                <div className="bg-slate-800/30 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-6">
                    <FaShoppingBag className="text-blue-400" />
                    Review Your Order
                  </h2>

                  {/* Selected Address Summary */}
                  <div className="mb-6 p-4 bg-black/20 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-slate-400 text-sm flex items-center gap-2">
                        <FaMapMarkerAlt className="text-blue-400" />
                        Delivery Address
                      </p>
                      <button onClick={() => setStep(1)} className="text-blue-400 hover:text-blue-300 text-sm">Change</button>
                    </div>
                    {selectedAddress && (
                      <div>
                        <p className="text-white font-medium">{selectedAddress.fullName || selectedAddress.name || user.name}</p>
                        <p className="text-slate-400 text-sm mt-1">
                          {selectedAddress.addressLine || selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode || selectedAddress.zip}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Selected Payment Method Summary */}
                  <div className="mb-6 p-4 bg-black/20 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-slate-400 text-sm flex items-center gap-2">
                        <FaCreditCard className="text-blue-400" />
                        Payment Method
                      </p>
                      <button onClick={() => setStep(2)} className="text-blue-400 hover:text-blue-300 text-sm">Change</button>
                    </div>
                    <div className="flex items-center gap-3">
                      {paymentMethods.find(m => m.id === paymentMethod) && (
                        <>
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${paymentMethods.find(m => m.id === paymentMethod).color === 'green' ? 'bg-green-500/20 text-green-400' :
                            paymentMethods.find(m => m.id === paymentMethod).color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                              paymentMethods.find(m => m.id === paymentMethod).color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                                paymentMethods.find(m => m.id === paymentMethod).color === 'orange' ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-cyan-500/20 text-cyan-400'
                            }`}>
                            {React.createElement(paymentMethods.find(m => m.id === paymentMethod).icon)}
                          </div>
                          <p className="text-white font-medium">{paymentMethods.find(m => m.id === paymentMethod).name}</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-white/10 pt-6">
                    <p className="text-slate-400 text-sm mb-4">{items.length} items in your order</p>
                    <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                      {items.map(item => (
                        <div key={item.id} className="flex gap-4 p-3 bg-black/20 rounded-xl">
                          <img
                            src={item.image || 'https://placehold.co/80x80/1f2937/9ca3af?text=Product'}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => { e.target.src = 'https://placehold.co/80x80/1f2937/9ca3af?text=Product' }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium line-clamp-2 text-sm">{item.name}</p>
                            <p className="text-slate-500 text-xs mt-1">Qty: {item.qty || 1}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-blue-400 font-bold">₹{(item.price * (item.qty || 1)).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition"
                  >
                    <FaChevronLeft />
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition shadow-lg shadow-purple-500/25"
                  >
                    Continue
                    <FaChevronRight />
                  </button>
                ) : (
                  <button
                    onClick={handleProceedToPayment}
                    disabled={loading || !selectedAddress}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition shadow-lg shadow-purple-500/25"
                  >
                    <FaLock />
                    Place Order
                  </button>
                )}
              </div>
            </div>

            {/* Right Section - Order Summary */}
            <div className="xl:w-[400px] flex-shrink-0">
              <div className="bg-slate-800/40 border border-white/10 rounded-2xl p-6 xl:sticky xl:top-24">
                <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                {/* Progress Steps */}
                <div className="mb-6 p-4 bg-black/20 rounded-xl border border-white/10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step > 1 ? 'bg-green-500/20 text-green-400' : step === 1 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-500'}`}>
                        {step > 1 ? <FaCheck className="text-xs" /> : '1'}
                      </div>
                      <span className={step >= 1 ? 'text-white' : 'text-slate-500'}>Address</span>
                      {step > 1 && selectedAddress && (
                        <span className="text-slate-400 text-xs ml-auto truncate max-w-[120px]">{selectedAddress.city}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step > 2 ? 'bg-green-500/20 text-green-400' : step === 2 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-500'}`}>
                        {step > 2 ? <FaCheck className="text-xs" /> : '2'}
                      </div>
                      <span className={step >= 2 ? 'text-white' : 'text-slate-500'}>Payment</span>
                      {step > 2 && (
                        <span className="text-slate-400 text-xs ml-auto">{paymentMethods.find(m => m.id === paymentMethod)?.name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step === 3 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-500'}`}>
                        3
                      </div>
                      <span className={step >= 3 ? 'text-white' : 'text-slate-500'}>Review</span>
                    </div>
                  </div>
                </div>

                {/* Coupon Section */}
                <div className="mb-6 p-4 bg-black/20 rounded-xl border border-white/10">
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <FaQrcode className="text-blue-400" />
                    Have a Coupon?
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      disabled={!!appliedCoupon}
                      className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none transition disabled:opacity-50"
                    />
                    {appliedCoupon ? (
                      <button
                        onClick={handleRemoveCoupon}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || !couponCode}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                      >
                        {validatingCoupon ? '...' : 'Apply'}
                      </button>
                    )}
                  </div>
                  {appliedCoupon && (
                    <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                      <FaCheckCircle /> Coupon '{appliedCoupon}' applied
                    </p>
                  )}
                </div>

                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal ({items.reduce((sum, i) => sum + (i.qty || 1), 0)} items)</span>
                    <span className="text-white font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-400 font-semibold' : 'text-white'}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST (18%)</span>
                    <span className="text-white">₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount ({appliedCoupon})</span>
                      <span>-₹{couponDiscount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div className="border-t border-white/10 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-white">Total</span>
                      <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1 text-right">Including all taxes</p>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 border-t border-white/10">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center mb-1">
                        <FaShieldAlt className="text-green-400 text-sm" />
                      </div>
                      <span className="text-slate-400 text-[10px]">Secure</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center mb-1">
                        <FaTruck className="text-blue-400 text-sm" />
                      </div>
                      <span className="text-slate-400 text-[10px]">Fast Delivery</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center mb-1">
                        <FaUndo className="text-purple-400 text-sm" />
                      </div>
                      <span className="text-slate-400 text-[10px]">Easy Returns</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Address Form Modal */}
      <Modal isOpen={showAddressForm} onClose={() => { setShowAddressForm(false); setEditingAddress(null) }}>
        <AddressForm
          editAddress={editingAddress}
          onSave={handleAddressSaved}
          onCancel={() => { setShowAddressForm(false); setEditingAddress(null) }}
        />
      </Modal>

      {/* Payment Form Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
        {renderPaymentForm()}
      </Modal>

      {/* Payment Processing Overlay */}
      {isProcessing && <PaymentProcessing message={processingMessage} />}
    </div>
  )
}

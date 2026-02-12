const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User } = require('../models')
const { sendMail } = require('../utils/email')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

function generateToken(user) {
  return jwt.sign({
    id: user.id,
    email: user.email,
    role: user.role,
    // Backward compatibility
    isAdmin: user.role === 'admin',
    isSeller: user.role === 'seller' || user.role === 'admin'
  }, JWT_SECRET, { expiresIn: '8h' })
}

router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  try {
    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, phone, passwordHash: hash, role: 'user' })
    const token = generateToken(user)
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isAdmin: user.role === 'admin',
        isSeller: user.role === 'seller' || user.role === 'admin'
      },
      token
    })
  } catch (e) {
    res.status(400).json({ error: 'Registration failed', details: e.message })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  try {
    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const token = generateToken(user)
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.role === 'admin',
        isSeller: user.role === 'seller' || user.role === 'admin'
      },
      token
    })
  } catch (e) {
    res.status(500).json({ error: 'Login failed' })
  }
})

router.post('/seller/register', async (req, res) => {
  const {
    name, email, password, phone,
    businessName, businessType, gstNumber, panNumber,
    addressLine1, addressLine2, city, state, pincode
  } = req.body

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Name, email and password are required' })
  }

  try {
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const hash = await bcrypt.hash(password, 10)

    const sellerAddress = {
      line1: addressLine1,
      line2: addressLine2,
      city,
      state,
      pincode
    }

    const user = await User.create({
      name,
      email,
      passwordHash: hash,
      phone,
      role: 'seller',
      businessName,
      businessType,
      gstNumber: gstNumber || null,
      panNumber: panNumber || null,
      sellerAddress,
      sellerVerified: false
    })

    const token = generateToken(user)

    res.json({
      message: 'Seller account created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isSeller: true,
        businessName: user.businessName,
        sellerVerified: user.sellerVerified
      },
      token
    })
  } catch (e) {
    console.error('Seller registration error:', e)
    res.status(400).json({ message: 'Registration failed', details: e.message })
  }
})

router.post('/seller/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  try {
    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check if user has seller or admin role
    if (user.role !== 'seller' && user.role !== 'admin') {
      return res.status(401).json({ message: 'This account is not registered as a seller. Please register as a seller first.' })
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(user)

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isSeller: true,
        businessName: user.businessName,
        sellerVerified: user.sellerVerified
      },
      token
    })
  } catch (e) {
    console.error('Seller login error:', e)
    res.status(500).json({ message: 'Login failed' })
  }
})

router.post('/verify-email', async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' })
  }

  try {
    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' })
    }

    if (!user.phone) {
      return res.status(400).json({ success: false, message: 'No phone number associated with this account. Please contact support.' })
    }

    const maskedPhone = user.phone.replace(/\d(?=\d{4})/g, '*')

    res.json({
      success: true,
      message: 'Email verified',
      maskedPhone,
      user: { id: user.id, name: user.name }
    })
  } catch (e) {
    console.error('Verify email error:', e)
    res.status(500).json({ success: false, message: 'Verification failed' })
  }
})

// Admin login - only allows admin role users
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Only allow admin role
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' })
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = generateToken(user)

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: true,
        isSeller: true
      },
      token
    })
  } catch (e) {
    console.error('Admin login error:', e)
    res.status(500).json({ error: 'Login failed' })
  }
})

router.post('/verify-phone', async (req, res) => {
  const { email, phone } = req.body

  if (!email || !phone) {
    return res.status(400).json({ success: false, message: 'Email and phone are required' })
  }

  try {
    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found' })
    }

    const cleanUserPhone = user.phone.replace(/\D/g, '')
    const cleanInputPhone = phone.replace(/\D/g, '')

    // Check if the last 10 digits match (handling country codes)
    const userSuffix = cleanUserPhone.slice(-10)
    const inputSuffix = cleanInputPhone.slice(-10)

    if (userSuffix !== inputSuffix || cleanInputPhone.length < 10) {
      return res.status(401).json({ success: false, message: 'Phone number does not match our records' })
    }

    res.json({ success: true, message: 'Phone verified successfully' })
  } catch (e) {
    console.error('Verify phone error:', e)
    res.status(500).json({ success: false, message: 'Verification failed' })
  }
})

router.post('/reset-password', async (req, res) => {
  const { email, phone, newPassword } = req.body

  if (!email || !phone || !newPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required' })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
  }

  try {
    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found' })
    }

    const cleanUserPhone = user.phone.replace(/\D/g, '')
    const cleanInputPhone = phone.replace(/\D/g, '')

    // Check if the last 10 digits match
    const userSuffix = cleanUserPhone.slice(-10)
    const inputSuffix = cleanInputPhone.slice(-10)

    if (userSuffix !== inputSuffix || cleanInputPhone.length < 10) {
      return res.status(401).json({ success: false, message: 'Phone verification failed' })
    }

    const hash = await bcrypt.hash(newPassword, 10)
    await user.update({ passwordHash: hash })

    res.json({ success: true, message: 'Password reset successfully' })
  } catch (e) {
    console.error('Reset password error:', e)
    res.status(500).json({ success: false, message: 'Password reset failed' })
  }
})

const {
  getProfile,
  updateProfile,
  deleteProfile,
} = require("../controllers/usercontroller");

const auth = require("../middlewares/authMiddleware");

router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.delete("/profile", auth, deleteProfile);

module.exports = router

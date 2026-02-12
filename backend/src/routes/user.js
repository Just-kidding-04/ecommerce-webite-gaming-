const express = require('express')
const router = express.Router()
const { User, Order, Wishlist, Address } = require('../models')
const authMiddleware = require('../middlewares/authMiddleware')
const bcrypt = require('bcrypt')

// ============================================
// IMPORTANT: /me routes MUST come before /:id
// Otherwise Express matches "me" as an id param
// ============================================

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role', 'createdAt']
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    const orderCount = await Order.count({ where: { userId: req.user.id } })
    const wishlistCount = await Wishlist.count({ where: { userId: req.user.id } })
    const addressCount = await Address.count({ where: { userId: req.user.id } })
    
    const userData = user.toJSON()
    res.json({
      ...userData,
      isAdmin: userData.role === 'admin',
      isSeller: userData.role === 'seller' || userData.role === 'admin',
      orderCount,
      wishlistCount,
      addressCount
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Update current user profile
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    // Only update fields that are provided in the request
    const updateFields = {}
    if (req.body.name !== undefined) updateFields.name = req.body.name
    if (req.body.phone !== undefined) updateFields.phone = req.body.phone
    if (req.body.avatar !== undefined) updateFields.avatar = req.body.avatar
    // Note: email changes would typically require verification
    
    if (Object.keys(updateFields).length > 0) {
      await user.update(updateFields)
    }
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      isAdmin: user.role === 'admin',
      isSeller: user.role === 'seller' || user.role === 'admin'
    })
  } catch (e) {
    console.error('Update user error:', e)
    res.status(500).json({ error: e.message })
  }
})

// Change password
router.put('/me/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    
    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }
    
    const hash = await bcrypt.hash(newPassword, 10)
    await user.update({ passwordHash: hash })
    
    res.json({ success: true, message: 'Password updated successfully' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Get user stats
router.get('/me/stats', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.findAll({ where: { userId: req.user.id } })
    
    const totalOrders = orders.length
    const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0)
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'processing').length
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length
    
    res.json({
      totalOrders,
      totalSpent,
      pendingOrders,
      deliveredOrders
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Get user preferences
router.get('/me/preferences', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    const defaults = {
      emailNotifications: true,
      smsNotifications: false,
      orderUpdates: true,
      promotions: false,
      newsletter: true
    }
    
    const preferences = user.preferences ? JSON.parse(user.preferences) : defaults
    res.json(preferences)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Update user preferences
router.put('/me/preferences', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    await user.update({ preferences: JSON.stringify(req.body) })
    res.json({ success: true, preferences: req.body })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Get login activity
router.get('/me/activity', authMiddleware, async (req, res) => {
  try {
    const activity = [
      { 
        id: 1, 
        device: 'Chrome on Windows', 
        location: 'Mumbai, India', 
        time: new Date().toISOString(), 
        current: true 
      },
      { 
        id: 2, 
        device: 'Mobile App on Android', 
        location: 'Pune, India', 
        time: new Date(Date.now() - 86400000).toISOString(),
        current: false
      }
    ]
    res.json(activity)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Delete user account
router.delete('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    await Wishlist.destroy({ where: { userId: req.user.id } })
    await Address.destroy({ where: { userId: req.user.id } })
    await user.destroy()
    
    res.json({ success: true, message: 'Account deleted successfully' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ============================================
// ADMIN ROUTES - these come after /me routes
// ============================================

// List all users (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' })
    }
    
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'phone', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    })
    
    const result = users.map(u => {
      const data = u.toJSON()
      return { ...data, isAdmin: data.role === 'admin' }
    })
    
    res.json(result)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Update user by ID (admin only) - MUST be after all /me routes
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' })
    }
    
    const user = await User.findByPk(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    const { isAdmin, name, email, role } = req.body
    const updateData = { name, email }
    if (role) {
      updateData.role = role
    } else if (isAdmin !== undefined) {
      updateData.role = isAdmin ? 'admin' : 'user'
    }
    await user.update(updateData)
    
    res.json(user)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router

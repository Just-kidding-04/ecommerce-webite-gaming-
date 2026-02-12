const express = require('express')
const router = express.Router()
const { User, Product, Order, OrderItem } = require('../models')
const authMiddleware = require('../middlewares/authMiddleware')
const { sellerOnly } = require('../middlewares/roleMiddleware')

router.use(authMiddleware, sellerOnly)

router.get('/profile', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [
        'id', 'name', 'email', 'phone', 'avatar', 'role',
        'businessName', 'businessType', 
        'gstNumber', 'panNumber', 'sellerAddress', 'sellerVerified'
      ]
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    const totalProducts = await Product.count({ where: { sellerId: req.user.id } })
    
    const sellerProducts = await Product.findAll({ 
      where: { sellerId: req.user.id },
      attributes: ['id']
    })
    const productIds = sellerProducts.map(p => p.id)
    
    const orderItems = await OrderItem.findAll({
      where: { productId: productIds },
      include: [{ model: Order }]
    })
    
    const orderIds = [...new Set(orderItems.map(oi => oi.orderId))]
    const orders = await Order.findAll({ where: { id: orderIds } })
    const totalOrders = orders.length
    
    const totalRevenue = orderItems.reduce((sum, oi) => sum + (oi.price * oi.qty), 0)
    
    const products = await Product.findAll({ 
      where: { sellerId: req.user.id },
      attributes: ['rating'] 
    })
    const avgRating = products.length > 0 
      ? (products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length).toFixed(1)
      : 0
    
    res.json({
      ...user.toJSON(),
      isSeller: true,
      totalProducts,
      totalOrders,
      totalRevenue,
      avgRating: parseFloat(avgRating)
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.put('/profile', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    const { name, phone, avatar } = req.body
    await user.update({ name, phone, avatar })
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar
      }
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.put('/business', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    const { businessName, businessType, gstNumber, panNumber, sellerAddress } = req.body
    
    await user.update({
      businessName,
      businessType,
      gstNumber,
      panNumber,
      sellerAddress
    })
    
    res.json({
      success: true,
      message: 'Business details updated successfully',
      business: {
        businessName: user.businessName,
        businessType: user.businessType,
        gstNumber: user.gstNumber,
        panNumber: user.panNumber,
        sellerAddress: user.sellerAddress
      }
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.get('/stats', async (req, res) => {
  try {
    const totalProducts = await Product.count({ where: { sellerId: req.user.id } })
    
    const sellerProducts = await Product.findAll({ 
      where: { sellerId: req.user.id },
      attributes: ['id', 'rating', 'stock']
    })
    const productIds = sellerProducts.map(p => p.id)
    
    const orderItems = await OrderItem.findAll({
      where: { productId: productIds },
      include: [{ model: Order }]
    })
    
    const orderIds = [...new Set(orderItems.map(oi => oi.orderId))]
    const orders = await Order.findAll({ where: { id: orderIds } })
    
    const totalOrders = orders.length
    const totalRevenue = orderItems.reduce((sum, oi) => sum + (oi.price * oi.qty), 0)
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length
    
    const avgRating = sellerProducts.length > 0 
      ? (sellerProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / sellerProducts.length).toFixed(1)
      : 0
    const lowStock = sellerProducts.filter(p => p.stock < 10).length
    
    res.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      avgRating: parseFloat(avgRating),
      lowStock
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.get('/products', async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { sellerId: req.user.id },
      order: [['createdAt', 'DESC']]
    })
    
    res.json(products)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.get('/orders', async (req, res) => {
  try {
    const sellerProducts = await Product.findAll({ 
      where: { sellerId: req.user.id },
      attributes: ['id']
    })
    const productIds = sellerProducts.map(p => p.id)
    
    const orderItems = await OrderItem.findAll({
      where: { productId: productIds },
      include: [{ model: Order }, { model: Product }]
    })
    
    const orderIds = [...new Set(orderItems.map(oi => oi.orderId))]
    const orders = await Order.findAll({ 
      where: { id: orderIds },
      order: [['createdAt', 'DESC']],
      include: [{ 
        model: OrderItem,
        include: [{ model: Product }]
      }]
    })
    
    const filteredOrders = orders.map(order => {
      const sellerItems = order.OrderItems.filter(oi => productIds.includes(oi.productId))
      const sellerTotal = sellerItems.reduce((sum, oi) => sum + (oi.price * oi.qty), 0)
      return {
        ...order.toJSON(),
        OrderItems: sellerItems,
        sellerTotal
      }
    })
    
    res.json(filteredOrders)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router

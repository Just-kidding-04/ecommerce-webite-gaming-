const express = require('express')
const router = express.Router()
const { Wishlist, Product, Category, Specification } = require('../models')
const authMiddleware = require('../middlewares/authMiddleware')

router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Product,
        include: [Category, { model: Specification, as: 'specifications' }]
      }]
    })
    
    const result = items.map(item => {
      const p = item.Product?.toJSON()
      if (p) {
        p.category = p.Category?.name
      }
      return {
        id: item.id,
        productId: item.productId,
        product: p
      }
    })
    
    res.json(result)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body
    
    const existing = await Wishlist.findOne({
      where: { userId: req.user.id, productId }
    })
    
    if (existing) {
      return res.status(400).json({ error: 'Product already in wishlist' })
    }
    
    const item = await Wishlist.create({
      userId: req.user.id,
      productId
    })
    
    res.status(201).json(item)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/:productId', authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.productId)
    
    await Wishlist.destroy({
      where: { userId: req.user.id, productId }
    })
    
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.get('/check/:productId', authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.productId)
    
    const item = await Wishlist.findOne({
      where: { userId: req.user.id, productId }
    })
    
    res.json({ inWishlist: !!item })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router

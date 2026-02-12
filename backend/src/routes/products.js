// ...existing code...
const express = require('express')
const router = express.Router()
const { Review, User, Product, Category, Specification } = require('../models')
const multer = require('multer')
const upload = multer({ dest: 'public/uploads/' })
const { Op } = require('sequelize')
const authMiddleware = require('../middlewares/authMiddleware')

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    })

    // Get product counts for each category
    const result = await Promise.all(categories.map(async cat => {
      const count = await Product.count({ where: { categoryId: cat.id } })
      return {
        id: cat.id,
        name: cat.name,
        image: cat.image,
        description: cat.description,
        productCount: count
      }
    }))

    res.json(result)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// List products with pagination, search, and category filter
router.get('/', async (req, res) => {
  try {
    const q = req.query.q || req.query.search || ''
    const category = req.query.category || ''
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null
    const page = Number(req.query.page) || 1
    const pageSize = Math.min(Number(req.query.limit) || 100, 500)
    const sortBy = req.query.sort || 'newest'

    const where = {}

    // Search filter
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
        { brand: { [Op.like]: `%${q}%` } },
        { short: { [Op.like]: `%${q}%` } }
      ]
    }

    // Category filter
    if (category) {
      where.categoryId = category
    }

    // Price filters
    if (minPrice !== null) {
      where.price = { ...where.price, [Op.gte]: minPrice }
    }
    if (maxPrice !== null) {
      where.price = { ...where.price, [Op.lte]: maxPrice }
    }

    // Sorting
    let order = [['createdAt', 'DESC']]
    switch (sortBy) {
      case 'price-low':
        order = [['price', 'ASC']]
        break
      case 'price-high':
        order = [['price', 'DESC']]
        break
      case 'name':
        order = [['name', 'ASC']]
        break
      case 'rating':
        order = [['rating', 'DESC']]
        break
    }

    const products = await Product.findAll({
      where,
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: User, as: 'Seller', attributes: ['id', 'name', 'businessName', 'sellerVerified'] },
        { model: Specification, as: 'specifications', attributes: ['key', 'value'] }
      ],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order
    })

    const result = products.map(p => {
      const obj = p.toJSON()
      obj.category = obj.Category ? obj.Category.name : undefined
      obj.sellerName = obj.Seller?.businessName || obj.Seller?.name || 'Unknown Seller'
      obj.sellerVerified = obj.Seller?.sellerVerified || false

      // Parse specs if it's a string
      if (typeof obj.specs === 'string') {
        try { obj.specs = JSON.parse(obj.specs) } catch (e) { obj.specs = {} }
      }

      // Merge with relational specifications
      if (obj.specifications && Array.isArray(obj.specifications)) {
        const specsFromRel = obj.specifications.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {})
        obj.specs = { ...(obj.specs || {}), ...specsFromRel }
      }

      obj.specsData = obj.specs || {}

      // Parse features if it's a string
      if (typeof obj.features === 'string') {
        try { obj.features = JSON.parse(obj.features) } catch (e) { obj.features = [] }
      }

      return obj
    })

    res.json(result)
  } catch (e) {
    console.error('Products fetch error:', e)
    res.status(500).json({ error: e.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const p = await Product.findByPk(id, {
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: User, as: 'Seller', attributes: ['id', 'name', 'businessName', 'sellerVerified'] },
        { model: Specification, as: 'specifications', attributes: ['key', 'value'] },
        { model: Review, attributes: ['id', 'rating', 'text', 'userId', 'createdAt'], include: [{ model: User, attributes: ['name'] }] }
      ]
    })
    if (!p) return res.status(404).json({ error: 'Not found' })

    const obj = p.toJSON()
    obj.category = obj.Category ? obj.Category.name : undefined
    obj.sellerName = obj.Seller?.businessName || obj.Seller?.name || 'Unknown Seller'
    obj.sellerVerified = obj.Seller?.sellerVerified || false

    if (typeof obj.specs === 'string') {
      try { obj.specs = JSON.parse(obj.specs) } catch (e) { obj.specs = {} }
    }

    // Merge with relational specifications
    if (obj.specifications && Array.isArray(obj.specifications)) {
      const specsFromRel = obj.specifications.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {})
      obj.specs = { ...(obj.specs || {}), ...specsFromRel }
    }

    obj.specsData = obj.specs || {}

    if (typeof obj.features === 'string') {
      try { obj.features = JSON.parse(obj.features) } catch (e) { obj.features = [] }
    }

    // Format reviews for frontend
    obj.reviews = (obj.Reviews || []).map(r => ({
      id: r.id,
      rating: r.rating,
      text: r.text,
      userName: r.User?.name || 'Anonymous',
      createdAt: r.createdAt
    }))

    res.json(obj)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// create product (seller/admin)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
      return res.status(403).json({ error: 'Seller access required' })
    }

    const payload = req.body
    if (req.file) payload.image = `/public/uploads/${req.file.filename}`
    payload.sellerId = req.user.id

    const p = await Product.create(payload)
    res.status(201).json(p)
  } catch (e) { res.status(400).json({ error: e.message }) }
})

router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const id = Number(req.params.id)
    const p = await Product.findByPk(id)
    if (!p) return res.status(404).json({ error: 'Not found' })

    const user = await User.findByPk(req.user.id)
    if (user.role !== 'admin' && p.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own products' })
    }

    const payload = req.body
    if (req.file) payload.image = `/public/uploads/${req.file.filename}`
    await p.update(payload)
    res.json(p)
  } catch (e) { res.status(400).json({ error: e.message }) }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id)
    const p = await Product.findByPk(id)
    if (!p) return res.status(404).json({ error: 'Not found' })

    const user = await User.findByPk(req.user.id)
    if (user.role !== 'admin' && p.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own products' })
    }

    await Product.destroy({ where: { id } })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Add review to product
router.post('/:id/reviews', authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.id)
    const { rating, text } = req.body
    if (!rating || !text) {
      return res.status(400).json({ error: 'Rating and text required' })
    }
    const userId = req.user.id
    // Assuming Review model exists
    const review = await Review.create({
      productId,
      userId,
      rating,
      text
    })
    // Optionally, return user info
    const user = await User.findByPk(userId)
    res.json({
      id: review.id,
      rating: review.rating,
      text: review.text,
      userName: user?.name || 'Anonymous'
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router

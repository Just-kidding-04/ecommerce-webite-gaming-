const express = require('express')
const router = express.Router()
const { Address, User } = require('../models')
const authMiddleware = require('../middlewares/authMiddleware')

router.get('/', authMiddleware, async (req, res) => {
  try {
    // Verify user exists first
    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.json([]) // Return empty if user doesn't exist
    }
    
    const addresses = await Address.findAll({
      where: { userId: req.user.id },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    })
    
    // Return with frontend-friendly field names
    const formattedAddresses = addresses.map(addr => ({
      ...addr.toJSON(),
      fullName: addr.name,
      street: addr.line1,
      label: addr.line2 || 'Home',
      zipCode: addr.zip
    }))
    
    res.json(formattedAddresses)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    // Verify user exists first (important after DB recreation)
    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(401).json({ error: 'User not found. Please log out and log in again.' })
    }
    
    // Support both frontend field names (street, fullName, zipCode) and backend names (line1, name, zip)
    const { 
      name, fullName, phone, 
      line1, street, line2, 
      city, state, 
      zip, zipCode, 
      country, isDefault, label 
    } = req.body
    
    if (isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.user.id } })
    }
    
    const address = await Address.create({
      userId: req.user.id,
      name: name || fullName,
      phone,
      line1: line1 || street,
      line2: line2 || label,
      city,
      state,
      zip: zip || zipCode,
      country,
      isDefault: isDefault || false
    })
    
    // Return with frontend-friendly field names too
    res.status(201).json({
      ...address.toJSON(),
      fullName: address.name,
      street: address.line1,
      label: address.line2 || 'Home',
      zipCode: address.zip
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const address = await Address.findOne({
      where: { id: req.params.id, userId: req.user.id }
    })
    
    if (!address) {
      return res.status(404).json({ error: 'Address not found' })
    }
    
    // Support both frontend field names (street, fullName, zipCode) and backend names (line1, name, zip)
    const { 
      name, fullName, phone, 
      line1, street, line2, 
      city, state, 
      zip, zipCode, 
      country, isDefault, label 
    } = req.body
    
    if (isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.user.id } })
    }
    
    await address.update({ 
      name: name || fullName || address.name, 
      phone: phone || address.phone, 
      line1: line1 || street || address.line1, 
      line2: line2 || label || address.line2, 
      city: city || address.city, 
      state: state || address.state, 
      zip: zip || zipCode || address.zip, 
      country: country || address.country, 
      isDefault 
    })
    
    res.json({
      ...address.toJSON(),
      fullName: address.name,
      street: address.line1,
      label: address.line2 || 'Home',
      zipCode: address.zip
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Address.destroy({
      where: { id: req.params.id, userId: req.user.id }
    })
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.put('/:id/default', authMiddleware, async (req, res) => {
  try {
    await Address.update({ isDefault: false }, { where: { userId: req.user.id } })
    
    const address = await Address.findOne({
      where: { id: req.params.id, userId: req.user.id }
    })
    
    if (!address) {
      return res.status(404).json({ error: 'Address not found' })
    }
    
    await address.update({ isDefault: true })
    res.json({
      ...address.toJSON(),
      fullName: address.name,
      street: address.line1,
      label: address.line2 || 'Home',
      zipCode: address.zip
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router

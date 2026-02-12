const { CartItem, Product } = require('../models');

// Get all cart items for the logged-in user
exports.getCart = async (req, res) => {
  try {
    const cartItems = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product }]
    });
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
};

// Add a product to cart or update quantity if already exists
exports.addToCart = async (req, res) => {
  const { productId, qty } = req.body;
  if (!productId || !qty) return res.status(400).json({ error: 'Product and qty required' });

  try {
    // Check if product exists and has stock
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.stock < qty) return res.status(400).json({ error: 'Insufficient stock' });

    let cartItem = await CartItem.findOne({
      where: { userId: req.user.id, productId }
    });

    if (cartItem) {
      const newQty = cartItem.qty + qty;
      if (newQty > product.stock) {
        return res.status(400).json({ error: `Only ${product.stock} items available` });
      }
      cartItem.qty = newQty;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        userId: req.user.id,
        productId,
        qty
      });
    }
    
    // Return with product details
    const result = await CartItem.findOne({
      where: { id: cartItem.id },
      include: [{ model: Product }]
    });
    res.status(200).json(result);
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
};

// Update quantity of a cart item
exports.updateCartItem = async (req, res) => {
  const { cartItemId } = req.params;
  const { qty } = req.body;
  if (!qty) return res.status(400).json({ error: 'qty required' });

  try {
    const cartItem = await CartItem.findOne({
      where: { id: cartItemId, userId: req.user.id },
      include: [{ model: Product }]
    });
    if (!cartItem) return res.status(404).json({ error: 'Cart item not found' });

    // Check stock availability
    if (cartItem.Product && qty > cartItem.Product.stock) {
      return res.status(400).json({ error: `Only ${cartItem.Product.stock} items available` });
    }

    cartItem.qty = qty;
    await cartItem.save();
    res.json(cartItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cart item' });
  }
};

// Remove an item from cart
exports.removeCartItem = async (req, res) => {
  const { cartItemId } = req.params;
  try {
    const deleted = await CartItem.destroy({
      where: { id: cartItemId, userId: req.user.id }
    });
    if (!deleted) return res.status(404).json({ error: 'Cart item not found' });
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
};

// Clear all cart items for the user
exports.clearCart = async (req, res) => {
  try {
    await CartItem.destroy({
      where: { userId: req.user.id }
    });
    res.json({ message: 'Cart cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};

// Get cart count/summary
exports.getCartSummary = async (req, res) => {
  try {
    const cartItems = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product }]
    });
    
    const itemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cartItems.reduce((sum, item) => {
      return sum + (item.Product?.price || 0) * item.qty;
    }, 0);
    
    res.json({ itemCount, totalPrice, items: cartItems.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get cart summary' });
  }
};

// Example: If you have any email sending logic in cartController.js, update it like this:
// let senderEmail = req.body.mail || undefined;
// let smtpUser = req.body.smtpUser || undefined;
// let smtpPass = req.body.smtpPass || undefined;
// sendMail({ to, subject, html, from: senderEmail, smtpUser, smtpPass });

const { Order, OrderItem, CartItem, Product, User, Address, StoreSettings, sequelize } = require('../models');
const { sendMail } = require('../utils/email');

// Place order from cart (accepts items from frontend)
exports.placeOrder = async (req, res) => {
  const userId = req.user.id;
  try {
    // Get items from request body (sent from frontend)
    const { items, total, address, addressId, paymentMethod, subtotal, shipping, tax } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty', success: false });
    }

    // Get address - either from addressId or direct address object
    let shippingAddress = address;
    if (addressId && !address) {
      const addressRecord = await Address.findOne({
        where: { id: addressId, userId }
      });
      if (addressRecord) {
        shippingAddress = {
          fullName: addressRecord.name,
          phone: addressRecord.phone,
          line1: addressRecord.line1,
          line2: addressRecord.line2,
          city: addressRecord.city,
          state: addressRecord.state,
          zip: addressRecord.zip,
          country: addressRecord.country
        };
      }
    }

    // Validate address
    if (!shippingAddress) {
      return res.status(400).json({ error: 'Shipping address is required', success: false });
    }

    // Fetch product details for each item to ensure we have accurate data
    // Support both 'id' and 'productId' field names from frontend
    const productIds = items.map(item => item.productId || item.id);
    const products = await Product.findAll({ where: { id: productIds } });
    const productMap = {};
    products.forEach(p => { productMap[p.id] = p; });

    // Calculate total from items to verify (including tax and shipping)
    const calculatedSubtotal = items.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
    const calculatedTotal = total || (calculatedSubtotal + (shipping || 0) + (tax || 0));

    // Create the order
    const order = await Order.create({
      userId,
      total: calculatedTotal,
      subtotal: subtotal || calculatedSubtotal,
      shipping: shipping || 0,
      tax: tax || 0,
      status: 'pending',
      paymentMethod: paymentMethod || 'cod',
      address: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress)
    });

    // Create order items with product name and image
    const orderItems = await Promise.all(items.map(item => {
      const itemProductId = item.productId || item.id;
      const product = productMap[itemProductId] || {};
      return OrderItem.create({
        orderId: order.id,
        productId: itemProductId,
        qty: item.qty || 1,
        price: item.price,
        name: product.name || item.name || 'Unknown Product',
        image: product.image || item.image || null
      });
    }));

    // Clear user's cart after successful order
    await CartItem.destroy({ where: { userId } });

    res.status(201).json({
      success: true,
      id: order.id,
      orderId: order.id,
      order,
      orderItems
    });

    // Send order confirmation email to user using .env/config credentials
    const user = await User.findByPk(userId);
    if (user && user.email) {
      try {
        // Build order items table
        const itemsTable = orderItems.map(item =>
          `<tr>
            <td>${item.name}</td>
            <td>${item.qty}</td>
            <td>₹${item.price}</td>
            <td>₹${(item.price * item.qty).toFixed(2)}</td>
          </tr>`
        ).join('');

        // Format address
        let addressHtml = '';
        if (order.address) {
          try {
            const addr = typeof order.address === 'string' ? JSON.parse(order.address) : order.address;
            addressHtml = `${addr.line1 || ''}, ${addr.line2 || ''}, ${addr.city || ''}, ${addr.state || ''}, ${addr.zip || ''}, ${addr.country || ''}`;
          } catch { addressHtml = order.address; }
        }

        const html = `
          <div style="font-family:Arial,sans-serif;color:#222">
            <h1 style="background:#4f46e5;color:#fff;padding:20px;text-align:center">Thank you for your order!</h1>
            <div style="padding:20px">
              <p>Hi ${user.name || ''},</p>
              <p>Your order <b>#${order.id}</b> has been received and is being processed.</p>
              <h2>Order Details</h2>
              <table style="width:100%;border-collapse:collapse">
                <thead>
                  <tr><th style="border:1px solid #eee;padding:8px">Product</th><th style="border:1px solid #eee;padding:8px">Qty</th><th style="border:1px solid #eee;padding:8px">Price</th><th style="border:1px solid #eee;padding:8px">Subtotal</th></tr>
                </thead>
                <tbody>${itemsTable}</tbody>
              </table>
              <p><b>Total:</b> ₹${order.total}</p>
              <p><b>Shipping Address:</b> ${addressHtml}</p>
              <p>If you have any questions, reply to this email or contact our support.</p>
            </div>
            <div style="margin-top:30px;color:#888;font-size:13px">&copy; ${new Date().getFullYear()} GamingStore. All rights reserved.</div>
          </div>
        `;
        await sendMail({
          to: user.email,
          subject: `Order Confirmation - Gaming Store #${order.id}`,
          html
        });
      } catch (mailErr) {
        console.error('Order email error:', mailErr);
      }
    }
  } catch (err) {
    console.error('Order placement error:', err);
    res.status(500).json({ error: 'Failed to place order', details: err.message, success: false });
  }
};

// Get order history for user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{ model: OrderItem, include: [Product] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: OrderItem, include: [Product] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findOne({
      where: { id: orderId, userId: req.user.id },
      include: [{ model: OrderItem, include: [Product] }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// Update order status (admin)
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  try {
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findOne({
      where: { id: orderId, userId: req.user.id }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'delivered' || order.status === 'shipped') {
      return res.status(400).json({ error: 'Cannot cancel order that has been shipped or delivered' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};
// Validate Coupon
exports.validateCoupon = async (req, res) => {
  const { code, amount } = req.body;
  try {
    const coupon = await sequelize.models.Coupon.findOne({ where: { code } });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'Coupon is inactive' });
    }

    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }

    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    if (amount < coupon.minPurchase) {
      return res.status(400).json({ success: false, message: `Minimum purchase of $${coupon.minPurchase} required` });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed total amount
    if (discount > amount) {
      discount = amount;
    }

    res.json({
      success: true,
      couponCode: code,
      discount,
      newTotal: amount - discount,
      message: 'Coupon applied successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error validating coupon' });
  }
};

// Create Coupon (Admin)
exports.createCoupon = async (req, res) => {
  // Basic admin check - in real app use middleware
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const coupon = await sequelize.models.Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create coupon', details: err.message });
  }
};

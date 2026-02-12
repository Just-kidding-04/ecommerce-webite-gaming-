const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const protect = require('../middlewares/authMiddleware');

router.post('/', protect, orderController.placeOrder);

router.get('/my', protect, orderController.getUserOrders);

router.get('/:orderId', protect, orderController.getOrderById);

// Admin: get all orders
router.get('/', protect, async (req, res, next) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  next();
}, orderController.getAllOrders);

// Admin: update order status
router.put('/:orderId/status', protect, async (req, res, next) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  next();
}, orderController.updateOrderStatus);

// Cancel order
router.put('/:orderId/cancel', protect, orderController.cancelOrder);

// Coupon routes
router.post('/coupon/validate', protect, orderController.validateCoupon);
router.post('/coupon/create', protect, orderController.createCoupon);

module.exports = router;

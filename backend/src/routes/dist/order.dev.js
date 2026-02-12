"use strict";

var express = require('express');

var router = express.Router();

var orderController = require('../controllers/orderController');

var protect = require('../middlewares/authMiddleware');

router.post('/', protect, orderController.placeOrder);
router.get('/my', protect, orderController.getUserOrders);
router.get('/:orderId', protect, orderController.getOrderById); // Admin: get all orders

router.get('/', protect, function _callee(req, res, next) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (req.user.isAdmin) {
            _context.next = 2;
            break;
          }

          return _context.abrupt("return", res.status(403).json({
            error: 'Forbidden'
          }));

        case 2:
          next();

        case 3:
        case "end":
          return _context.stop();
      }
    }
  });
}, orderController.getAllOrders); // Admin: update order status

router.put('/:orderId/status', protect, function _callee2(req, res, next) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (req.user.isAdmin) {
            _context2.next = 2;
            break;
          }

          return _context2.abrupt("return", res.status(403).json({
            error: 'Forbidden'
          }));

        case 2:
          next();

        case 3:
        case "end":
          return _context2.stop();
      }
    }
  });
}, orderController.updateOrderStatus); // Cancel order

router.put('/:orderId/cancel', protect, orderController.cancelOrder); // Coupon routes

router.post('/coupon/validate', protect, orderController.validateCoupon);
router.post('/coupon/create', protect, orderController.createCoupon);
module.exports = router;
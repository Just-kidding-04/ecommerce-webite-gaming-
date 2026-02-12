const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const protect = require('../middlewares/authMiddleware');

router.get('/', protect, cartController.getCart);
router.get('/summary', protect, cartController.getCartSummary);
router.post('/', protect, cartController.addToCart);
router.put('/:cartItemId', protect, cartController.updateCartItem);
router.delete('/clear', protect, cartController.clearCart);
router.delete('/:cartItemId', protect, cartController.removeCartItem);

module.exports = router;

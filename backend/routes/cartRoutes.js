const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  applyOffer,
  removeOffer
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect); // All cart routes require authentication

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route('/:productId')
  .delete(removeFromCart)
  .put(updateCartItem);

// Offer routes
router.post('/apply-offer', applyOffer);
router.delete('/remove-offer', removeOffer);

module.exports = router;
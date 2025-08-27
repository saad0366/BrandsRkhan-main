const express = require('express');
const router = express.Router();
const {
  createOffer,
  getOffers,
  getActiveOffers,
  getOffer,
  updateOffer,
  deleteOffer,
  applyOfferToCart,
  validateOffer
} = require('../controllers/offerController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/active', getActiveOffers);

// User routes (protected)
router.post('/apply', protect, applyOfferToCart);
router.post('/validate', protect, validateOffer);

// Admin routes
router.use(protect);
router.use(authorize('admin'));



router.route('/')
  .get(getOffers)
  .post(upload.any(), createOffer);

router.route('/:id')
  .get(getOffer)
  .put(upload.any(), updateOffer)
  .delete(deleteOffer);

module.exports = router;
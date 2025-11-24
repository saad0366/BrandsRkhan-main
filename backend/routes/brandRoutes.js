const express = require('express');
const { getBrands, addBrand, deleteBrand } = require('../controllers/brandController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getBrands)
  .post(protect, authorize('admin'), addBrand);

router.route('/:id')
  .delete(protect, authorize('admin'), deleteBrand);

module.exports = router;
const express = require('express');
const { getCategories, addCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, authorize('admin'), addCategory);

router.route('/:id')
  .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;
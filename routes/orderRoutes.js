const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// Place order
router.post('/', protect, orderController.placeOrder);
// Get user's orders
router.get('/myorders', protect, orderController.getMyOrders);
// Get all orders (admin, with filters/pagination)
router.get('/', protect, authorize('admin'), orderController.getAllOrders);
// Order stats (admin)
router.get('/stats', protect, authorize('admin'), orderController.getOrderStats);
// Get order by ID
router.get('/:id', protect, orderController.getOrderById);
// Cancel order (user)
router.patch('/:id/cancel', protect, orderController.cancelOrder);
// Reorder (user)
router.post('/:id/reorder', protect, orderController.reorder);
// Update order status (admin)
router.patch('/:id/status', protect, authorize('admin'), orderController.updateOrderStatus);

module.exports = router; 
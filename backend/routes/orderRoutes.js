const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { getInvoiceInfo } = require('../utils/cleanupInvoices');
const path = require('path');

// Protected routes
router.use(protect);

// User routes
router.post('/', orderController.placeOrder);
router.get('/myorders', orderController.getMyOrders);

// Admin routes
router.get('/stats', authorize('admin'), orderController.getOrderStats);
router.get('/', authorize('admin'), orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/cancel', orderController.cancelOrder);
router.post('/:id/reorder', orderController.reorder);

// Download invoice (user and admin)
router.get('/:id/invoice', async (req, res) => {
  try {
    // First check if user has access to this order
    const order = await orderController.getOrderById(req, res);
    if (res.statusCode !== 200) return; // Error already handled
    
    const invoiceInfo = getInvoiceInfo(req.params.id);
    if (!invoiceInfo.exists) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.download(invoiceInfo.filepath, invoiceInfo.filename);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 
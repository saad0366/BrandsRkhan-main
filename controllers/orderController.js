const Order = require('../models/Order');
const User = require('../models/User');
const { sendEmail, sendInvoiceEmail, sendReorderConfirmationEmail } = require('../utils/sendEmail');
const generateInvoice = require('../utils/generateInvoice');
const mongoose = require('mongoose');

// Place a new order
exports.placeOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ error: 'No order items' });
    }
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
    });
    const createdOrder = await order.save();
    
    // Generate and send invoice
    try {
      const user = await User.findById(req.user._id);
      const { filepath, invoiceNumber } = await generateInvoice(createdOrder, user);
      await sendInvoiceEmail(user.email, createdOrder._id.toString(), invoiceNumber, filepath);
      console.log(`Invoice generated and sent for order ${createdOrder._id}`);
    } catch (invoiceError) {
      console.error('Error generating/sending invoice:', invoiceError);
      // Don't fail the order if invoice generation fails
    }
    
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get logged-in user's orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all orders (admin) with filtering and pagination
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, user, status, startDate, endDate, search } = req.query;
    const query = {};
    if (user) query.user = user;
    if (status) {
      if (status === 'paid') query.isPaid = true;
      else if (status === 'pending') query.isPaid = false;
      // Add more status logic as needed
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      // Search by user email or name
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      });
      query.user = { $in: users.map(u => u._id) };
    }
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    // Only allow owner or admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel order (user)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'email');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.user._id.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Not authorized' });
    if (order.isPaid) return res.status(400).json({ error: 'Cannot cancel a paid order' });
    order.status = 'cancelled';
    await order.save();
    await sendEmail(order.user.email, 'Order Cancelled', `Your order #${order._id} has been cancelled.`, `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ffeaa7;">
        <h1 style="color: #856404; margin: 0; text-align: center;">Order Cancelled</h1>
      </div>
      
      <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">Dear Customer,</p>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          We have received your request to cancel your order. Your order has been successfully cancelled as requested.
        </p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #333; margin: 0 0 10px 0;">Cancelled Order Details:</h3>
          <p style="margin: 5px 0; color: #666;"><strong>Order ID:</strong> ${order._id}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Cancellation Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h4 style="color: #856404; margin: 0 0 10px 0;">Important Information:</h4>
          <ul style="color: #333; margin: 0; padding-left: 20px;">
            <li>If you had already paid for this order, a refund will be processed</li>
            <li>Refunds typically take 3-5 business days to appear in your account</li>
            <li>You can place a new order anytime through your account</li>
          </ul>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          We're sorry to see you go, but we understand that circumstances change. If you change your mind, you can always place a new order with the same items through your account.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666; font-size: 14px;">We hope to see you again soon!</p>
          <p style="color: #999; font-size: 12px;">This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </div>
    `);
    res.json({ message: 'Order cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reorder (user)
exports.reorder = async (req, res) => {
  try {
    const oldOrder = await Order.findById(req.params.id);
    if (!oldOrder) return res.status(404).json({ error: 'Order not found' });
    if (oldOrder.user.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Not authorized' });
    const newOrder = new Order({
      user: req.user._id,
      orderItems: oldOrder.orderItems,
      shippingAddress: oldOrder.shippingAddress,
      paymentMethod: oldOrder.paymentMethod,
      totalPrice: oldOrder.totalPrice,
    });
    await newOrder.save();
    
    // Send reorder confirmation email
    try {
      const user = await User.findById(req.user._id);
      await sendReorderConfirmationEmail(user.email, newOrder._id.toString());
      console.log(`Reorder confirmation email sent for order ${newOrder._id}`);
    } catch (confirmationError) {
      console.error('Error sending reorder confirmation email:', confirmationError);
      // Don't fail the reorder if confirmation email fails
    }
    
    // Generate and send invoice for reorder
    try {
      const user = await User.findById(req.user._id);
      const { filepath, invoiceNumber } = await generateInvoice(newOrder, user);
      await sendInvoiceEmail(user.email, newOrder._id.toString(), invoiceNumber, filepath);
      console.log(`Invoice generated and sent for reorder ${newOrder._id}`);
    } catch (invoiceError) {
      console.error('Error generating/sending invoice for reorder:', invoiceError);
      // Don't fail the reorder if invoice generation fails
    }
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update order status (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'email');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const { status } = req.body;
    if (status === 'paid') {
      order.isPaid = true;
      order.paidAt = new Date();
    }
    if (status === 'delivered') {
        order.isDelivered = true;
      order.deliveredAt = new Date();
    }
    await order.save();
    await sendEmail(order.user.email, 'Order Status Updated', `Your order #${order._id} status is now ${status}.`);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrderStats = async (req, res) => {
  let totalOrders = 0, paidOrders = 0, deliveredOrders = 0, pendingOrders = 0, totalRevenue = 0;
  let errorMessages = [];
  // Check MongoDB connection
  if (mongoose.connection.readyState !== 1) {
    errorMessages.push('MongoDB is not connected');
    return res.status(200).json({ totalOrders, paidOrders, deliveredOrders, pendingOrders, totalRevenue, errors: errorMessages });
  }
  try {
    try { totalOrders = await Order.countDocuments(); } catch (e) { errorMessages.push('Error counting total orders: ' + e.message); }
    try { paidOrders = await Order.countDocuments({ isPaid: true }); } catch (e) { errorMessages.push('Error counting paid orders: ' + e.message); }
    try { deliveredOrders = await Order.countDocuments({ isDelivered: true }); } catch (e) { errorMessages.push('Error counting delivered orders: ' + e.message); }
    try { pendingOrders = await Order.countDocuments({ isPaid: false }); } catch (e) { errorMessages.push('Error counting pending orders: ' + e.message); }
    try {
      const totalRevenueAgg = await Order.aggregate([
        { $match: { isPaid: true, totalPrice: { $type: 'number' } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
      ]);
      totalRevenue = totalRevenueAgg[0]?.total || 0;
    } catch (aggError) {
      errorMessages.push('Revenue aggregation error: ' + aggError.message);
    }
    res.json({ totalOrders, paidOrders, deliveredOrders, pendingOrders, totalRevenue, errors: errorMessages });
  } catch (error) {
    errorMessages.push('Order stats error: ' + error.message);
    res.status(200).json({ totalOrders, paidOrders, deliveredOrders, pendingOrders, totalRevenue, errors: errorMessages });
  }
}; 
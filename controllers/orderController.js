const Order = require('../models/Order');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

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
    await sendEmail(order.user.email, 'Order Cancelled', `Your order #${order._id} has been cancelled.`);
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
    await sendEmail(req.user.email, 'Order Placed', `Your reorder #${newOrder._id} has been placed.`);
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
  try {
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ isPaid: true });
    const deliveredOrders = await Order.countDocuments({ isDelivered: true });
    const pendingOrders = await Order.countDocuments({ isPaid: false });
    const totalRevenueAgg = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    res.json({ totalOrders, paidOrders, deliveredOrders, pendingOrders, totalRevenue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 
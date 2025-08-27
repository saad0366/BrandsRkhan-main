const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  discountedPrice: { type: Number },
  offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
});

const shippingAddressSchema = new mongoose.Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: { type: String, required: true },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    status: { 
      type: String, 
      enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'], 
      default: 'pending' 
    },
    // Add appliedOffer field
    appliedOffer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      default: null
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema); 
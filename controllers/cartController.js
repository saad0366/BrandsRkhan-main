const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Offer = require('../models/Offer');
const mongoose = require('mongoose');

// @desc    Apply offer to cart
// @route   POST /api/v1/cart/apply-offer
// @access  Private
exports.applyOffer = async (req, res) => {
  try {
    const { offerId } = req.body;

    if (!offerId || !mongoose.Types.ObjectId.isValid(offerId)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid offer ID'
      });
    }

    // Find cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    // Find offer
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found'
      });
    }

    // Validate offer
    if (!offer.active || new Date() < offer.startDate || new Date() > offer.endDate) {
      return res.status(400).json({
        success: false,
        error: 'Offer is not active or has expired'
      });
    }

    // Calculate cart subtotal
    const subtotal = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Check minimum purchase amount
    if (offer.minimumPurchaseAmount && subtotal < offer.minimumPurchaseAmount) {
      return res.status(400).json({
        success: false,
        error: `Minimum purchase amount of $${offer.minimumPurchaseAmount} required`
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (offer.discountPercentage) {
      discountAmount = (subtotal * offer.discountPercentage) / 100;
      
      // Apply maximum discount if set
      if (offer.maximumDiscountAmount && discountAmount > offer.maximumDiscountAmount) {
        discountAmount = offer.maximumDiscountAmount;
      }
    }

    // Update cart with offer
    cart.appliedOffer = offer._id;
    cart.discountAmount = discountAmount;
    cart.subtotalPrice = subtotal;
    cart.totalPrice = subtotal - discountAmount;
    
    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
      message: `Offer applied successfully! You saved $${discountAmount.toFixed(2)}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Remove offer from cart
// @route   DELETE /api/v1/cart/remove-offer
// @access  Private
exports.removeOffer = async (req, res) => {
  try {
    // Find cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    // Remove offer
    cart.appliedOffer = null;
    cart.discountAmount = 0;
    
    // Recalculate totals
    cart.subtotalPrice = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    cart.totalPrice = cart.subtotalPrice;
    
    await cart.save();

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get user cart
// @route   GET /api/v1/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('appliedOffer', 'name discountPercentage');

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalPrice: 0
      });
    }

    // Populate product categories for offer matching
    if (cart.items && cart.items.length > 0) {
      for (let item of cart.items) {
        const product = await Product.findById(item.product).select('category');
        if (product) {
          item.category = product.category;
        }
      }
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/v1/cart
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Create new cart if doesn't exist
      cart = await Cart.create({
        user: req.user._id,
        items: [{
          product: productId,
          name: product.name,
          quantity,
          price: product.price,
          image: product.images[0],
          category: product.category
        }]
      });
    } else {
      // Check if product already in cart
      const existingItem = cart.items.find(
        item => item.product.toString() === productId
      );

      if (existingItem) {
        // Add to existing quantity
        const newQuantity = existingItem.quantity + quantity;
        
        // Check if product is in stock
        if (product.stock < newQuantity) {
          return res.status(400).json({
            success: false,
            error: 'Product is out of stock'
          });
        }
        
        existingItem.quantity = newQuantity;
      } else {
        // Check if product is in stock for new item
        if (product.stock < quantity) {
          return res.status(400).json({
            success: false,
            error: 'Product is out of stock'
          });
        }
        
        // Add new item if product doesn't exist
        cart.items.push({
          product: productId,
          name: product.name,
          quantity,
          price: product.price,
          image: product.images[0],
          category: product.category
        });
      }

      await cart.save();
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== req.params.productId
    );

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/v1/cart/:productId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    const item = cart.items.find(
      item => item.product.toString() === req.params.productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in cart'
      });
    }

    // Check if product is in stock
    const product = await Product.findById(req.params.productId);
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Product is out of stock'
      });
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/v1/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
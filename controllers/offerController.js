const Offer = require('../models/Offer');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');
const { exportOfferAnalytics } = require('../utils/exportReports');

// @desc    Create new offer
// @route   POST /api/v1/offers
// @access  Private/Admin
exports.createOffer = async (req, res) => {
  try {
    const {
      name,
      description,
      discountPercentage,
      startDate,
      endDate,
      applicableProducts,
      applicableCategories,
      minimumPurchaseAmount,
      maximumDiscountAmount,
      usageLimit
    } = req.body;

    // Validate required fields
    if (!name || !description || !discountPercentage || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields: name, description, discountPercentage, startDate, endDate'
      });
    }

    // Upload banner image to cloudinary
    let bannerImage = 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=400&fit=crop&crop=center'; // Default image
    if (req.files) {
      // Handle files from upload.any()
      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      
      if (files && files.length > 0) {
        try {
          // Use the first file as banner image
          const result = await cloudinary.uploader.upload(files[0].path);
          bannerImage = result.secure_url;
          // Remove file from uploads folder
          if (fs.existsSync(files[0].path)) {
            fs.unlinkSync(files[0].path);
          }
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          // Continue with default image if upload fails
        }
      }
    }

    // Parse and validate data
    const parsedDiscountPercentage = Number(discountPercentage);
    if (isNaN(parsedDiscountPercentage) || parsedDiscountPercentage <= 0 || parsedDiscountPercentage > 100) {
      return res.status(400).json({
        success: false,
        error: 'Discount percentage must be a number between 1 and 100'
      });
    }

    const offer = await Offer.create({
      name: String(name).trim(),
      description: String(description).trim(),
      discountPercentage: parsedDiscountPercentage,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      bannerImage,
      applicableProducts: Array.isArray(applicableProducts) ? applicableProducts : [],
      applicableCategories: Array.isArray(applicableCategories) ? applicableCategories : [],
      minimumPurchaseAmount: Number(minimumPurchaseAmount) || 0,
      maximumDiscountAmount: maximumDiscountAmount ? Number(maximumDiscountAmount) : undefined,
      usageLimit: Number(usageLimit) || -1
    });

    res.status(201).json({
      success: true,
      data: offer
    });
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create offer'
    });
  }
};

// @desc    Get all offers
// @route   GET /api/v1/offers
// @access  Private/Admin
exports.getOffers = async (req, res) => {
  try {
    const offers = await Offer.find().populate('applicableProducts', 'name price images');
    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get active offers
// @route   GET /api/v1/offers/active
// @access  Public
exports.getActiveOffers = async (req, res) => {
  try {
    const now = new Date();
    const { category, minPurchase, productId } = req.query;
    
    // Base query for active offers
    const query = {
      active: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    };
    
    // Add usage limit check only if usageLimit exists and is not -1
    const offers = await Offer.find(query)
      .populate('applicableProducts', 'name price images')
      .sort({ discountPercentage: -1 }) // Sort by highest discount first
      .lean(); // Use lean for better performance
    
    // Filter offers based on usage limit
    const validOffers = offers.filter(offer => {
      try {
        if (!offer) return false;
        if (offer.usageLimit === -1) return true;
        return (offer.usedCount || 0) < offer.usageLimit;
      } catch (filterError) {
        console.warn('Error filtering offer:', filterError);
        return false;
      }
    });
    
    res.status(200).json({
      success: true,
      count: validOffers.length,
      data: validOffers
    });
  } catch (error) {
    console.error('Error in getActiveOffers:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch active offers'
    });
  }
};

// @desc    Get single offer
// @route   GET /api/v1/offers/:id
// @access  Private/Admin
exports.getOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: offer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update offer
// @route   PUT /api/v1/offers/:id
// @access  Private/Admin
exports.updateOffer = async (req, res) => {
  try {
    const {
      name,
      description,
      discountPercentage,
      startDate,
      endDate,
      active,
      applicableProducts,
      applicableCategories,
      minimumPurchaseAmount,
      maximumDiscountAmount,
      usageLimit
    } = req.body;

    let updateData = {
      name,
      description,
      discountPercentage,
      startDate,
      endDate,
      active,
      applicableProducts,
      applicableCategories,
      minimumPurchaseAmount,
      maximumDiscountAmount,
      usageLimit
    };

    // Upload new banner image if provided
    if (req.files) {
      // Handle files from upload.any()
      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      
      if (files && files.length > 0) {
        // Use the first file as banner image
        const result = await cloudinary.uploader.upload(files[0].path);
        updateData.bannerImage = result.secure_url;
        fs.unlinkSync(files[0].path);
      }
    }

    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: offer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Apply offer to cart
// @route   POST /api/v1/offers/apply
// @access  Private
exports.applyOfferToCart = async (req, res) => {
  try {
    const { offerId, cartId, cartTotal } = req.body;
    
    if (!offerId || !cartId || !cartTotal) {
      return res.status(400).json({
        success: false,
        error: 'Please provide offer ID, cart ID and cart total'
      });
    }

    // Find the offer
    const offer = await Offer.findById(offerId);
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found'
      });
    }
    
    // Check if offer is valid
    if (!offer.isValid()) {
      return res.status(400).json({
        success: false,
        error: 'Offer is not valid or has expired'
      });
    }
    
    // Check minimum purchase amount
    if (cartTotal < offer.minimumPurchaseAmount) {
      return res.status(400).json({
        success: false,
        error: `Minimum purchase amount of ${offer.minimumPurchaseAmount} required for this offer`
      });
    }
    
    // Calculate discount
    const discountAmount = offer.calculateDiscount(cartTotal);
    
    // Return discount information
    res.status(200).json({
      success: true,
      data: {
        offerId: offer._id,
        offerName: offer.name,
        discountPercentage: offer.discountPercentage,
        discountAmount,
        finalTotal: cartTotal - discountAmount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Validate offer
// @route   POST /api/v1/offers/validate
// @access  Private
exports.validateOffer = async (req, res) => {
  try {
    const { offerId, userId, cartTotal, products } = req.body;
    
    // Find the offer
    const offer = await Offer.findById(offerId);
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found'
      });
    }
    
    // Check if offer is active and within date range
    const now = new Date();
    if (!offer.active || now < offer.startDate || now > offer.endDate) {
      return res.status(400).json({
        success: false,
        error: 'Offer is not active or has expired'
      });
    }
    
    // Check usage limit
    if (offer.usageLimit !== -1 && offer.usedCount >= offer.usageLimit) {
      return res.status(400).json({
        success: false,
        error: 'Offer usage limit has been reached'
      });
    }
    
    // Check minimum purchase amount
    if (cartTotal < offer.minimumPurchaseAmount) {
      return res.status(400).json({
        success: false,
        error: `Minimum purchase amount of ${offer.minimumPurchaseAmount} required`
      });
    }
    
    // Check if products are eligible (if applicable)
    let isEligible = true;
    if (offer.applicableProducts && offer.applicableProducts.length > 0) {
      if (!products || products.length === 0) {
        isEligible = false;
      } else {
        const productIds = products.map(p => p.toString());
        const hasEligibleProduct = productIds.some(id => 
          offer.applicableProducts.map(p => p.toString()).includes(id)
        );
        if (!hasEligibleProduct) {
          isEligible = false;
        }
      }
    }
    
    if (!isEligible) {
      return res.status(400).json({
        success: false,
        error: 'Cart does not contain eligible products for this offer'
      });
    }
    
    // Calculate discount
    const discountAmount = offer.calculateDiscount(cartTotal);
    
    res.status(200).json({
      success: true,
      data: {
        valid: true,
        discountAmount,
        finalTotal: cartTotal - discountAmount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete offer
// @route   DELETE /api/v1/offers/:id
// @access  Private/Admin
exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found'
      });
    }

    // Delete banner image from cloudinary
    if (offer.bannerImage) {
      const publicId = offer.bannerImage.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await Offer.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get offer analytics
// @route   GET /api/v1/offers/analytics
// @access  Private/Admin
// @desc    Export offer analytics report
// @route   GET /api/v1/offers/export-report
// @access  Private/Admin
exports.exportOfferReport = async (req, res) => {
  try {
    const { format = 'pdf', startDate, endDate } = req.query;
    
    // Validate format
    if (!['pdf', 'excel', 'csv'].includes(format.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid export format. Supported formats: pdf, excel, csv'
      });
    }
    
    // Get analytics data
    const analyticsData = await getAnalyticsData(startDate, endDate);
    
    // Export the data
    const result = await exportOfferAnalytics(
      analyticsData,
      format,
      'offer-analytics-report'
    );
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to export report'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        filePath: result.filePath,
        format
      }
    });
  } catch (error) {
    console.error('Error exporting offer report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Helper function to get analytics data
const getAnalyticsData = async (startDate, endDate) => {
  const Order = require('../models/Order');
  const Product = require('../models/Product');
  
  // Get date range from query params or use default (last 30 days)
  const queryStartDate = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const queryEndDate = endDate ? new Date(endDate) : new Date();
  
  // Set end of day for end date
  queryEndDate.setHours(23, 59, 59, 999);
  
  // Get all offers
  const offers = await Offer.find();
  
  // Get orders within date range with applied offers
  const orders = await Order.find({ 
    appliedOffer: { $ne: null }, 
    isPaid: true,
    createdAt: { $gte: queryStartDate, $lte: queryEndDate }
  }).populate('orderItems.product', 'name category').catch(() => []);
  
  // Calculate overall statistics
  const totalOffers = offers.length;
  const activeOffers = offers.filter(offer => 
    offer.active && offer.startDate <= new Date() && offer.endDate >= new Date()
  ).length;
  
  // Get expired offers count
  const expiredOffers = offers.filter(offer => 
    offer.endDate < new Date()
  ).length;
  
  // Get upcoming offers count
  const upcomingOffers = offers.filter(offer => 
    offer.startDate > new Date()
  ).length;
  
  // Calculate total discount amount given
  const totalDiscountAmount = orders.reduce((sum, order) => 
    sum + (order.discountAmount || 0), 0
  );
  
  // Aggregate analytics per offer
  const analytics = offers.map(offer => {
    const redemptions = offer.usedCount || 0;
    const offerOrders = orders.filter(order => 
      order.appliedOffer && order.appliedOffer.toString() === offer._id.toString()
    );
    
    const revenue = offerOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const discountGiven = offerOrders.reduce((sum, order) => sum + (order.discountAmount || 0), 0);
    
    // Calculate conversion rate (orders with offer / total orders with offers)
    const conversionRate = orders.length > 0 ? (offerOrders.length / orders.length) * 100 : 0;
    
    // Calculate average order value with this offer
    const avgOrderValue = offerOrders.length > 0 ? revenue / offerOrders.length : 0;
    
    // Get most popular products purchased with this offer
    const productCounts = {};
    offerOrders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product._id.toString();
        productCounts[productId] = (productCounts[productId] || 0) + item.quantity;
      });
    });
    
    // Convert to array and sort
    const popularProducts = Object.entries(productCounts)
      .map(([productId, count]) => {
        const product = offerOrders.flatMap(o => o.items)
          .find(i => i.product._id.toString() === productId)?.product;
        return {
          productId,
          name: product ? product.name : 'Unknown Product',
          category: product ? product.category : 'Unknown',
          count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    
    // Offer type: % off, BOGO, etc.
    const type = offer.discountPercentage ? '% OFF' : 'Other';
    
    // Calculate ROI (Return on Investment) - revenue generated vs discount given
    const roi = discountGiven > 0 ? ((revenue - discountGiven) / discountGiven) * 100 : 0;
    
    return {
      offerId: offer._id,
      name: offer.name,
      redemptions,
      revenue: parseFloat(revenue.toFixed(2)),
      discountGiven: parseFloat(discountGiven.toFixed(2)),
      roi: parseFloat(roi.toFixed(2)),
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      type,
      discountPercentage: offer.discountPercentage,
      startDate: offer.startDate,
      endDate: offer.endDate,
      active: offer.active,
      popularProducts,
      ordersCount: offerOrders.length
    };
  });
  
  // Most popular offer types
  const typeCounts = analytics.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {});
  
  // Get top performing offers by different metrics
  const topOffersByRedemptions = [...analytics].sort((a, b) => b.redemptions - a.redemptions).slice(0, 5);
  const topOffersByRevenue = [...analytics].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const topOffersByROI = [...analytics].sort((a, b) => b.roi - a.roi).slice(0, 5);
  
  // Calculate total redemptions
  const totalRedemptions = offers.reduce((sum, offer) => sum + (offer.usedCount || 0), 0);
  
  // Calculate average discount percentage
  const averageDiscount = offers.length > 0 
    ? offers.reduce((sum, offer) => sum + (offer.discountPercentage || 0), 0) / offers.length 
    : 0;
  
  // Get category performance with offers
  const categoryPerformance = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (item.product && item.product.category) {
        const category = item.product.category;
        if (!categoryPerformance[category]) {
          categoryPerformance[category] = {
            orderCount: 0,
            revenue: 0,
            itemCount: 0
          };
        }
        categoryPerformance[category].orderCount++;
        categoryPerformance[category].revenue += item.price * item.quantity;
        categoryPerformance[category].itemCount += item.quantity;
      }
    });
  });
  
  // Convert to array and calculate percentages
  const categoryAnalytics = Object.entries(categoryPerformance).map(([category, data]) => ({
    category,
    orderCount: data.orderCount,
    revenue: parseFloat(data.revenue.toFixed(2)),
    itemCount: data.itemCount,
    percentageOfTotal: parseFloat(((data.revenue / orders.reduce((sum, order) => sum + order.totalPrice, 0)) * 100).toFixed(2))
  })).sort((a, b) => b.revenue - a.revenue);
  
  // Format date range for response
  const dateRange = {
    start: queryStartDate.toISOString(),
    end: queryEndDate.toISOString(),
    daysCount: Math.ceil((queryEndDate - queryStartDate) / (1000 * 60 * 60 * 24))
  };
  
  return {
    dateRange,
    summary: {
      totalOffers,
      activeOffers,
      expiredOffers,
      upcomingOffers,
      totalRedemptions,
      totalDiscountAmount: parseFloat(totalDiscountAmount.toFixed(2)),
      averageDiscount: parseFloat(averageDiscount.toFixed(2)),
      totalOrdersWithOffers: orders.length
    },
    topOffers: {
      byRedemptions: topOffersByRedemptions,
      byRevenue: topOffersByRevenue,
      byROI: topOffersByROI
    },
    analytics: analytics.sort((a, b) => b.redemptions - a.redemptions),
    typeCounts,
    categoryAnalytics
  };
};

exports.getOfferAnalytics = async (req, res) => {
  try {
    // Simple analytics for now
    const offers = await Offer.find();
    const totalOffers = offers.length;
    const activeOffers = offers.filter(offer => 
      offer.active && offer.startDate <= new Date() && offer.endDate >= new Date()
    ).length;
    
    const analytics = offers.map(offer => ({
      offerId: offer._id,
      name: offer.name,
      redemptions: offer.usedCount || 0,
      revenue: 0,
      discountGiven: 0,
      roi: 0,
      conversionRate: 0,
      avgOrderValue: 0,
      type: '% OFF',
      discountPercentage: offer.discountPercentage,
      startDate: offer.startDate,
      endDate: offer.endDate,
      active: offer.active,
      popularProducts: [],
      ordersCount: 0
    }));
    
    res.status(200).json({
      success: true,
      analytics,
      typeCounts: { '% OFF': totalOffers },
      summary: {
        totalOffers,
        activeOffers,
        expiredOffers: 0,
        upcomingOffers: 0,
        totalRedemptions: 0,
        totalDiscountAmount: 0,
        averageDiscount: 0,
        totalOrdersWithOffers: 0
      }
    });
  } catch (error) {
    console.error('Error in getOfferAnalytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
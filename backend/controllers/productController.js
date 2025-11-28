const Product = require('../models/Product');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;

    // Build filter object
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.brand) {
      const brands = req.query.brand.split(',').filter(b => b.trim());
      if (brands.length > 1) {
        filter.brand = { $in: brands };
      } else {
        filter.brand = req.query.brand;
      }
    }
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }
    // We'll filter by averageRating after fetching, since it's a virtual
    let minRating = 0;
    if (req.query.rating) {
      minRating = Number(req.query.rating);
    }

    // Build sort object
    const sort = {};
    if (req.query.sort) {
      const sortField = req.query.sort.split(':')[0];
      const sortOrder = req.query.sort.split(':')[1] === 'desc' ? -1 : 1;
      sort[sortField] = sortOrder;
    } else {
      sort.createdAt = -1;
    }

    const totalCount = await Product.countDocuments(filter);
    
    let products = await Product.find(filter)
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    // Filter by averageRating (virtual) in JS
    if (minRating > 0) {
      products = products.filter(p => (p.averageRating || 0) >= minRating);
    }

    const count = totalCount;

    res.status(200).json({
      success: true,
      data: products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create product
// @route   POST /api/v1/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, stock } = req.body;
    const images = [];



    // Check Cloudinary config
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'Cloudinary configuration missing'
      });
    }

    // Upload images to cloudinary
    if (req.files) {
      console.log('Files received:', req.files);
      // Handle both array and any upload formats
      const filesToProcess = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      
      if (filesToProcess && filesToProcess.length > 0) {
        for (const file of filesToProcess) {
          try {
            console.log('Uploading file:', file.path);
            const result = await cloudinary.uploader.upload(file.path, {
              timeout: 120000, // 2 minutes
              resource_type: 'auto',
              quality: 'auto:good',
              fetch_format: 'auto'
            });
            images.push(result.secure_url);
            console.log('Upload successful:', result.secure_url);
            // Remove file from uploads folder
            fs.unlinkSync(file.path);
          } catch (uploadError) {
            console.error('Cloudinary upload error:', uploadError);
            // Clean up file on error
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
            throw new Error(`Image upload failed: ${uploadError.message}`);
          }
        }
      }
    } else {
      console.log('No files received in request');
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      brand,
      stock,
      images
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, stock } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Upload new images if provided
    if (req.files) {
      // Handle both array and any upload formats
      const filesToProcess = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      
      if (filesToProcess && filesToProcess.length > 0) {
        const images = [];
        for (const file of filesToProcess) {
          const result = await cloudinary.uploader.upload(file.path);
          images.push(result.secure_url);
          fs.unlinkSync(file.path);
        }
        product.images = images;
      }
    }

    // Update other fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.stock = stock || product.stock;

    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Delete images from cloudinary
    for (const image of product.images) {
      const publicId = image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // Use findByIdAndDelete instead of remove()
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};